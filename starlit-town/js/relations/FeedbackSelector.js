/**
 * FEAT-005 按性格×互动×情绪选取预设文案（plan A3.2.1）
 */
import { NPC_PRESETS } from './storage-keys.js';
import { firstMeet, remember } from './presets/default.js';

/**
 * @typedef {{ interactionType: string, occurredAt: number, emotionTag: string }} MemoryItem
 * @param {string} npcId
 * @param {MemoryItem[]} memories - 该 NPC 的记忆列表（已按时间排序，最新在后或在前均可）
 * @returns {string} 展示文案
 */
export function select(npcId, memories) {
  const npc = NPC_PRESETS[npcId];
  const personalityType = (npc && npc.personalityType) ? npc.personalityType : 'gentle';
  if (!memories || memories.length === 0) {
    return firstMeet[npcId] || firstMeet.teacher;
  }
  const last = memories[memories.length - 1];
  const type = last.interactionType || 'talk';
  const emotion = last.emotionTag || 'happy';
  const table = remember[personalityType];
  if (!table || !table[type] || !table[type][emotion]) {
    return remember.gentle.talk.happy;
  }
  return table[type][emotion];
}
