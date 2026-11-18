# 景区导览 AI 数字人 — 构建路线

## 核心原则

1. **依赖倒推** — 先做被依赖的，再做依赖别人的
2. **并行最大化** — 两人各自独立模块同时开工
3. **Mock 先行** — 接口先写死数据，不等对方完成
4. **核心路径优先** — 最短链路 `知识库 → AI对话 → 游客端UI` 必须最先打通

## 依赖链

```
参考数据 → RAG知识库 → AI问答 → Chat API → 游客端对话界面
                                                      ↓
                                              TTS语音 + 口型
管理后台大屏 ──→ 需要统计数据 ──→ 需要先有对话记录
管理后台知识库 ──→ 需要知识库 CRUD API
管理后台报告 ──→ 需要分析模块 ──→ 需要对话数据
```

## 技术选型

| 决策 | 选择 | 理由 |
|------|------|------|
| 前端 | Vue 3 + Vite + TypeScript | 中文社区活跃，组合式 API 清晰 |
| 后端 | Python FastAPI | 自动 OpenAPI 文档，async 支持 |
| 数据库 | SQLite | 比赛零配置，一句换 PostgreSQL |
| 向量库 | chromadb | 嵌入式中文友好，`pip install` 即用 |
| 前端状态 | Pinia | Vue 3 官方推荐 |
| 图表 | Chart.js 4.4.7 | 原型已验证，CDN 稳定 |
| TTS | edge-tts | 免费 + 中文 + viseme 输出 |
| Mock | 前端硬编码 → 一行切换 API | 各自独立推进 |

---

## 分工总览

```
         Person A (前端)              Person B (后端)
Phase 1  ─────────── 两人一起：脚手架 + 数据 + 数据库 ───────────
Phase 2  admin-web 三个页面(UI+mock)  knowledge API + RAG + AI + Chat
           │                              │
Phase 3  visitor-app 对话界面           TTS + Viseme + Analytics
           │  对接 Chat API               │  Dashboard API
           │  数字人展示组件               │  Reports API
           └────────── 联调 ──────────────┘
Phase 4  路线UI + 报告UI + 适配      路线API + PDF导出
```

---

# Phase 1: 基础设施（1 天，两人一起）

**目标**：开发环境跑通，参考数据就位，数据库建表。

## 1.1 Person A — admin-web Vue 脚手架（上午 2h）

### 操作步骤

```bash
cd d:\action\admin-web
npm create vue@latest .
# 选项：TypeScript √, JSX ×, Router √, Pinia √, Vitest ×, ESLint ×
npm install
npm install chart.js chartjs-plugin-datalabels
npm run dev
```

### 产出文件

| 文件 | 内容 |
|------|------|
| `admin-web/src/styles/variables.css` | 从 `index.html` `:root` 中拷贝全部 CSS 变量 |
| `admin-web/src/styles/global.css` | 全局重置 + 基础排版 |
| `admin-web/src/router/index.ts` | 5 条路由：`/` → Dashboard, `/knowledge` → Knowledge, `/digital-human` → DigitalHuman, `/reports` → Reports, `/settings` → Settings |
| `admin-web/src/App.vue` | 两栏布局：`<Sidebar />` + `<router-view />` |
| `admin-web/src/components/layout/Sidebar.vue` | 深色侧边栏：Logo + 5 导航项 + 底部用户信息 |
| `admin-web/src/components/layout/Header.vue` | 顶部栏：页面标题 + 日期时间 + 刷新按钮 |
| `admin-web/src/pages/DashboardPage.vue` | 骨架：`<template><div>📊 数据大屏</div></template>` |
| `admin-web/src/pages/KnowledgePage.vue` | 骨架：`<template><div>📚 知识库管理</div></template>` |
| `admin-web/src/pages/DigitalHumanPage.vue` | 骨架：`<template><div>🧑 数字人形象</div></template>` |
| `admin-web/src/pages/ReportsPage.vue` | 骨架：`<template><div>📋 游客报告</div></template>` |
| `admin-web/src/pages/SettingsPage.vue` | 骨架：`<template><div>⚙️ 系统设置</div></template>` |

### 验收

