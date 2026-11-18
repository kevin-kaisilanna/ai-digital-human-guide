// 数字人形象配置相关类型 (PRD 4.2.2 数字人形象管理)

/** 性别 */
export type Gender = 'male' | 'female'

/** 发型 */
export type Hairstyle = 'short' | 'medium' | 'long' | 'ancient_bun'

/** 脸型 */
export type FaceShape = 'oval' | 'round' | 'heart'

/** 服装风格 */
export type ClothingStyle = 'hanfu_tang' | 'modern_professional' | 'ethnic' | 'song_robe'

/** 声线风格 */
export type VoiceStyle = 'gentle_female' | 'calm_male' | 'lively_girl'

export interface VoiceOption {
  id: VoiceStyle
  name: string           // 温柔女声
  description: string
  sampleUrl: string      // 试听音频 URL
}

/** 背景图 */
export interface BackgroundOption {
  id: string
  name: string
  url: string
  isCustom: boolean       // 是否为自定义上传
}

/** 数字人完整配置 */
export interface DigitalHumanConfig {
  gender: Gender
  hairstyle: Hairstyle
  faceShape: FaceShape
  clothing: ClothingStyle
  voice: VoiceStyle
  background: BackgroundOption
  name: string            // 数字人名字, 默认 "小云"
}
