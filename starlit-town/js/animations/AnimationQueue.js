/**
 * 动效任务队列（plan A3.3 / L2 ST-002）
 * FIFO 串行执行，单次仅一个 task 运行；task 异常 catch 后静默
 */
const MAX_QUEUE_LENGTH = 10;

/** @type {Array<() => Promise<void>>} */
const tasks = [];
let running = false;

/**
 * @param {() => Promise<void>} task
 */
export function enqueue(task) {
  if (tasks.length >= MAX_QUEUE_LENGTH) return;
  tasks.push(task);
  run();
}

function run() {
  if (running || tasks.length === 0) return;
  running = true;
  const task = tasks.shift();
  Promise.resolve()
    .then(task)
    .catch(() => {})
    .finally(() => {
      running = false;
      if (tasks.length > 0) run();
    });
}