浏览器 `localhost:5173` → 左侧 5 个导航项 → 点击后 URL 变化，右侧内容区切换对应页面。

---

## 1.2 Person B — server FastAPI 骨架 + 数据库（上午 2h）

### 操作步骤

```bash
cd d:\action\server
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy chromadb python-docx openpyxl python-dotenv
pip freeze > requirements.txt
```

### 产出文件

| 文件 | 内容 |
|------|------|
| `server/main.py` | FastAPI 入口：CORS 全开（`allow_origins=["*"]`），注册路由，`/api/health` 返回 `{"status":"ok"}` |
| `server/app/__init__.py` | 空 |
| `server/app/config/settings.py` | 从 `.env` 读 `DATABASE_URL`（默认 `sqlite:///./scenic.db`）、`CLAUDE_API_KEY`、`TTS_API_KEY` |
| `server/app/db/database.py` | `create_engine` + `SessionLocal` + `Base` + `get_db` 依赖注入 |
| `server/app/models/__init__.py` | 导入所有模型 |
| `server/app/models/knowledge.py` | `KnowledgeEntry` 表：id, title, content, category(Enum), tags(JSON), source, source_file, created_at, updated_at |
| `server/app/models/conversation.py` | `Conversation` 表：id, session_id, visitor_id, messages(JSON), created_at, updated_at |
| `requirements.txt` | 已冻结依赖列表 |

### 关键代码片段

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base

