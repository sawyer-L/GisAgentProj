# 智慧管网运营指挥平台 (Smart Pipeline Operations Platform)

AI + GIS + 3D 可视化的智慧管网运营分析平台。

## 功能

- **3D 地形 + 建筑白膜** — Cesium World Terrain + OSM Buildings
- **地下管网可视化** — 供水/排水/燃气管网，带发光效果，可穿透建筑查看
- **GIS AI 分析** — 点击地图要素，AI 自动分析附近风险点并生成报告
- **通用 AI 对话** — 切换模式，直接与 AI 自然语言对话
- **Agent 工作流** — 规划 Agent、GIS 分析师、报告 Agent 协同执行
- **任务历史** — 分析结果自动保存，可回溯查看

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Vue 3 + Vite + TypeScript + Pinia + CesiumJS |
| 后端 | Spring Boot 3.4 + Java 17 + Gradle |
| 数据库 | PostgreSQL + PostGIS (可选，有 mock fallback) |
| AI | Anthropic API (Mimo 兼容) |
| 部署 | Docker Compose + Nginx |

## 快速启动

### 前端

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

### 后端

```bash
cd backend
# 设置 AI API Key (可选，不设则使用 mock 模式)
export AI_API_KEY="your-api-key"
export AI_BASE_URL="https://api.anthropic.com"

./gradlew bootRun
# 后端运行在 http://localhost:8081
```

### Docker (全栈)

```bash
cp .env.example .env
# 编辑 .env 填入 API Key
docker-compose up --build
# 访问 http://localhost
```

## 项目结构

```
├── frontend/          # Vue 3 + Cesium 前端
│   ├── src/
│   │   ├── components/    # MapCanvas 地图组件
│   │   ├── composables/   # usePipeNetwork 管网渲染
│   │   ├── config/        # Cesium Ion 配置
│   │   ├── data/          # Mock 空间数据 + 管网数据
│   │   ├── services/      # API 请求封装
│   │   ├── stores/        # Pinia 状态管理
│   │   └── views/         # 主页面视图
│   └── Dockerfile
├── backend/           # Spring Boot 后端
│   └── src/main/java/com/gisagentproj/backend/
│       ├── agent/         # 任务编排
│       ├── ai/            # AI 网关
│       ├── api/           # REST 接口
│       ├── gis/           # GIS 空间查询
│       └── report/        # 报告生成
│   └── Dockerfile
├── docs/              # 文档
├── mock-data/         # GeoJSON 示例数据
└── docker-compose.yml
```

## AI 分析流程

```
用户点击地图 → 前端发送选中要素名
  → 后端查询附近 GIS 要素
  → 拼接 prompt 发给 AI
  → AI 返回自然语言分析
  → 组装结果返回前端展示
```

详见 [docs/AI_Explain.md](docs/AI_Explain.md)

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `AI_API_KEY` | Anthropic API Key | 空 (mock 模式) |
| `AI_BASE_URL` | API 地址 | `https://api.anthropic.com` |
| `AI_MODEL` | 模型名 | `claude-sonnet-4-20250514` |
| `AI_MAX_TOKENS` | 最大 token | `1024` |
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion Token | 内置默认值 |

## 文档

- [系统架构](docs/system-architecture.md)
- [AI 分析流程详解](docs/AI_Explain.md)
- [本地运行指南](docs/local-run-guide.md)
- [部署手册](docs/deployment-runbook.md)
