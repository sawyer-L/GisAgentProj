# GIS AI 分析流程详解

本文档追踪从用户点击"运行分析"到结果展示的完整链路，说明每一层做了什么、哪些是我们写的、哪些来自第三方。

---

## 总览流程图

```
用户点击"运行分析"
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  前端 Vue (workspace.ts → agentApi.ts)              │
│  POST /api/agent-tasks/demo                         │
│  body: { prompt, selectedFeature }                  │
│                                                     │
│  ◆ 我们写的: store 逻辑、axios 封装                  │
│  ◆ 第三方: Vue 3 (响应式)、Axios (HTTP)、Vite (构建) │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP
                        ▼
┌─────────────────────────────────────────────────────┐
│  后端 Spring Boot (AgentTaskController)              │
│  接收 prompt + selectedFeature                      │
│                                                     │
│  ◆ 我们写的: Controller 接口定义                     │
│  ◆ 第三方: Spring Web (@RestController)              │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  AgentTaskService.runDemoTask()                     │
│  任务编排：协调 GIS 查询和 AI 调用                    │
│                                                     │
│  ◆ 全部是我们写的                                    │
└───────┬─────────────────────────────┬───────────────┘
        │                             │
        ▼                             ▼
┌──────────────────┐    ┌─────────────────────────────┐
│  GisQueryService │    │  AiGatewayService           │
│                  │    │                             │
│  · nearbyFeatures│    │  · summarize()              │
│  · assessRisk    │    │  · recommendation()         │
│  · buildEvidence │    │  · generalChat()            │
│  · estimateDur   │    │  · callAi()  ← 调 AI 的核心 │
│                  │    │                             │
│  ◆ 全部是我们写的 │    │  ◆ 调用方式是我们写的        │
│  ◆ 数据来自 DB   │    │  ◆ RestClient 是 Spring 的  │
│    或 mock 硬编码 │    │  ◆ API 协议是 Anthropic 定的 │
└──────────────────┘    └──────────────┬──────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────┐
                        │  Anthropic API              │
                        │  POST /v1/messages          │
                        │                             │
                        │  接收 prompt → 返回文字      │
                        │                             │
                        │  ◆ 第三方服务 (Anthropic)    │
                        └─────────────────────────────┘
```

---

## 第一步：前端发起请求

### 调用链

```
用户点击"运行分析"按钮
  → MapWorkbenchView.vue: @click="store.handleSubmit()"
    → workspace.ts: handleSubmit()
      → workspace.ts: runAnalysis()
        → agentApi.ts: runDemoTask({ prompt, selectedFeature })
          → Axios POST /api/agent-tasks/demo
```

### 我们写的

**`workspace.ts` — `runAnalysis()`**

```typescript
async function runAnalysis() {
  isLoading.value = true;
  setAgentStatuses("running");           // 更新 Agent 状态为"规划中/查询中/起草中"

  const { data, source } = await runDemoTask({
    prompt: userPrompt.value,            // 用户输入的文本
    selectedFeature: selectedFeatureName.value  // 当前选中的地图要素名
  });

  applyTaskResponse(data);               // 把结果应用到前端状态
  addHistoryEntry(data, source);         // 保存到历史记录
}
```

**`agentApi.ts` — `runDemoTask()`**

```typescript
export async function runDemoTask(params) {
  const { data } = await http.post<AgentTaskResponse>("/api/agent-tasks/demo", params);
  return { data, source: "AI" };
}
```

### 来自第三方的

| 库 | 提供了什么 |
|---|----------|
| **Axios** | `http.post()` — HTTP POST 请求，自动序列化 JSON、处理响应 |
| **Vue 3** | `ref`、`computed` — 响应式状态管理 |
| **Pinia** | `defineStore` — 全局状态容器 |
| **Vite** | 构建 + 开发服务器 + `/api/*` 代理到 `localhost:8081` |

---

## 第二步：后端接收请求

### 我们写的

**`AgentTaskController.java`**

```java
@PostMapping("/api/agent-tasks/demo")
public AgentTaskDemoResponse demoTask(@RequestBody DemoRequest request) {
    return agentTaskService.runDemoTask(request.prompt(), request.selectedFeature());
}
```

