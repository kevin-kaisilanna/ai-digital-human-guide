// 知识库相关类型 (PRD 4.2.1 知识库管理)

/** 知识分类 */
export type KnowledgeCategory = 'history' | 'spots' | 'facility' | 'events' | 'faq'

export const KNOWLEDGE_CATEGORIES: Record<KnowledgeCategory, string> = {
  history: '历史文化',
  spots: '景点介绍',
  facility: '设施服务',
  events: '活动资讯',
  faq: '常见问答',
}

/** 知识来源类型 */
export type KnowledgeSource = 'upload' | 'manual' | 'import'

/** 知识条目 */
export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: KnowledgeCategory
  tags: string[]
  source: KnowledgeSource
  sourceFile?: string       // 来源文件名
  embedding?: number[]      // 向量嵌入
  createdAt: string
  updatedAt: string
}

/** 知识分类树节点 */
export interface KnowledgeTreeNode {
  label: string
  category?: KnowledgeCategory
  count: number
  children?: KnowledgeTreeNode[]
}

/** 知识搜索请求 */
export interface KnowledgeSearchRequest {
  query: string
  category?: KnowledgeCategory
  page?: number
  pageSize?: number
}

/** 知识上传请求 */
export interface KnowledgeUploadRequest {
  file: File               // Word/TXT/PDF
  category: KnowledgeCategory
}
