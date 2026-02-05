/**
 * FEAT-003 晚上总结占位（FEAT-006 未就绪时）
 * 简单摘要「今天去了哪里」列表；navigateToStory 可切换为此视图
 */
import * as TownLifeController from './TownLifeController.js';
import { attachClickFeedback } from '../animations/index.js';

/**
 * @param {HTMLElement} container
 * @param {{ onBack: () => void }} options
 */
export async function render(container, options = {}) {
  const snapshot = await TownLifeController.getDailySummarySnapshot();
  const eventLabels = snapshot.events.map((e) => {
    const m = { activity_home_rest: '在家休息', activity_school_class: '上课', activity_park_friend: '交朋友', activity_shop_browse: '逛商店', activity_forest_explore: '森林探索' };
    return m[e.eventType] || e.eventType;
  });
  container.innerHTML = `
    <div class="story-placeholder-page">
      <h1 class="morning-title">📖 今天的故事</h1>
      <p class="page-subtitle">今日摘要（故事功能即将开放）</p>
      <div class="morning-card">
        <h3>今天去了哪里</h3>
        <ul class="daily-events-list">
          ${eventLabels.length ? eventLabels.map((l) => `<li>${l}</li>`).join('') : '<li>今天休息了一下</li>'}
        </ul>
      </div>
      <button type="button" class="btn btn-primary" data-back>返回地图</button>
    </div>
  `;
  container.querySelector('[data-back]').addEventListener('click', () => options.onBack?.());
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}