只做路由，把参数转交给 `AgentTaskService`。

### 来自第三方的

| 库 | 提供了什么 |
|---|----------|
| **Spring Web** | `@RestController`、`@PostMapping`、`@RequestBody` — 自动把 HTTP 请求映射到 Java 方法，JSON 反序列化为参数对象 |

---

## 第三步：任务编排

### 我们写的

**`AgentTaskService.java` — `runDemoTask()`**

这是核心编排方法，**所有逻辑都是我们手写的**：

```java
public AgentTaskDemoResponse runDemoTask(String prompt, String selectedFeature) {
    // 1. GIS 查询（不经过 AI）
    List<String> nearbyFeatures = gisQueryService.nearbyFeatures(selectedFeature);
    String riskLevel = gisQueryService.assessRiskLevel(selectedFeature);
    double confidence = gisQueryService.assessConfidence(selectedFeature);
    int estimatedDurationMinutes = gisQueryService.estimateDuration(selectedFeature);
    List<EvidenceItem> evidence = gisQueryService.buildEvidence(selectedFeature, nearbyFeatures);

    // 2. 调 AI 生成自然语言
    String summary = aiGatewayService.summarize(prompt, selectedFeature, nearbyFeatures);
    String recommendation = aiGatewayService.recommendation(selectedFeature, nearbyFeatures);

    // 3. 组装响应
    return new AgentTaskDemoResponse(taskId, ..., summary, recommendation, ...);
}
```

没有用任何 Agent 框架（没有 LangChain、没有 AutoGen），就是普通的 Java 方法调用。

---

## 第四步：GIS 空间查询

### 我们写的

**`GisQueryService.java`** — 全部手写，负责空间数据查询：

```java
// 查询附近要素
public List<String> nearbyFeatures(String selectedFeature) {
    // 优先从 DB 查（PostGIS 空间查询）
    // DB 不可用时 fallback 到 mock 硬编码
}

// 评估风险等级
public String assessRiskLevel(String selectedFeature) {
    // 基于要素名称/属性返回 "High" / "Medium" / "Low"
}

// 构建证据卡片
public List<EvidenceItem> buildEvidence(String selectedFeature, List<String> nearbyFeatures) {
    // 为每个附近要素生成：类别、状态、说明
}
```

### Mock 数据 vs 真实数据

| 场景 | 数据来源 |
|-----|---------|
| DB 可用 + PostGIS | `SpatialFeatureRepository.findNearbyAllLayers()` — Spring Data JPA + PostGIS 空间查询 |
| DB 不可用 | 硬编码的 switch-case，如 `case "滨河泵站" -> List.of("西北排水节点", ...)` |

### 来自第三方的

| 库 | 提供了什么 |
|---|----------|
| **Spring Data JPA** | `SpatialFeatureRepository` 接口，自动生成 SQL |
| **PostGIS** (如果接了) | `findNearbyAllLayers()` 底层的空间距离计算 SQL |

---

## 第五步：调用 AI

### 我们写的

**`AiGatewayService.java`** — AI 调用封装：

```java
// 拼 prompt（这是我们手动拼的字符串模板）
public String summarize(String prompt, String selectedFeature, List<String> nearbyFeatures) {
    String userMessage = String.format(
        "You are a GIS analysis assistant. The user selected '%s' on the map. "
        + "Nearby features: %s. "
        + "User request: %s. "
        + "Provide a concise risk summary in 2-3 sentences.",
        selectedFeature, String.join(", ", nearbyFeatures), prompt
    );
    return callAi(userMessage);
}
```

```java
// 发 HTTP 请求（我们写的调用逻辑）
private String callAi(String userMessage) {
    Map<String, Object> body = Map.of(
        "model", config.getModel(),           // 环境变量读取
        "max_tokens", config.getMaxTokens(),
        "messages", List.of(Map.of("role", "user", "content", userMessage))
    );

    AnthropicResponse response = restClient.post()
        .uri("/v1/messages")
        .header("x-api-key", config.getApiKey())
        .header("anthropic-version", "2023-06-01")
        .body(body)
        .retrieve()
        .body(AnthropicResponse.class);

    return response.content().get(0).text();
}
```

