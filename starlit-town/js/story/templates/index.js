/**
 * FEAT-006 模板库（plan ST-002）：按条件匹配，50–150 字日记式
 * 条件：none / events / relations / both
 */

/** @typedef {{ condition: 'none'|'events'|'relations'|'both', text: string }} Template */

export const TEMPLATES = [
  {
    condition: 'none',
    text: '今天在星光小镇休息了一下，心情{{mood}}。明天再出去走走吧～'
  },
  {
    condition: 'events',
    text: '今天{{eventsSummary}}，心情{{mood}}。真是充实的一天呀。'
  },
  {
    condition: 'relations',
    text: '今天和朋友们在一起，{{relationSummary}}。心情{{mood}}，暖暖的。'
  },
  {
    condition: 'both',
    text: '今天{{eventsSummary}}，还{{relationSummary}}。心情{{mood}}，收获满满的一天～'
  }
];

export const DEFAULT_TEMPLATE = '今天在星光小镇度过了平静的一天，心情暖暖的。明天也要加油呀～';
