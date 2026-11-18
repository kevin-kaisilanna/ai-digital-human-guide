# 景区导览 AI 数字人

## 项目定位
- 智能导游应用：手机或景区终端设备上运行的虚拟数字人导游
- 双端产品：游客端 App（手机端）+ 管理后台（Web 端）
- 目标景区：灵山胜境
- 当前阶段：早期原型（仅 index.html 静态 Demo）

## 技术栈
- 当前：HTML5 + CSS3 + 原生 JS + Chart.js 4.4.7 (CDN)
- 规划：前端 Vue 3 + 后端 Python FastAPI + Codex API + TTS

## 目录结构
- `index.html` — 管理后台原型（数据大屏 + 知识库 + 数字人配置 + 游客报告 + 游客端预览）
- `docs/prd.md` — 产品需求文档
- `示范景区公开资料包/` — 灵山胜境参考数据（Excel + 2x Word）
- `digital-human/` — AI 数字人前端（Vue 3 + Unity WebGL）
- `assets/design/` — AI 生成的设计参考图
- `assets/reference/` — 参考素材
- `assets/bug/` — Bug 截图
- `notes/` — 开发笔记
- `.Codex/` — Codex 配置

## PRD 关键约束
1. 语音问答响应 < 5 秒 — 需要 prompt caching + streaming + 高效 TTS pipeline
2. 事实性问答准确率 ≥ 90% — 需要高质量 RAG 检索 + 知识库覆盖全面
3. 7×24 小时可用 — 需要冗余和错误降级
4. 数字人口型同步 — TTS 输出需生成 viseme 时间轴
5. 表情自然适配 — 根据回答内容分类表情

## 参考数据
- `灵山胜境：历史、文化、景点特色与个性化游览指南.docx` — 主要知识源
- `灵山胜境 景点结构化数据集.docx` — 路线推荐数据源
- `景点景区旅游数据行为分析数据.xlsx` — 游客行为分析参考

所有 AI 生成的景区相关回答都需与参考数据一致。参考数据只读，不可修改。

## 开发规范
- 用户界面文字使用中文
- CSS 用 `:root` 变量统一主题色、圆角、阴影
- JS 使用 ES6+ 语法（const/let、箭头函数、模板字面量）
- 文件命名 kebab-case