### 来自第三方的

| 库/服务 | 提供了什么 |
|--------|----------|
| **Spring RestClient** | `restClient.post().uri().header().body().retrieve().body()` — 链式 HTTP 客户端，我们只传参数，它负责 TCP 连接、超时、序列化 |
| **Anthropic API** | `/v1/messages` 端点 — 接收 prompt，返回 AI 生成的文字。**请求格式（model、messages、max_tokens）是 Anthropic 协议规定的** |
| **Jackson** | 响应 JSON 自动反序列化为 `AnthropicResponse` record |

### 没有用的东西

- **没有用 Anthropic SDK** — 没有 `anthropic-java` 包，裸 HTTP 调用
- **没有用 LangChain** — 没有 Agent 框架、Chain、Tool 概念
- **没有用 prompt 模板引擎** — 就是 `String.format()` 拼字符串
- **没有 RAG** — 没有向量数据库、没有 embedding，GIS 数据直接以文字形式拼入 prompt

---

## 第六步：返回响应

### 数据流

```
AI 返回的文字 (summary, recommendation)
  + GIS 查询结果 (nearbyFeatures, riskLevel, evidence)
  + 元数据 (taskId, reportTitle, timestamps)
      │
      ▼
AgentTaskDemoResponse (Java record)
      │
      ▼  Jackson 自动序列化
JSON HTTP Response
      │
      ▼  Axios 自动反序列化
AgentTaskResponse (TypeScript interface)
      │
      ▼
前端 applyTaskResponse(data)
  → 更新 result, agentSteps, highlightedFeatureNames
  → UI 重新渲染
```

### 前端状态更新（我们写的）

```typescript
function applyTaskResponse(response: AgentTaskResponse) {
  taskId.value = response.taskId;
  agentSteps.value = response.steps.map(...);    // 更新执行轨迹
  result.value = {                                // 更新分析结果
    summary: response.summary,                    // ← AI 生成的
    highlights: response.nearbyFeatures,          // ← GIS 查询的
    recommendation: response.recommendation,      // ← AI 生成的
    riskLevel: response.riskLevel,                // ← GIS 查询的
    ...
  };
  highlightedFeatureNames.value = [...];          // 地图高亮
  setAgentStatuses("done");                       // Agent 状态 → "已完成/已映射/已生成"
}
```

---

## 自有代码 vs 第三方对照表

| 模块 | 我们写的 | 第三方提供的 |
|------|---------|-------------|
| **HTTP 服务端** | Controller、Service、业务逻辑 | Spring Boot 框架、注解、DI 容器 |
| **HTTP 调用** | 调用逻辑、参数组装、prompt 拼接 | Spring RestClient (HTTP 客户端) |
| **AI 推理** | prompt 内容、调用时机 | Anthropic API (推理能力) |
| **GIS 查询** | 查询逻辑、mock 数据、fallback | PostGIS/Spring Data JPA (如果接了 DB) |
| **JSON 序列化** | 数据结构定义 (record) | Jackson (序列化/反序列化) |
| **前端状态** | store、computed、业务方法 | Vue 3 + Pinia (响应式系统) |
| **前端请求** | 请求函数、参数 | Axios (HTTP) |
| **地图渲染** | 实体绑定、点击处理、管网渲染 | Cesium (3D 地图引擎) |
| **构建工具** | vite.config.ts 配置 | Vite + vite-plugin-cesium |

---

## 关键结论

1. **AI 不知道地图** — 它只看到我们拼好的文字："用户选了 X，附近有 Y、Z，请分析"
2. **空间分析是 Java 做的** — 查附近要素、评估风险、生成证据，都是后端代码逻辑
3. **AI 只做自然语言生成** — 把 GIS 数据转化为可读的摘要和建议
4. **没有用 Agent 框架** — 全是手写的 Java 方法调用链，没有 LangChain / AutoGen 等
5. **没有用 AI SDK** — 裸 HTTP POST 到 Anthropic API，手动拼 JSON、手动解析响应
