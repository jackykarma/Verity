/**
 * FEAT-006 故事业务层（plan ST-003）
 * 拉取当日输入，模板生成故事，敏感词过滤，100% 返回 StoryOutput
 */
import { getDailySummary } from './input-aggregator.js';
import { selectAndFill } from './TemplateEngine.js';
import { filter } from './content-filter.js';

/** @typedef {{ content: string, source: 'template'|'ai', generatedAt: number }} StoryOutput */

/**
 * @returns {Promise<StoryOutput>}
 */
export async function getStory() {
  const summary = await getDailySummary();
  const raw = selectAndFill(summary);
  const content = filter(raw);
  return {
    content: content || '今天在星光小镇度过了美好的一天～',
    source: 'template',
    generatedAt: Date.now()
  };
}
