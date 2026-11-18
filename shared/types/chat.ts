// 对话相关类型 (PRD 4.1.1 多模态交互, 4.1.2 智能问答)

/** 消息发送者 */
export type MessageRole = 'user' | 'ai'

/** 消息类型 */
export type MessageType = 'text' | 'voice'

/** 聊天消息 */
export interface ChatMessage {
  id: string
  sessionId: string
  role: MessageRole
  type: MessageType
  content: string           // 文本内容 或 语音转写文本
  audioUrl?: string         // 语音消息的音频 URL
  duration?: number         // 语音时长 (秒)
  emotion?: ExpressionType  // AI 回复时附带的表情
  createdAt: string
}

/** 对话会话 */
export interface Conversation {
  id: string
  visitorId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

/** 发送消息请求 */
export interface SendMessageRequest {
  sessionId: string
  type: MessageType
  content?: string          // 文字输入
  audioBase64?: string      // 语音输入的 base64
}

/** AI 回复响应 (SSE 流式) */
export interface AIResponseChunk {
  type: 'text' | 'audio' | 'viseme' | 'emotion' | 'action' | 'done'
  content?: string          // 文本片段
  audioBase64?: string      // TTS 音频片段
  visemes?: VisemeFrame[]   // 口型时间轴
  emotion?: ExpressionType  // 表情标记
  action?: ActionType       // 动作标记
}

/** 口型帧 */
export interface VisemeFrame {
  time: number              // 毫秒
  visemeId: number          // 口型 ID (0-21)
}

/**
 * 表情类型 — LLM 驱动的 6 种表情
 * 对应 LLM 输出格式：表情：<emotion>|动作：<action>|回复文本：<text>|指令：<command>
 */
export type ExpressionType = '生气' | '困惑' | '难过' | '开心' | '有趣' | '惊讶'

/** 动作类型 — LLM 驱动的 4 种身体动作。 "无" 表示不触发任何动画 */
export type ActionType = '鞠躬' | '右手放胸前' | '右手放身前' | '右手放头上' | '无'

/** 表情元数据 */
export interface EmotionMeta {
  name: ExpressionType
  emoji: string
  description: string
}

/** 动作元数据 */
export interface ActionMeta {
  name: ActionType
  icon: string
  description: string
  /** 动画持续时间（毫秒） */
  duration: number
}

/** 所有支持的表情（6 种，与 LLM 系统提示词严格一致） */
export const EMOTION_LIST: EmotionMeta[] = [
  { name: '生气', emoji: '😠', description: '愤怒/不满' },
  { name: '困惑', emoji: '😕', description: '疑惑/不确定' },
  { name: '难过', emoji: '😢', description: '悲伤/低落' },
  { name: '开心', emoji: '😄', description: '高兴/积极' },
  { name: '有趣', emoji: '😏', description: '感兴趣/俏皮' },
  { name: '惊讶', emoji: '😲', description: '震惊/赞叹' },
]

/** 所有支持的动作（4 种 + "无"，与 LLM 系统提示词严格一致） */
export const ACTION_LIST: ActionMeta[] = [
  { name: '鞠躬', icon: '🙇', description: '问候、致谢', duration: 1500 },
  { name: '右手放胸前', icon: '🤚', description: '自我介绍、表达诚意', duration: 1200 },
  { name: '右手放身前', icon: '🫴', description: '展示、介绍', duration: 1500 },
  { name: '右手放头上', icon: '🙋', description: '敬礼、招呼', duration: 1200 },
  { name: '无', icon: '🧍', description: '无动作', duration: 0 },
]
