/**
 * FEAT-005 NPC 对话与「记得我」反馈视图（plan ST-003）
 */
import * as RelationController from './RelationController.js';
import { NPC_PRESETS, INTERACTION_TYPES, EMOTION_TAGS } from './storage-keys.js';
import { attachClickFeedback } from '../animations/index.js';

const INTERACTION_LABELS = { talk: '对话', help: '帮助', play: '一起玩' };
const EMOTION_LABELS = { happy: '开心', grateful: '感激', calm: '平静', expectant: '期待' };

/**
 * @param {HTMLElement} container
 * @param {{ npcId: string, onBack?: () => void }} options
 */
export async function render(container, options = {}) {
  if (!container) return;
  const npcId = options.npcId || 'teacher';
  const npc = NPC_PRESETS[npcId] || { name: npcId, personalityType: 'gentle' };
  let feedback;
  try {
    feedback = await RelationController.getFeedback(npcId);
  } catch (_) {
    feedback = '你好呀～';
  }

  container.innerHTML = `
    <div class="npc-dialogue-page">
      <div class="npc-dialogue-header">
        <h2 class="npc-dialogue-title">${escapeHtml(npc.name)}</h2>
        ${options.onBack ? '<button type="button" class="btn btn-ghost" data-back>关闭</button>' : ''}
      </div>
      <div class="npc-dialogue-bubble" data-bubble>
        <p>${escapeHtml(feedback)}</p>
      </div>
      <div class="npc-dialogue-actions">
        <h3>这次和${escapeHtml(npc.name)}…</h3>
        <div class="npc-interaction-btns" data-interaction></div>
        <h3>心情</h3>
        <div class="npc-emotion-btns" data-emotion></div>
        <button type="button" class="btn btn-primary" data-record style="margin-top:12px">记住这次互动</button>
      </div>
    </div>
  `;

  const bubbleEl = container.querySelector('[data-bubble]');
  const interactionEl = container.querySelector('[data-interaction]');
  const emotionEl = container.querySelector('[data-emotion]');

  INTERACTION_TYPES.forEach((type) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary btn-sm npc-action-btn';
    btn.textContent = INTERACTION_LABELS[type];
    btn.dataset.type = type;
    interactionEl.appendChild(btn);
  });
  EMOTION_TAGS.forEach((tag) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-ghost btn-sm npc-emotion-btn';
    btn.textContent = EMOTION_LABELS[tag];
    btn.dataset.tag = tag;
    emotionEl.appendChild(btn);
  });

  let selectedType = 'talk';
  let selectedEmotion = 'happy';
  container.querySelectorAll('.npc-action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.npc-action-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.dataset.type;
    });
  });
  container.querySelectorAll('.npc-emotion-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.npc-emotion-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEmotion = btn.dataset.tag;
    });
  });
  container.querySelector('.npc-action-btn').classList.add('active');
  container.querySelector('.npc-emotion-btn').classList.add('active');

  container.querySelector('[data-record]').addEventListener('click', async () => {
    await RelationController.recordInteraction(npcId, selectedType, selectedEmotion);
    const newFeedback = await RelationController.getFeedback(npcId);
    bubbleEl.innerHTML = '<p>' + escapeHtml(newFeedback) + '</p>';
  });

  container.querySelector('[data-back]')?.addEventListener('click', () => options.onBack?.());
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
