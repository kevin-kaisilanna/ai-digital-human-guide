# 灵境智游 · 景区导览 AI 数字人

> 软件杯 A5 赛题参赛作品 · 应用场景：无锡灵山胜境景区
>
> 一套完整的「游客端 App + 管理后台 Web + AI 数字人 + FastAPI 后端」景区导览系统

面向景区场景的 AI 数字人导游：游客用语音或文字提问，数字人「小云」实时回答并配合口型、表情与动作；后台提供知识库管理、游客行为分析、数据大屏与数字人形象配置。

---

## 目录

- [核心功能](#核心功能)
- [界面预览](#界面预览)
- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [快速开始](#快速开始)
- [知识库](#知识库)
- [文档与演示材料](#文档与演示材料)
- [比赛指标达成情况](#比赛指标达成情况)
- [说明](#说明)

---

## 核心功能

| 模块 | 能力 |
|------|------|
| 🎤 多模态交互 | 语音 + 文字双输入，数字人语音播报、口型同步、表情动作反馈 |
| 🧠 智能问答 | 基于 RAG 知识库的精准回答，覆盖景点、历史、路线、票务、餐饮等 |
| 🗺️ 路线推荐 | 6 条预设游览路线，按兴趣标签（亲子 / 文化 / 摄影 / 省力）筛选 |
| 📊 数据大屏 | 实时服务人次、满意度趋势、热门问题排行、游客画像 |
| 📚 知识库管理 | 可视化增删改查，知识即时生效，无需重启服务 |
| 🎭 数字人配置 | 外观、服装、音色、语速可配置，支持预览 |
| 👤 账户体系 | 后台管理员与游客账户分离，登录鉴权 |
| 📱 移动端 | 游客端基于 Capacitor 打包 Android App |

## 界面预览

### 管理后台

| 数据大屏 | 大屏图表 |
|---|---|
| ![数据大屏](docs/screenshots/admin/02-dashboard.jpeg) | ![大屏图表](docs/screenshots/admin/03-dashboard-charts.jpeg) |

| 景区游览 | 知识库管理 |
|---|---|
| ![景区游览](docs/screenshots/admin/06-scenic-tour.jpeg) | ![知识库](docs/screenshots/admin/07-knowledge-base.jpeg) |

| 游客行为分析 | 游客报告 |
|---|---|
| ![行为分析](docs/screenshots/admin/09-behavior-1.jpeg) | ![游客报告](docs/screenshots/admin/11-report-1.jpeg) |

| 数字人配置 | 音色配置 |
|---|---|
| ![数字人配置](docs/screenshots/admin/13-digital-human-config.jpeg) | ![音色配置](docs/screenshots/admin/16-voice-config.jpeg) |

<details>
<summary>展开更多后台截图（共 16 张）</summary>

| 登录 | 首页 |
|---|---|
| ![](docs/screenshots/admin/01-login.jpeg) | ![](docs/screenshots/admin/04-home.jpeg) |

| 首页景区图片 | 账户管理 |
|---|---|
| ![](docs/screenshots/admin/05-home-scenery.jpeg) | ![](docs/screenshots/admin/08-accounts.jpeg) |

| 行为分析（下滑） | 游客报告（下滑） |
|---|---|
| ![](docs/screenshots/admin/10-behavior-2.jpeg) | ![](docs/screenshots/admin/12-report-2.jpeg) |

| 外观选择（棕发） | 外观选择（蓝发） |
|---|---|
| ![](docs/screenshots/admin/14-avatar-brown.jpeg) | ![](docs/screenshots/admin/15-avatar-blue.jpeg) |

</details>

### 游客端

| 登录 | 路线推荐 |
|---|---|
| ![游客端登录](docs/screenshots/visitor/01-login.jpeg) | ![路线推荐](docs/screenshots/visitor/02-route-1.jpeg) |

| 路线详情 | 路线标签筛选 |
|---|---|
| ![路线详情](docs/screenshots/visitor/03-route-2.jpeg) | ![路线筛选](docs/screenshots/visitor/04-route-3.jpeg) |

### 数字人「小云」形象

| 微笑 | 眯眼笑 | 鞠躬 |
|---|---|---|
| ![微笑](docs/screenshots/avatar/03-smile.png) | ![眯眼笑](docs/screenshots/avatar/04-laugh.png) | ![鞠躬](docs/screenshots/avatar/01-bow.jpeg) |

## 系统架构

```mermaid
flowchart LR
    subgraph 用户侧
        A[游客端 App<br/>Vue3 + Capacitor]
        B[管理后台 Web<br/>Vue3 + Element Plus]
    end

    subgraph 数字人
        C[数字人前端<br/>Unity WebGL + Viseme 口型]
    end

    subgraph 服务侧
        D[FastAPI 后端 :8001<br/>24 个 API]
        E[AvatarServer :8000<br/>LLM / STT / TTS 编排]
    end

    subgraph 数据与模型
        F[(SQLite / SQLAlchemy)]
        G[知识库 JSON<br/>74 条]
        H[Claude API / 文心千帆]
        I[Edge-TTS / 百度语音]
    end

    A --> D
    A --> C
    B --> D
    D --> F
    D --> G
    D --> E
    E --> H
    E --> I
    C --> D
```

**三层降级设计**：AI 回答优先 Claude API，失败降级文心千帆，再降级本地 Mock 预制回答（30+ 条）；TTS 优先服务端合成，失败降级浏览器 Web Speech API —— 保证比赛现场断网也能完整演示。

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia + Chart.js |
| 移动端 | Capacitor 6（Android 打包） |
| 数字人 | Unity WebGL + CSS 表情动作 + Viseme 口型时间轴 |
| 后端 | Python 3.10+ / FastAPI + SQLAlchemy + SQLite |
| AI | Claude API / 文心千帆 ERNIE / Mock 三层降级 |
| 语音 | Edge-TTS + 百度语音（ASR/TTS）+ Web Speech API |

## 目录结构

```
ai-digital-human-guide/
├── admin-web/          # 管理后台（5 个页面：数据大屏 / 知识库 / 游客报告 / 数字人配置）
├── visitor-app/        # 游客端（对话 + 路线推荐 + 个人中心，含 Capacitor Android 工程）
├── digital-human/      # 数字人前端（Unity WebGL 资源、TTS 驱动、Viseme 口型）
├── server/             # FastAPI 后端（24 个 API 接口、RAG 检索、鉴权）
├── affiliate-project/  # AvatarServer：LLM / STT / TTS 编排服务
├── data-pipeline/      # 知识库与景点数据导入流水线
├── src/data/           # 知识库 JSON（74 条）
├── shared/             # 共享类型定义、工具函数、API 常量
├── config/             # 全局配置（模型参数）
├── scripts/            # 一键启动脚本
├── prototype/          # 早期后台原型（单文件 HTML Demo）
├── docs/               # PRD、接口集成、构建计划、部署手册、截图、PPT、设计文档
└── data/reference/     # 灵山胜境景区公开参考资料（只读）
```

## 快速开始

### 环境要求

- Node.js 18+ / npm 9+
- Python 3.10+

### 一键启动

```bash
# Windows
scripts\run.bat
```

### 分服务启动

| 服务 | 命令 | 端口 |
|---|---|---|
| FastAPI 后端 | `cd server && python main.py` | 8001 |
| AvatarServer | `cd affiliate-project/AvatarServer && python main.py` | 8000 |
| 游客端 | `cd visitor-app && npm install && npm run dev` | 5173 |
| 管理后台 | `cd admin-web && npm install && npm run dev` | 5174 |

访问地址：

- 游客端 http://localhost:5173
- 管理后台 http://localhost:5174（默认账号 `admin` / `admin123`）
- API 文档 http://localhost:8001/docs

### 环境变量

复制 `.env.example` 为 `.env`，填入自己的密钥；**不填也能跑**，设置 `MOCK_MODE=true` 即进入离线演示模式。

```bash
cp .env.example .env
```

详细步骤见 [部署和使用手册](docs/部署和使用手册.md)。

## 知识库

| 文件 | 条目 | 内容 |
|------|------|------|
| `knowledge-spots.json` | 22 | 灵山胜境 16 景点 + 拈花湾 6 景点 |
| `knowledge-guide.json` | 8 | 景区指南 / 历史 / 文化 / 贴士 |
| `knowledge-history.json` | 8 | 历史文化专题 |
| `knowledge-routes.json` | 6 | 游览路线 + 实用贴士 |
| `knowledge-faq.json` | 30 | 常见问答全覆盖 |

所有回答内容均与 `data/reference/` 下的景区公开资料保持一致。

## 文档与演示材料

| 材料 | 位置 |
|---|---|
| 产品需求文档（PRD） | [docs/PRD.md](docs/PRD.md) |
| 部署和使用手册 | [docs/部署和使用手册.md](docs/部署和使用手册.md) |
| 接口集成说明 | [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md) |
| 构建计划 | [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) |
| 项目计划书 | [docs/项目计划书.txt](docs/项目计划书.txt) |
| 产品方案介绍 PPT | [docs/media/灵境智游-产品方案介绍PPT.pptx](docs/media/灵境智游-产品方案介绍PPT.pptx) |
| 产品总体设计文档 | [docs/media/灵境智游-产品总体设计文档.docx](docs/media/灵境智游-产品总体设计文档.docx) |
| **演示视频（144 MB）** | 见 [Releases](../../releases) 页面附件 |
| **可运行完整包 / 源码归档** | 见 [Releases](../../releases) 页面附件 |

## 比赛指标达成情况

| 指标 | 要求 | 实现方式 |
|---|---|---|
| 语音问答响应 | < 5 s | Prompt caching + 流式输出 + TTS 流式合成 |
| 事实性准确率 | ≥ 90% | 74 条结构化知识库 + 关键词/向量混合检索 |
| 可用性 | 7×24 | AI / TTS 双层多级降级 + Mock 兜底 |
| 口型同步 | 需支持 | TTS 输出生成 Viseme 时间轴驱动 Unity 模型 |
| 表情适配 | 需自然 | 按回答语义分类（欢迎 / 讲解 / 致歉 / 告别）匹配动作 |

## 说明

- 代码中的 API Key 一律通过环境变量注入，仓库不含任何真实密钥。
- `data/reference/` 中的景区资料仅用于本作品的知识库构建，版权归原景区所有。
- Unity WebGL 构建产物（`public/Unity/Build/`）为可运行资源，克隆后无需重新构建即可演示数字人。
