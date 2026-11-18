# 前后端对接文档

## 一、启动命令

### 方法 A：依次打开 4 个终端窗口手动启动（推荐）

> **双击桌面的「命令提示符」或「PowerShell」图标**，每打开一个新窗口执行一条。

#### 1. 终端1 — FastAPI 后端（必须先启）

```
d:\action\server\venv\Scripts\python.exe d:\action\server\main.py
d:\action\server\venv\Scripts\python.exe -m uvicorn main:app --port 8001 --host 0.0.0.0 --reload
```

看到 `Uvicorn running on http://0.0.0.0:8001` 表示成功。**这个窗口不要关。**

#### 2. 终端2 — AvatarServer（数字人 LLM / STT / TTS）

```
d:\action\server\venv\Scripts\python.exe d:\action\affiliate-project\AvatarServer\manage.py runserver 0.0.0.0:8000 --noreload
```

看到 `Starting development server at http://0.0.0.0:8000/` 表示成功。**这个窗口不要关。**

#### 3. 终端3 — 游客端（Vue 3）

```
cd d:\action\visitor-app
npm run dev
```

看到 `Local: http://localhost:5173/` 表示成功。**这个窗口不要关。**

#### 4. 终端4 — 管理后台（Vue 3）

```
cd d:\action\admin-web
npm run dev
```

看到 `Local: http://localhost:5174/` 表示成功。**这个窗口不要关。**

### 方法 B：创建一键启动脚本

在 `d:\action\scripts\` 下创建 `start-all.ps1`，右键 →「使用 PowerShell 运行」：

```powershell
# 启动 4 个服务
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd d:\action\server; venv\Scripts\activate; python main.py"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd d:\action\affiliate-project\AvatarServer; d:\action\server\venv\Scripts\python manage.py runserver 0.0.0.0:8000 --noreload"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd d:\action\visitor-app; npm run dev"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd d:\action\admin-web; npm run dev"
Start-Sleep -Seconds 10
Start-Process "http://localhost:5173"
Start-Process "http://localhost:5174"
Write-Host "全部启动完毕！"
```

### 验证启动成功

浏览器分别打开：

| 地址 | 页面 |
|------|------|
| `http://localhost:8001/api/health` | FastAPI 健康检查（返回 JSON 即成功） |
| `http://localhost:5173` | 游客端 + 数字人 |
| `http://localhost:5174` | 管理后台 |

### 如何关闭

依次关闭 4 个终端窗口，或按 `Ctrl+C` 逐个停止。

## 二、API 基地址

| 服务 | 地址 | 用途 |
|------|------|------|
| 我们的 FastAPI | `http://localhost:8001` | 业务 API（对话/知识库/数据/报告/认证） |
| AvatarServer | `http://localhost:8000` | 数字人驱动（LLM/STT/TTS，Unity 内部调用） |

**前端已配置好**：两个前端的 `api-client.ts` 默认 baseURL 均为 `http://localhost:8001`，mock 模式默认关闭。

## 三、API 接口清单（24 个）

### Chat 对话（visitor-app 用）

| 方法 | 路径 | 请求 | 响应 | 说明 |
|------|------|------|------|------|
| `POST` | `/api/chat/send` | `{ "session_id": "xxx", "type": "text", "content": "灵山大佛有多高" }` | SSE 流 | **SSE 流式对话**。data 事件格式：`{"type":"text","content":"..."}`、`{"type":"emotion","content":"微笑"}`、`{"type":"done"}` |
| `GET` | `/api/chat/history` | `?session_id=xxx&page=1&page_size=20` | `{ "messages": [...], "total": 50 }` | 分页历史消息 |
| `GET` | `/api/chat/greeting` | — | `{ "message": "你好！我是AI导游小云..." }` | 首次打招呼 |

**SSE 流读取示例（TypeScript）：**
```ts
const resp = await fetch('http://localhost:8001/api/chat/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ session_id: 'demo', type: 'text', content: '灵山大佛有多高' }),
})
const reader = resp.body.getReader()
const decoder = new TextDecoder()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const lines = decoder.decode(value).split('\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const chunk = JSON.parse(line.slice(6))
      if (chunk.type === 'text') aiMsg.content += chunk.content
      if (chunk.type === 'emotion') emotion.value = chunk.content
      if (chunk.type === 'done') isStreaming = false
    }
  }
}
```

### Routes 路线（visitor-app 用）

| 方法 | 路径 | 请求 | 响应 | 说明 |
|------|------|------|------|------|
| `GET` | `/api/routes` | `?tags=历史人文,亲子游` | `{ "routes": [...] }` | 路线列表，支持标签筛选（逗号分隔） |
| `GET` | `/api/routes/:id` | — | `{ "route": {...} }` | 单条路线详情 |