app = FastAPI(title="景区导览 AI 数字人 API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### 验收

- `python main.py` 启动，终端输出 `Uvicorn running on http://0.0.0.0:8000`
- 浏览器 `localhost:8000/api/health` → `{"status":"ok"}`
- 项目目录出现 `scenic.db` 文件
- 浏览器 `localhost:8000/docs` → Swagger 自动文档页

---

## 1.3 两人一起 — data-pipeline 解析参考数据（下午 1.5h）

### 操作步骤

```bash
cd d:\action\data-pipeline
pip install python-docx openpyxl
```

### 产出文件

| 文件 | 内容 |
|------|------|
| `data-pipeline/parsers/word_parser.py` | `parse_docx(filepath) → list[dict]`：按段落拆分为 `[{title, content, index}]`，过滤空行 |
| `data-pipeline/parsers/excel_parser.py` | `parse_xlsx(filepath) → list[dict]`：按行读取，第一行做 key，输出 `[{col: val}]` |
| `data-pipeline/main.py` | CLI 入口：循环调用两个 parser，输出 JSON 到 `src/data/` |
| `src/data/knowledge-history.json` | 解析自"历史、文化、景点特色与个性化游览指南.docx" |
| `src/data/knowledge-spots.json` | 解析自"景点结构化数据集.docx" |
| `src/data/visitor-analytics-summary.json` | 解析自"景点景区旅游数据行为分析数据.xlsx"（统计摘要，不存全量 14 万行） |

### 验收

- 三份 JSON 文件已生成
- `knowledge-history.json` 有 40-80 条章节段落
- `knowledge-spots.json` 有 16+ 条景点结构化记录
- `visitor-analytics-summary.json` 有列名、行数、前 5 条样本

---

## 1.4 两人一起 — 数据库建表 + 导入种子数据（下午 1.5h）

### 操作步骤

- B 写好 `server/app/db/seed.py`：读取 `src/data/knowledge-spots.json` → 逐条写入 `knowledge_entry` 表
- A 运行 `python -m app.db.seed` 确认数据入库
- A 用 SQLite Browser 或命令行确认表中有数据

### 验收

```bash
sqlite3 scenic.db "SELECT COUNT(*) FROM knowledge_entry;"
# → 16+
sqlite3 scenic.db "SELECT title FROM knowledge_entry LIMIT 3;"
# → 灵山大照壁, 五明桥, 佛足坛
```

---

## Phase 1 收尾（傍晚 0.5h，一起）

1. `git init && git add -A && git commit -m "feat: Phase 1 基础设施完成"`
2. `.gitignore` 已排除 `node_modules/`, `venv/`, `.env`, `scenic.db`, `示范景区公开资料包/`
3. 互查：B 拉 A 的前端能 `npm install && npm run dev` 跑起来，A 拉 B 的后端能 `pip install -r requirements.txt && python main.py` 跑起来

### Phase 1 硬性验收标准（全部达成才能进入 Phase 2）

- [ ] `localhost:5173` 管理后台骨架可见，5 页面路由正常
- [ ] `localhost:8000/api/health` 返回 `{"status":"ok"}`
- [ ] `src/data/` 下三份 JSON 可读
- [ ] SQLite `scenic.db` 中 `knowledge_entry` 表有 16+ 条记录
- [ ] 两人各自拉代码后都能跑通

---

# Phase 2: 核心能力（2-3 天，并行）

**目标**：AI 端到端回答问题；管理后台页面 UI 完成（mock 数据）。

## 2A Person A — 管理后台 UI

### 2A.1 Dashboard 页面（1 天）

**对应 PRD 4.2.4**

| 组件 | 任务 |
|------|------|
| `KpiCard.vue` | Props: `{ label, value, change, icon, color }`。彩色圆角图标 + 大数字 + 环比箭头。mock 数据写死在页面中 |
| `WeeklyTrendChart.vue` | Chart.js 柱状图：7 天数据，`#4f6ef6` 色，圆角柱 |
| `SatisfactionChart.vue` | Chart.js 折线图：满意(绿)/中性(黄)/不满(红) 三条线，`tension:0.4` |
| `SpotPopularityChart.vue` | Chart.js 横向柱状图：6 个景点，`indexAxis:'y'` |
| `CategoryDoughnutChart.vue` | Chart.js 环形图：5 个类别百分比 |
| `TopQuestionsTable.vue` | Props: `{ questions }`。排名/问题/次数/满意度四列 |

**Mock 数据格式**（每个组件接收 props，父组件写死数据）：

```typescript
// 示例：DashboardPage.vue <script setup>
const kpis = [
  { label: '今日服务人次', value: 1286, change: 12.5, icon: '👥', color: 'blue' },
  // ...
]
const weeklyTrend = [1102, 1286, 1350, 1420, 1580, 1820, 1680]
// ...
```

### 2A.2 Knowledge 页面（1 天）

**对应 PRD 4.2.1**

| 组件 | 任务 |
|------|------|
| `KnowledgeTree.vue` | Props: `{ categories }`。左侧分类列表，点击高亮，emit `select` 事件。mock 数据：6 个分类 + 计数 |
| `KnowledgeTable.vue` | Props: `{ entries }`。表格：标题/分类标签/来源/更新时间/编辑删除按钮。emit `edit`, `delete` 事件 |
| `KnowledgeEditor.vue` | 弹窗/抽屉：标题输入、分类下拉、内容 textarea。Props: `{ visible, entry }`。emit `save`, `cancel` |
| `KnowledgePage.vue` | 组合以上组件 + 搜索输入框 + 上传按钮（UI 占位） |

### 2A.3 样式迁移（0.5 天）

- 把 `index.html` 中的 `:root` 变量、按钮样式（`.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm`, `.btn-danger`）、卡片样式（`.kpi-card`, `.chart-card`, `.table-wrap`）、表格样式迁移到各 Vue 组件的 `<style scoped>` 或 `variables.css`
- 管理后台 5 个页面视觉上接近 `index.html` 原型

---

## 2B Person B — 后端核心

### 2B.1 Knowledge CRUD API（0.5 天）

**路由**：`server/app/routes/knowledge_routes.py`

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/knowledge` | 分页查询：`?category=&page=1&pageSize=20` |
| `GET` | `/api/knowledge/{id}` | 单条详情 |
| `POST` | `/api/knowledge` | 新建知识（title, content, category, tags） |
| `PUT` | `/api/knowledge/{id}` | 编辑知识 |
| `DELETE` | `/api/knowledge/{id}` | 删除知识 |
| `GET` | `/api/knowledge/categories` | 返回分类树（含计数） |
| `POST` | `/api/knowledge/search` | 全文搜索：`{"query":"李白"}` |

**Pydantic Schema**：`server/app/schemas/knowledge.py` — `KnowledgeCreate`, `KnowledgeUpdate`, `KnowledgeResponse`

**验收**：Postman / Swagger 中测试全部 7 个接口 CRUD 正常。

### 2B.2 RAG 检索器（0.5 天）

**文件**：`server/app/modules/knowledge/rag_retriever.py`

**方案选择**（根据环境决定）：

| 方案 | 适用场景 | 实现 |
|------|---------|------|
| **A. chromadb（推荐）** | 有网络，追求质量 | `pip install chromadb` → 文本分块 → `Claude Embedding API` 向量化 → 存入 chroma → 查询时相似度检索 top-K |
| **B. TF-IDF（兜底）** | 离线/网络差 | `sklearn.feature_extraction.text.TfidfVectorizer` → 本地计算余弦相似度 |

**关键函数**：

```python
# rag_retriever.py
def build_index(knowledge_entries: list[KnowledgeEntry]) -> None:
    """启动时或知识更新时重建索引"""

def retrieve(query: str, top_k: int = 3) -> list[KnowledgeEntry]:
    """输入用户问题，返回最相关 K 条知识"""
```

**验收**：`retrieve("望岳亭是谁建的")` 返回 3 条相关条目，第一条包含"王明远"或"乾隆年间"。

### 2B.3 AI 模块（1 天）

**文件**：`server/app/modules/ai/claude_client.py`

**核心函数**：

```python
async def chat_stream(
    user_message: str,
    context: list[KnowledgeEntry],  # RAG 检索结果
    history: list[dict],            # 近 5 轮对话
) -> AsyncGenerator[str, None]:
    """流式调用 Claude API，逐个 token yield"""
```

**Prompt 模板**：`server/app/modules/ai/prompt_templates.py`

```
系统提示词：
你是"小云"，灵山胜境景区的AI数字人导游。
回答规则：
- 用亲切口语，像真人导游聊天，不念百科
- 回答 100-200 字，简洁有趣
- 讲历史时庄重、讲传说时神秘、讲趣事时微笑
- 末尾用 [emotion:xxx] 标记表情：(smile/serious/curious/warm)
- 以下知识来自景区数据库，优先使用：
{context}
- 如果知识库没有相关信息，诚实说"这个问题我还在学习，建议您问游客中心的工作人员"
```

**SSE 路由**：`POST /api/chat/send`

```python
@router.post("/chat/send")
async def send_message(req: SendMessageRequest):
    context = rag_retriever.retrieve(req.content, top_k=3)
    return StreamingResponse(
        chat_stream(req.content, context, history),
        media_type="text/event-stream"
    )
```

**验收**：`curl -X POST localhost:8000/api/chat/send -d '{"content":"望岳亭是谁建的"}'` → 流式返回 AI 回答，末尾带 `[emotion:serious]`。

### 2B.4 Chat 模块（0.5 天）

**文件**：`server/app/modules/chat/chat_service.py`

**对话流水线**：

```
用户消息 → RAG检索 → AI回复(SSE流式) → 存入对话记录 → 返回
```

**会话管理**：`server/app/modules/chat/session_manager.py`

- `create_session(visitor_id) → session_id`
- `get_history(session_id) → list[message]`（最近 10 条）
- 首次进入返回默认打招呼消息："你好！我是你的AI导游小云 👋"

**验收**：连续发送两条消息（第一条问塔多高，第二条问"那是什么时候建的"），AI 能理解"那"的指代。

---

## Phase 2 收尾验收

- [ ] A：管理后台 Dashboard / Knowledge / DigitalHuman 三个页面 UI 完成（mock 数据）
- [ ] B：`POST /api/chat/send` 端到端返回 AI 流式回答
- [ ] B：知识库 CRUD 可用，新增条目后立刻被 RAG 检索到
- [ ] B：多轮对话上下文能衔接（指代消解）

---

# Phase 3: 前后端联调（2 天，并行）

**目标**：游客端能对话，管理后台接入真实数据。

## 3A Person A — 游客端 App + 管理后台接入

### 3A.1 visitor-app 脚手架（0.5 天）

```bash
cd d:\action\visitor-app
npm create vue@latest .
npm install chart.js pinia vue-router
```

### 3A.2 Chat 对话组件（1 天）

**对应 PRD 4.1.1**

| 组件 | 任务 |
|------|------|
| `ChatBubble.vue` | Props: `{ message }`。三种样式：AI 文字（左对齐白底）、用户文字（右对齐蓝底）、用户语音（"🎤 语音 5''"） |
| `ChatInput.vue` | 文字输入框 + 发送按钮。Enter 发送，输入框自动 focus |
| `VoiceButton.vue` | 圆形按钮，`mousedown`→开始录音（`MediaRecorder API`），`mouseup`→停止上传。录制时按钮脉冲动画 |
| `HomePage.vue` | 上半 ~60%：数字人展示区 + 打招呼文字。下半 ~40%：`ChatBubble` 列表 + `ChatInput` + `VoiceButton` |

**Chat Store**（`stores/chat-store.ts`）：

```typescript
interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean       // AI 回复中
  isRecording: boolean
  sessionId: string | null
}
// actions: sendMessage(text), sendVoice(audioBlob), loadHistory(sessionId)
```

**对接后端**（`services/chat-service.ts`）：

```typescript
async function sendMessage(text: string, sessionId: string): Promise<ReadableStream> {
  const response = await fetch('http://localhost:8000/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text, sessionId, type: 'text' })
  })
  return response.body // SSE 流
}
```

前端逐 token 渲染：读取 SSE → `message.content += chunk` → 自动滚动到底部。

### 3A.3 DigitalHuman 展示组件（0.5 天）

**对应 PRD 4.1.1**

| 组件 | 任务 |
|------|------|
| `DigitalHuman.vue` | 渐变背景 + 半身头像（圆形 div + emoji），AI 说话时 `avatar-speak` CSS class 触发脉冲动画 |
| `ExpressionLayer.vue` | Props: `{ emotion }`。根据 `smile/serious/curious/warm/surprised` 切换表情 emoji 和背景色 |

**表情映射**：

```typescript
const emotionMap = {
  smile:     { emoji: '😊', bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  serious:   { emoji: '🤔', bg: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
  curious:   { emoji: '🧐', bg: 'linear-gradient(135deg,#134e5e,#71b280)' },
  warm:      { emoji: '😄', bg: 'linear-gradient(135deg,#fceabb,#f8b500)' },
  surprised: { emoji: '😮', bg: 'linear-gradient(135deg,#ec4899,#8b5cf6)' },
}
```

AI 回复中检测 `[emotion:xxx]` 标记 → 更新表情 → 移除标记文本。

### 3A.4 管理后台接入真实 API（0.5 天）

- `DashboardPage.vue`：`onMounted` 调 `/api/analytics/dashboard`，替换 mock 数据
- `KnowledgePage.vue`：调 `/api/knowledge` CRUD 接口，替换 mock 数据

---

## 3B Person B — TTS + 分析模块

### 3B.1 TTS 模块（1 天）

**文件**：`server/app/modules/tts/tts_service.py`

**方案**：`edge-tts`（微软免费 TTS，中文自然度高，支持 viseme）

```bash
pip install edge-tts
```

```python
import edge_tts

async def text_to_speech(text: str, voice: str = "zh-CN-XiaoxiaoNeural") -> bytes:
    """文本 → MP3 音频字节"""
    communicate = edge_tts.Communicate(text, voice)
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return audio_data
```

**集成到 Chat**：AI 回复完成后 → `text_to_speech(reply_text)` → Base64 编码 → 通过 SSE 最后一个事件返回 `{"type":"audio","data":"base64..."}`。

### 3B.2 Viseme 生成器（0.5 天）

**文件**：`server/app/modules/tts/viseme_generator.py`

`edge-tts` 支持 `--words` 参数输出每个字的起止时间。可以用 viseme 映射表转为口型帧：

```python
# 简化方案：根据音频总时长均匀生成开合口型帧
def generate_visemes(audio_duration_ms: int, frame_interval: int = 100) -> list[dict]:
    """每 100ms 生成一帧：{time: ms, visemeId: 0(闭) 或 1(开)}"""
    frames = []
    for t in range(0, audio_duration_ms, frame_interval):
        # 简单的正弦波模拟开合
        viseme_id = 1 if int(t / 200) % 2 == 0 else 0
        frames.append({"time": t, "visemeId": viseme_id})
    return frames
```

**前端消费**：`LipSyncOverlay.vue` 根据 viseme 帧数组，用 `setTimeout` 逐帧切换嘴型 CSS（闭口/半开/全开）。

### 3B.3 Analytics 模块（0.5 天）

**文件**：`server/app/modules/analytics/stats_service.py`

**Dashboard API**（`GET /api/analytics/dashboard`）：

```python
async def get_dashboard_stats():
    conversations = await db.query(Conversation).all()
    return {
        "todayVisitors": len(set(c.visitor_id for c in today_convs)),
        "todayVisitorsChange": 12.5,  # 先写死对比值
        "weeklyVisitors": len(weekly_convs),
        "onlineUsers": get_online_count(),  # 活跃 WebSocket 连接数
        "satisfaction": calculate_satisfaction(conversations),  # 正面/(正面+负面)
        "knowledgeCount": await db.query(KnowledgeEntry).count(),
        "weeklyTrend": [...],
        "topQuestions": [...],
        "spotPopularity": [...],
    }
```

### 3B.4 Reports API（0.5 天）

**文件**：`server/app/modules/analytics/report_generator.py`

`GET /api/analytics/reports`：

```python
{
    "sentimentTrend": [{"date":"5/4","positive":88,...}],  # 7 天
    "topQuestions": [{"rank":1,"question":"...","count":328,...}],  # Top 10
    "categoryDistribution": [{"category":"历史文化","percentage":35},...],
    "suggestions": [
        {"level":"warning","content":"最近10位游客询问'后山步道'，知识库暂无此信息"},
        ...
    ],
    "queryLogs": [{"time":"14:32","visitorId":"V8872","question":"...","sentiment":"positive"},...]
}
```

---

## Phase 3 收尾验收

- [ ] 游客端：打字发送 → 流式显示 AI 回答 → 数字人表情随 `[emotion:xxx]` 切换 → 回答结束播放 TTS 音频
- [ ] 语音输入：按住说话 → 松开上传 → ASR 转写 → 显示文字气泡 → AI 回复
- [ ] 管理后台 Dashboard：KPI 数据来自真实对话记录
- [ ] 知识库：管理后台新增/编辑知识 → 游客端问答结果即时变化
- [ ] 连续对话：两轮问答上下文衔接正确

---

# Phase 4: 收尾打磨（1 天，并行）

**目标**：补齐路线推荐、报告页面、移动端适配。

## 4.1 Person A — 路线推荐 UI（0.5 天）

**对应 PRD 4.1.3**

| 组件 | 任务 |
|------|------|
| `InterestTags.vue` | 横向滚动标签："历史人文" "自然风光" "亲子游" "摄影打卡" "全部"，点击切换 |
| `RouteCard.vue` | Props: `{ route }`。卡片：路线名/预览色块/景点数+用时/推荐理由 |
| `RouteTimeline.vue` | 纵向时间轴：每个节点显示景点名 + 讲解要点 |
| `RoutePage.vue` | 标签选择器 + 卡片列表 |

**Mock 数据**（3 条预设路线）：

```typescript
const routes = [
  {
    id: 'r1', name: '一日看尽长安花 — 人文精华线',
    tags: ['历史人文'], spots: ['灵山大照壁','祥符禅寺','灵山大佛','灵山梵宫','五印坛城'],
    spotCount: 5, duration: '约6小时',
    description: '从入口到登顶，完整领略灵山佛教文化精华',
  },
  { id: 'r2', name: '山水之间 — 自然风光线', tags: ['自然风光'], ... },
  { id: 'r3', name: '亲子同游 — 家庭欢乐线', tags: ['亲子游'], ... },
]
```

## 4.2 Person A — 报告页 + 数字人配置页接入 API（0.5 天）

- `ReportsPage.vue`：对接 `/api/analytics/reports`，渲染图表 + 改进建议卡片
- `DigitalHumanPage.vue`：配置项保存到后端 `/api/digital-human/config`（先存 localStorage，后端接口 B 已写好）

## 4.3 Person B — 路线推荐 API（0.5 天）

**路由**：`GET /api/routes?tags=历史人文`

```python
@router.get("/routes")
async def get_routes(tags: str = ""):
    tag_list = tags.split(",") if tags else []
    routes = load_routes_from_db(tag_list)  # 从参考数据获取
    return {"routes": routes}
```

从解析好的 `src/data/knowledge-spots.json` 中提取 3 条预设路线（对应 Word 文档中已有的路线）。

## 4.4 Person B — PDF 报告导出（0.5 天）

```bash
pip install reportlab
```

```python
# server/app/modules/analytics/report_generator.py
def generate_pdf(report_data: dict) -> bytes:
    """生成 PDF 字节流"""
    # 简单方案：HTML → PDF（用 weasyprint 或者直接返回前端用 window.print()）
```

**实际推荐**：后端返回报告 HTML，前端 `window.print()` 打印为 PDF，省一个后端依赖。

## 4.5 Person A — 移动端适配（0.5 天）

- `visitor-app/index.html`：`<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">`
- `variables.css`：`--safe-area-bottom: env(safe-area-inset-bottom, 0px)`
- 底部输入栏加 `padding-bottom: var(--safe-area-bottom)`
- 聊天区 `max-width: 100vw`，触摸滚动 `-webkit-overflow-scrolling: touch`

## 4.6 两人一起 — 集成测试 + 收尾（0.5 天）

- **端到端**：游客打字→AI回答流式显示→表情变化→TTS语音播放
- **管理后台**：Dashboard数据刷新→知识库CRUD→配置保存
- **Bug 修复**：修复联调中发现的 UI 错位、数据不一致等问题
- **README 更新**：`d:\action\README.md` 补充完整启动说明

---

## Phase 4 收尾验收

- [ ] 路线推荐页：标签筛选 → 路线卡片列表 → 点击进时间轴详情
- [ ] 游客报告页：4 张图表 + 5 条改进建议 + 问答记录表
- [ ] PDF 导出：浏览器打印 → 保存为 PDF
- [ ] 移动端：手机浏览器打开游客端，UI 不溢出、输入栏贴底
- [ ] `git commit -m "feat: v1.0 比赛版本"`

---

# 最少比赛要求清单

| 功能 | 必须？ | 最低实现 |
|------|--------|---------|
| 文字问答 | ✅ 必须 | 打字 → AI 流式回答 → 文字显示 |
| 语音输入 | ✅ 必须 | 浏览器 `MediaRecorder` → `Web Speech API` 转写（免费） |
| 语音输出 | ✅ 必须 | `edge-tts` 合成 → Base64 → 前端 `<audio>` 播放 |
| 口型同步 | ✅ 加分 | CSS 正弦波模拟嘴巴开合，不依赖精确 viseme |
| 表情切换 | ✅ 加分 | AI 回复中标记 `[emotion:xxx]` → 前端解析切换 CSS 表情 |
| 路线推荐 | ✅ 必须 | 3 条预设路线 + 标签筛选 |
| 知识库管理 | ✅ 必须 | 管理员可增删改查知识条目，即时生效 |
| 数据大屏 | ✅ 必须 | 5 张 KPI 卡片 + 3 张 Chart.js 图表 |
| 游客报告 | ✅ 加分 | 情感趋势图 + 热门问题 Top 10 + 改进建议卡片 |
| 7×24 可用 | ✅ 加分 | 比赛演示时不崩即可 |

---

# 预计总工期

| Phase | 天数 | 累计 | 关键产出 |
|-------|------|------|---------|
| 1 基础设施 | 1 天 | 1 天 | 环境跑通，数据就位，数据库建表 |
| 2 核心能力 | 2-3 天 | 3-4 天 | AI 端到端回答问题，管理后台 UI 完成 |
| 3 前后端联调 | 2 天 | 5-6 天 | 游客端完整对话闭环，管理后台接入真实数据 |
| 4 收尾打磨 | 1 天 | 6-7 天 | 路线推荐 + 报告 + 适配 + Bug 修复 |

**总计**：约 **1 周**，两人并行，每人约 5-6 个工作日。
