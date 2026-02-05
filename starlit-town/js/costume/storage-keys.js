/**
 * FEAT-004 装扮与创造 - B3 存储键与默认数据结构（plan B3.2）
 */

export const OUTFIT_KEY = 'starlit.costume.outfit';
export const ROOM_STYLE_KEY = 'starlit.costume.roomStyle';
export const PET_KEY = 'starlit.costume.pet';
export const DRESS_DESIGN_KEY = 'starlit.costume.dressDesign';

/** 风格标签：甜甜/酷酷/森林/星星 */
export const STYLE_TAGS = ['sweet', 'cool', 'forest', 'star'];
export const STYLE_LABELS = { sweet: '甜甜', cool: '酷酷', forest: '森林', star: '星星' };

/** @type {{ hairId: string, dressId: string, shoesId: string, bagId: string, styleTag: string }} */
export const DEFAULT_OUTFIT = {
  hairId: 'default',
  dressId: 'default',
  shoesId: 'default',
  bagId: 'default',
  styleTag: 'sweet'
};

/** @type {{ wallpaperId: string }} */
export const DEFAULT_ROOM_STYLE = { wallpaperId: 'default' };

/** @type {{ name: string, assetRef: string }} */
export const DEFAULT_PET = { name: '小星', assetRef: 'default' };

/** @type {{ stickers: Array<{ id: string, position?: { x: number, y: number } }> }} */
export const DEFAULT_DRESS_DESIGN = { stickers: [] };

/** 贴纸单件上限 */
export const MAX_STICKERS_PER_DESIGN = 10;