**Route 对象结构：**
```json
{
  "id": "r1",
  "name": "一日看尽灵山 — 人文精华线",
  "description": "从入口到登顶，完整领略灵山佛教文化精华",
  "tags": ["历史人文"],
  "spots": [
    { "order": 1, "spot_name": "灵山大照壁", "talking_points": ["华夏第一壁"], "duration": "15分钟" },
    { "order": 2, "spot_name": "祥符禅寺", "talking_points": ["千年古刹"], "duration": "30分钟" }
  ],
  "duration": "约6小时",
  "spot_count": 5
}
```

### User 用户（visitor-app 用）

| 方法 | 路径 | 请求 | 响应 | 说明 |
|------|------|------|------|------|
| `POST` | `/api/user/login` | `{ "phone": "13800138000", "nickname": "小明" }` | `{ "token": "...", "user": { "id":"..", "nickname":"..", "phone":"..", "role":"visitor" } }` | 手机号快速登录 |
| `GET` | `/api/user/profile` | `?phone=13800138000` | `{ "user": {...} }` | 游客信息 |
| `PUT` | `/api/user/preferences` | `["历史人文","自然风光"]` | `{ "ok": true, "preferences": [...] }` | 更新偏好标签 |

### Auth 认证（admin-web 用）

| 方法 | 路径 | 请求 | 响应 | 说明 |
|------|------|------|------|------|
| `POST` | `/api/auth/login` | `{ "username": "admin", "password": "admin123" }` | `{ "token": "admin-token-...", "user": { "name": "admin", "role": "管理员" } }` | 管理后台登录 |
| `POST` | `/api/auth/logout` | — | `{ "ok": true }` | 登出 |

**账号**：`admin` / `admin123`

### Knowledge 知识库（admin-web 用）

| 方法 | 路径 | 请求 | 响应 | 说明 |
|------|------|------|------|------|
| `GET` | `/api/knowledge` | `?page=1&pageSize=50` | `[{ "id":"..", "title":"..", "content":"..", "category":"spots", "excerpt":"..", "updated_at":"..", "tags":[".."] }]` | 分页列表 |
| `POST` | `/api/knowledge` | `{ "title":"..", "content":"..", "category":"history", "tags":[] }` | `{ "id":"..", ... }` | 新建知识 |
| `PUT` | `/api/knowledge/:id` | 同上 | 更新后的对象 | 编辑知识 |
| `DELETE` | `/api/knowledge/:id` | — | `{ "ok": true }` | 删除知识 |

**category 枚举**：`"history"`（历史文化）、`"spots"`（景点介绍）、`"facility"`（设施服务）、`"events"`（活动资讯）、`"faq"`（常见问答）

### Analytics 数据大屏（admin-web 用）

| 方法 | 路径 | 响应 | 说明 |
|------|------|------|------|
| `GET` | `/api/analytics/dashboard` | 见下方 | 管理后台数据大屏 KPI |
| `GET` | `/api/analytics/stats` | `{ "totalQueries":34, "todayQueries":34, "knowledgeCount":30, "activeSessions":6, "recentTrend":[0,0,...] }` | 全局统计 |

**Dashboard 响应结构：**
```json
{
  "todayVisitors": 34,
  "todayVisitorsChange": 12.5,
  "weeklyVisitors": 34,
  "onlineUsers": 6,
  "satisfaction": 92.0,
  "knowledgeCount": 30,
  "weeklyTrend": [0, 0, 0, 0, 0, 0, 34],
  "topQuestions": [
    { "question": "灵山大佛有多高？", "count": 328, "satisfaction": 94 }
  ],
  "spotPopularity": [
    { "name": "灵山大佛", "count": 12 },
    { "name": "灵山梵宫", "count": 8 }
  ]
}
```

### Reports 游客报告（admin-web 用）

| 方法 | 路径 | 响应 | 说明 |
|------|------|------|------|
| `GET` | `/api/reports/summary` | 见下方 | 游客感受度报告 |
| `GET` | `/api/reports/query-logs` | `?page=1&pageSize=50` | `{ "logs":[...], "total":34 }` | 问答记录分页 |
| `GET` | `/api/reports/export-pdf` | `{ "message":"..", "report":{...} }` | PDF 导出（返回数据，前端 `window.print()` 打印） |

**Reports summary 响应结构：**
```json
{
  "sentimentTrend": [ { "date":"06/10", "positive":88, "neutral":8, "negative":4 } ],
  "topQuestions": [ { "rank":1, "question":"..", "count":328, "satisfaction":94 } ],
  "categoryDistribution": [ { "category":"历史文化", "percentage":35 } ],
  "suggestions": [
    { "level": "warning", "content": "知识库当前仅 30 条，建议扩充" },
    { "level": "info", "content": "系统整体运行稳定，AI导游小云正常服务中" }
  ],
  "queryLogs": [ { "time":"14:30", "visitorId":"..", "question":"..", "sentiment":"positive", "satisfaction":"high" } ],
  "total": 34
}
```

