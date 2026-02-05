/**
 * FEAT-005 角色关系 - B3 存储键与常量（plan B3.2）
 */

export const MEMORIES_KEY = 'starlit.relations.memories';
export const SUMMARY_KEY = 'starlit.relations.summary';

/** 每 NPC 最多记忆条数 */
export const MAX_MEMORIES_PER_NPC = 20;

/** 记忆保留天数 */
export const MEMORY_RETENTION_DAYS = 7;

/** 互动类型 */
export const INTERACTION_TYPES = ['talk', 'help', 'play'];

/** 情绪标签 */
export const EMOTION_TAGS = ['happy', 'grateful', 'calm', 'expectant'];

/** NPC 预设：id -> { name, personalityType } */
export const NPC_PRESETS = {
  teacher: { name: '林老师', personalityType: 'gentle' },
  bestfriend: { name: '小美', personalityType: 'clingy' },
  classmate: { name: '小傲', personalityType: 'tsundere' },
  animal: { name: '小动物', personalityType: 'gentle' }
};
