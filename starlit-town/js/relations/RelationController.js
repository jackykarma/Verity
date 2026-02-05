/**
 * FEAT-005 角色关系 - 业务层（plan A3.2.1）
 * 记录互动、持久化、获取反馈、getRelationSummary 供 FEAT-006
 */
import { createStorage } from '../storage/index.js';
import { MEMORIES_KEY, MAX_MEMORIES_PER_NPC, MEMORY_RETENTION_DAYS, NPC_PRESETS } from './storage-keys.js';
import { select as feedbackSelect } from './FeedbackSelector.js';

let _storage = null;

async function getStorage() {
  if (_storage) return _storage;
  _storage = await createStorage();
  return _storage;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * 同类型覆盖：同一 npcId 下同 interactionType 只保留最近一条；然后按 occurredAt 排序，保留最近 20 条且 7 天内
 * @param {{ [npcId: string]: Array<{ interactionType: string, occurredAt: number, emotionTag: string }> }} data
 * @returns {typeof data}
 */
function applyPolicies(data) {
  const now = Date.now();
  const cutoff = now - MEMORY_RETENTION_DAYS * MS_PER_DAY;
  const out = {};
  for (const [npcId, list] of Object.entries(data || {})) {
    if (!Array.isArray(list)) continue;
    const byType = {};
    for (const m of list) {
      if (m.occurredAt < cutoff) continue;
      byType[m.interactionType] = m;
    }
    let arr = Object.values(byType).sort((a, b) => a.occurredAt - b.occurredAt);
    if (arr.length > MAX_MEMORIES_PER_NPC) {
      arr = arr.slice(-MAX_MEMORIES_PER_NPC);
    }
    out[npcId] = arr;
  }
  return out;
}

/**
 * @returns {Promise<{ [npcId: string]: Array<{ interactionType: string, occurredAt: number, emotionTag: string }> }>}
 */
async function loadMemories() {
  try {
    const storage = await getStorage();
    const raw = await storage.get(MEMORIES_KEY);
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return applyPolicies(raw);
    }
  } catch (_) {}
  return {};
}

/**
 * 记录一次互动（同类型覆盖、清理 20 条/7 天后持久化）
 * @param {string} npcId
 * @param {string} interactionType - 'talk' | 'help' | 'play'
 * @param {string} emotionTag - 'happy' | 'grateful' | 'calm' | 'expectant'
 * @returns {Promise<void>}
 */
export async function recordInteraction(npcId, interactionType, emotionTag) {
  const data = await loadMemories();
  const list = data[npcId] || [];
  const filtered = list.filter((m) => m.interactionType !== interactionType);
  filtered.push({
    interactionType: interactionType || 'talk',
    occurredAt: Date.now(),
    emotionTag: emotionTag || 'happy'
  });
  data[npcId] = filtered;
  const pruned = applyPolicies(data);
  try {
    const storage = await getStorage();
    await storage.set(MEMORIES_KEY, pruned);
  } catch (e) {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('toast') || (() => {
        const t = document.createElement('div');
        t.id = 'toast';
        t.setAttribute('role', 'alert');
        t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(45,38,64,0.9);color:#fff;padding:12px 20px;border-radius:14px;font-size:14px;z-index:9999;';
        document.body.appendChild(t);
        return t;
      })();
      el.textContent = '互动未保存';
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 2000);
    }
  }
}

/**
 * 获取该 NPC 的展示文案（首次见面 / 记得我）
 * @param {string} npcId
 * @returns {Promise<string>}
 */
export async function getFeedback(npcId) {
  try {
    const data = await loadMemories();
    const memories = data[npcId] || [];
    return feedbackSelect(npcId, memories);
  } catch (_) {
    const { firstMeet } = await import('./presets/default.js');
    return firstMeet[npcId] || '你好呀～';
  }
}

/**
 * 供 FEAT-006：关系摘要（无数值）
 * @returns {Promise<{ memoriesByNpc: Object, summaryByNpc: Object }>}
 */
export async function getRelationSummary() {
  try {
    const data = await loadMemories();
    const memoriesByNpc = { ...data };
    const summaryByNpc = {};
    for (const [npcId, list] of Object.entries(data)) {
      const npc = NPC_PRESETS[npcId];
      const name = (npc && npc.name) || npcId;
      if (!list || list.length === 0) {
        summaryByNpc[npcId] = { name, recent: null, count: 0 };
      } else {
        const last = list[list.length - 1];
        summaryByNpc[npcId] = {
          name,
          recent: `${last.interactionType}-${last.emotionTag}`,
          count: list.length
        };
      }
    }
    return { memoriesByNpc, summaryByNpc };
  } catch (_) {
    return { memoriesByNpc: {}, summaryByNpc: {} };
  }
}