### Digital Human 数字人配置（admin-web 用）

| 方法 | 路径 | 请求/响应 | 说明 |
|------|------|-----------|------|
| `GET` | `/api/digital-human/config` | `{ "appearance":{...}, "clothing":{...}, "voice":"温柔", "emoji":"😊" }` | 获取配置 |
| `POST` | `/api/digital-human/config` | 同上 | 保存配置 |
| `POST` | `/api/digital-human/synthesize` | `{ "text":"..", "voice":"温柔" }` → `{ "audioUrl":".." }` | TTS 合成 |
| `POST` | `/api/digital-human/visemes` | `{ "text":".." }` → `{ "visemeTimeline":[...] }` | 口型时间轴 |
| `POST` | `/api/digital-human/session` | `{}` → `{ "sessionId":".." }` | 创建会话 |

### AI Chat（admin-web 用）

| 方法 | 路径 | 请求 | 响应 | 说明 |
|------|------|------|------|------|
| `POST` | `/api/ai/chat` | `{ "prompt":"灵山大佛", "context":"" }` | `{ "id":"..", "answer":"灵山大佛高88米..." }` | 单轮问答（非流式） |
| `POST` | `/api/ai/stream` | `{ "prompt":".." }` | SSE 流 | 流式问答 |

### Health 健康检查

| 方法 | 路径 | 响应 |
|------|------|------|
| `GET` | `/api/health` | `{ "status":"ok", "service":"景区导览 AI 数字人 API" }` |

## 四、前端页面 ↔ API 映射

### visitor-app

| 页面 | 文件 | 需要对接的 API | 当前状态 |
|------|------|---------------|---------|
| 对话首页 | `pages/AvatarPage.vue` | `POST /api/chat/send` | ✅ 已对接（Unity 模式优先，Fallback FastAPI） |
| 路线推荐 | `pages/RoutePage.vue` | `GET /api/routes` | ⚠️ 用本地 mock，需切真实 API |
| 个人中心 | `pages/ProfilePage.vue` | `POST /api/user/login`、`GET /api/user/profile` | ⚠️ 用本地 mock，需切真实 API |

### admin-web

| 页面 | 文件 | 需要对接的 API | 当前状态 |
|------|------|---------------|---------|
| 数据大屏 | `pages/DashboardPage.vue` | `GET /api/analytics/dashboard` | ⚠️ 用本地 mock，需切真实 API |
| 知识库管理 | `pages/KnowledgePage.vue` | `GET/POST/PUT/DELETE /api/knowledge` | ⚠️ 用 JSON 文件，需切真实 API |
| 数字人配置 | `pages/DigitalHumanPage.vue` | `GET/POST /api/digital-human/config` | ⚠️ 用本地 mock，需切真实 API |
| 游客报告 | `pages/ReportsPage.vue` | `GET /api/reports/summary` | ⚠️ 用本地 mock，需切真实 API |
| AI 测试 | `pages/DigitalHumanPage.vue` | `POST /api/ai/chat` | ⚠️ 用本地 mock，需切真实 API |
| 登录 | `auth-store.ts` | `POST /api/auth/login` | ⚠️ 用本地 mock，需切真实 API |

## 五、如何切到真实 API

每个 service 文件都有一个 `getUseMock()` 函数。改为返回 `false` 就会走真实 API。

**方法 1**：浏览器 Console 执行：
```js
localStorage.setItem('USE_MOCK', 'false')
location.reload()
```

**方法 2**：直接改 service 文件，把 `getUseMock()` 默认值从 `true` 改为 `false`。

**visitor-app 已经默认 `false`**（`api-client.ts` 第 8 行），**admin-web 也已经默认 `false`**。

## 六、端口分配

| 端口 | 服务 | 框架 |
|------|------|------|
| 8000 | AvatarServer | Django（数字人 LLM/STT/TTS） |
| 8001 | FastAPI | Python FastAPI（业务 API） |
| 5173 | visitor-app | Vue 3 + Vite |
| 5174 | admin-web | Vue 3 + Vite |

## 七、Mock 模式控制

**我们的 FastAPI**：`.env` 中 `MOCK_MODE=true` 使用 30+ 条预制回答，`MOCK_MODE=false` 调用 DeepSeek API。

**前端**：`localStorage.USE_MOCK = "true"` 用本地假数据，`= "false"` 走真实后端。两个前端默认均为 `false`。

## 八、Swagger

启动后打开 `http://localhost:8001/docs`，24 个接口全部可在线测试。
