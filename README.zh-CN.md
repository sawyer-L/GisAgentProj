# 智慧管网运营指挥平台

[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6db33f?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Cesium](https://img.shields.io/badge/CesiumJS-1.131+-0078d4)](https://cesium.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk)](https://openjdk.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> AI 驱动的 3D 智慧管网可视化与运营分析平台。集成 Cesium 三维地形、建筑白膜、地下管网发光渲染、GIS 空间查询与 AI 智能分析。

[English](README.md)

## 核心功能

- **3D 地形 + 建筑白膜** — Cesium World Terrain + OSM Buildings 半透明白色渲染
- **地下管网可视化** — 供水/排水/燃气管网，带发光效果，可穿透建筑查看（X 光模式）
- **GIS AI 分析** — 点击地图要素，AI 自动分析附近风险点，生成结构化报告
- **通用 AI 对话** — 切换模式，直接与 AI 自然语言对话
- **多 Agent 协作** — 规划 Agent、GIS 分析师、报告 Agent 依次执行
- **任务历史** — 分析结果自动保存，支持快照回溯

## 效果展示

| 3D 管网可视化 | AI 分析结果 |
|:------------:|:----------:|
| ![系统总览](docs/system_display.png) | ![AI 分析](docs/ai_result_display.png) |
| *三维地形、建筑白膜、地下管网发光渲染* | *GIS AI 分析报告与风险评估* |

## 系统架构

```
┌──────────────────────────────────────────────────────┐
│  前端 (Vue 3 + Vite + TypeScript + CesiumJS)         │
│  3D 地图 · 管网渲染 · AI 对话面板 · 报告弹窗         │
└───────────────────────┬──────────────────────────────┘
                        │ HTTP REST
                        ▼
┌──────────────────────────────────────────────────────┐
│  后端 (Spring Boot 3.4 + Java 17)                    │
│  Agent 编排 · AI 网关 · GIS 查询 · 报告生成          │
└───────┬─────────────────────────────────┬────────────┘
        │                                 │
        ▼                                 ▼
┌──────────────────┐          ┌───────────────────────┐
│ PostgreSQL       │          │ Anthropic API         │
│ + PostGIS        │          │ (Mimo 兼容)           │
│ (可选，有 mock   │          │ 仅做自然语言生成       │
│  fallback)       │          │                       │
└──────────────────┘          └───────────────────────┘
```

**关键设计：** 空间分析（距离查询、风险评估、证据构建）在 Java 后端完成，AI 只接收结构化文字 prompt 做自然语言生成。

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
# 可选：设置 AI API Key（不设则使用 mock 模式）
export AI_API_KEY="your-api-key"
export AI_BASE_URL="https://api.anthropic.com"

./gradlew bootRun
# 后端运行在 http://localhost:8081
```

### Docker 全栈部署

```bash
cp .env.example .env
# 编辑 .env 填入 API Key
docker-compose up --build
# 访问 http://localhost
```

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Vue 3、Vite、TypeScript、Pinia、CesiumJS |
| 后端 | Spring Boot 3.4、Java 17、Gradle |
| 数据库 | PostgreSQL + PostGIS（可选，有 mock fallback） |
| AI | Anthropic API（Mimo 兼容） |
| 部署 | Docker Compose、Nginx 反向代理 |

## 项目结构

```
├── frontend/                # Vue 3 + Cesium 前端
│   ├── src/
│   │   ├── components/      # MapCanvas 3D 地图组件
│   │   ├── composables/     # usePipeNetwork 管网发光渲染
│   │   ├── config/          # Cesium Ion 令牌配置
│   │   ├── data/            # Mock 空间数据 + 管网数据
│   │   ├── services/        # API 请求封装 (axios)
│   │   ├── stores/          # Pinia 状态管理
│   │   └── views/           # 主工作台视图
│   └── Dockerfile
├── backend/                 # Spring Boot 后端
│   └── src/main/java/.../
│       ├── agent/           # 任务编排
│       ├── ai/              # AI 网关
│       ├── api/             # REST 接口
│       ├── gis/             # GIS 空间查询
│       └── report/          # 报告生成
│   └── Dockerfile
├── docs/                    # 文档
├── mock-data/               # GeoJSON 示例数据
└── docker-compose.yml
```

## AI 分析流程

```
用户点击地图要素 → 前端发送要素名
  → 后端查询附近 GIS 要素（PostGIS 或 mock）
  → 拼接 prompt："用户选了 X，附近有 Y、Z，请分析..."
  → 发送给 Anthropic API → 返回自然语言
  → 组装响应：风险等级、证据卡片、高亮目标
  → 前端在地图 + 报告面板中渲染结果
```

详见 [docs/AI_Explain.md](docs/AI_Explain.md)

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `AI_API_KEY` | Anthropic API Key | 空（mock 模式） |
| `AI_BASE_URL` | API 地址 | `https://api.anthropic.com` |
| `AI_MODEL` | 模型名 | `claude-sonnet-4-20250514` |
| `AI_MAX_TOKENS` | 最大 token | `1024` |
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion 令牌 | 内置默认值 |

## 文档

- [系统架构](docs/system-architecture.md)
- [AI 分析流程详解](docs/AI_Explain.md)
- [本地运行指南](docs/local-run-guide.md)
- [部署手册](docs/deployment-runbook.md)

## 开源协议

[MIT](LICENSE)
