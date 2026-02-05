/**
 * FEAT-003 小事件展示（plan ST-004）
 * 展示当日已触发的小事件列表
 */
/**
 * @param {HTMLElement} container
 * @param {import('./storage-keys.js').DailyEvent[]} events
 */
export function render(container, events = []) {
  if (!events.length) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <div class="daily-events" role="region" aria-label="今日小事件">
      <h3 class="daily-events-title">今日小事件</h3>
      <ul class="daily-events-list">
        ${events.map((e) => `<li>${formatEvent(e)}</li>`).join('')}
      </ul>
    </div>
  `;
}

/**
 * @param {import('./storage-keys.js').DailyEvent} e
 */
function formatEvent(e) {
  const labels = {
    activity_home_rest: '在家休息了一下',
    activity_home_dress: '换了身衣服',
    activity_school_class: '上了课',
    activity_school_minigame: '玩了小游戏',
    activity_park_friend: '在公园交了朋友',
    activity_park_feed: '喂了小动物',
    activity_shop_browse: '逛了商店',
    activity_forest_explore: '在森林里探索'
  };
  return labels[e.eventType] || e.eventType || '发生了小事件';
}

/**
 * 显示单条小事件 Toast
 * @param {import('./storage-keys.js').DailyEvent} ev
 */
export function showEventToast(ev) {
  const msg = formatEvent(ev);
  let el = document.getElementById('event-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'event-toast';
    el.setAttribute('role', 'alert');
    el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(123,107,168,0.95);color:#fff;padding:12px 20px;border-radius:14px;font-size:14px;z-index:9998;max-width:90%;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    document.body.appendChild(el);
  }
  el.textContent = '✨ ' + msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 2500);
}
