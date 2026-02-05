/**
 * 地图与场景切换、日阶段展示（plan A3.2.1 / ST-003）
 * FEAT-003 集成：早上 MorningView、白天场景内容、晚上总结入口
 */
import * as GameStateManager from '../game/GameStateManager.js';
import { SCENE_IDS } from '../game/GameState.js';
import { canAdvance } from '../game/DayCycleController.js';
import { attachClickFeedback } from '../animations/index.js';
import {
  renderMorningView,
  renderSummaryEntryView,
  renderDailyEventView,
  showEventToast,
  setNavigateToStory,
  renderHomeScene,
  renderSchoolScene,
  renderParkScene,
  renderShopScene,
  renderForestScene,
  getDailyEvents
} from '../town-life/index.js';
import { openOutfitForMorning } from '../costume/index.js';
import { renderOutfitView, renderRoomPetView, renderDressDesignView } from '../costume/index.js';
import { renderNPCDialogueView } from '../relations/index.js';
import { renderStoryView } from '../story/index.js';

const PHASE_LABELS = { morning: '早上', daytime: '白天', evening: '晚上' };
const SCENE_INFO = {
  home: { label: '家', sub: '卧室·衣柜·宠物角', icon: '🏠', class: 'map-spot-home' },
  school: { label: '学校', sub: '上课·小游戏', icon: '🏫', class: 'map-spot-school' },
  park: { label: '公园', sub: '交朋友·喂动物', icon: '🌳', class: 'map-spot-park' },
  shop: { label: '商店', sub: '服装·文具·装饰', icon: '🛍️', class: 'map-spot-shop' },
  forest: { label: '神秘森林', sub: '轻探索', icon: '🌲', class: 'map-spot-forest' }
};

const SCENE_RENDERERS = {
  home: renderHomeScene,
  school: renderSchoolScene,
  park: renderParkScene,
  shop: renderShopScene,
  forest: renderForestScene
};

/**
 * @param {HTMLElement} container
 * @param {{ currentDay: number, currentSceneId: string, dayPhase: string }} [state]
 */
export function renderMapView(container, state) {
  const s = state || GameStateManager.getState();

  if (s.dayPhase === 'morning') {
    const morningOptions = () => ({
      onComplete: () => renderMapView(container),
      onOpenOutfit: () => {
        openOutfitForMorning(container, () => renderMorningView(container, morningOptions()));
      }
    });
    renderMorningView(container, morningOptions());
    return;
  }

  const phaseLabel = PHASE_LABELS[s.dayPhase] || s.dayPhase;
  const canAdvancePhase = canAdvance(s.dayPhase);

  setNavigateToStory(() => {
    renderStoryView(container, { onBack: () => renderMapView(container) });
  });

  container.innerHTML = `
    <div class="map-page">
      <div class="map-header">
        <h1 class="map-title">星光小镇</h1>
        <p class="page-subtitle">点击地点前往</p>
        <div class="map-phase">${getPhaseEmoji(s.dayPhase)} ${phaseLabel}</div>
      </div>
      <div class="map-grid">
        ${SCENE_IDS.map((id) => {
          const info = SCENE_INFO[id];
          const active = s.currentSceneId === id ? ' map-spot-active' : '';
          return `
          <button type="button" class="map-spot ${info.class}${active}" data-scene="${id}">
            <span class="map-spot-icon">${info.icon}</span>
            <span>${info.label}</span>
            <span class="map-spot-sub">${info.sub}</span>
          </button>`;
        }).join('')}
      </div>
      <div class="map-scene-area" data-scene-area style="margin-top:16px;"></div>
      <div class="map-bottom">
        ${s.dayPhase === 'evening' ? '<div class="summary-entry-wrap" data-summary-entry></div>' : ''}
        <button type="button" class="btn btn-ghost" data-advance-phase ${canAdvancePhase ? '' : 'disabled'}>
          ${canAdvancePhase ? '进入下一阶段' : '今日已结束'}
        </button>
      </div>
    </div>
  `;

  if (s.dayPhase === 'daytime') {
    const sceneArea = container.querySelector('[data-scene-area]');
    if (sceneArea) {
      sceneArea.innerHTML = '<div class="scene-content-area" data-scene-content></div><div class="daily-events-area" data-daily-events></div>';
      const sceneContentEl = sceneArea.querySelector('[data-scene-content]');
      const dailyEventsEl = sceneArea.querySelector('[data-daily-events]');
      if (!sceneContentEl) return;
      const sceneCallbacks = {
        onOpenOutfit: () => {
          renderOutfitView(sceneContentEl, {
            onBack: () => {
              const fn = SCENE_RENDERERS[s.currentSceneId];
              if (fn && sceneContentEl) fn(sceneContentEl, sceneCallbacks);
            }
          });
        },
        onOpenRoomPet: () => {
          renderRoomPetView(sceneContentEl, {
            onBack: () => {
              const fn = SCENE_RENDERERS[s.currentSceneId];
              if (fn && sceneContentEl) fn(sceneContentEl, sceneCallbacks);
            }
          });
        },
        onOpenDressDesign: () => {
          renderDressDesignView(sceneContentEl, {
            onBack: () => {
              const fn = SCENE_RENDERERS[s.currentSceneId];
              if (fn && sceneContentEl) fn(sceneContentEl, sceneCallbacks);
            }
          });
        },
        onTalkNpc: (npcId) => {
          renderNPCDialogueView(sceneContentEl, {
            npcId: npcId || 'teacher',
            onBack: () => {
              const fn = SCENE_RENDERERS[s.currentSceneId];
              if (fn && sceneContentEl) fn(sceneContentEl, sceneCallbacks);
            }
          });
        }
      };
      const renderScene = () => {
        const fn = SCENE_RENDERERS[s.currentSceneId];
        if (fn && sceneContentEl) fn(sceneContentEl, sceneCallbacks);
        getDailyEvents().then((events) => renderDailyEventView(dailyEventsEl, events));
      };
      sceneArea.addEventListener('daily-event', (e) => {
        showEventToast(e.detail);
        getDailyEvents().then((events) => renderDailyEventView(dailyEventsEl, events));
      });
      renderScene();
    }
  }

  if (s.dayPhase === 'evening') {
    const summaryWrap = container.querySelector('[data-summary-entry]');
    if (summaryWrap) renderSummaryEntryView(summaryWrap);
  }

  // 直接为每个地图格和“进入下一阶段”绑定点击，确保可点
  container.querySelectorAll('[data-scene]').forEach((btn) => {
    const sceneId = btn.getAttribute('data-scene');
    if (!sceneId) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      GameStateManager.setScene(sceneId);
    });
  });

  const advanceBtn = container.querySelector('[data-advance-phase]');
  if (advanceBtn && canAdvancePhase) {
    advanceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      GameStateManager.advancePhase();
    });
  }

  container.querySelectorAll('.map-spot, .map-bottom .btn').forEach(attachClickFeedback);

  GameStateManager.setOnStateChange((newState) => renderMapView(container, newState));
}

function getPhaseEmoji(phase) {
  if (phase === 'morning') return '☀️';
  if (phase === 'daytime') return '🌤️';
  return '🌙';
}
