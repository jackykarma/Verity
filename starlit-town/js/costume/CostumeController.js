/**
 * FEAT-004 装扮与创造 - 业务层（plan A3.2.1）
 * 协调换装/墙纸/宠物/裙子；读写 FEAT-001 StorageService
 */
import { createStorage } from '../storage/index.js';
import {
  OUTFIT_KEY,
  ROOM_STYLE_KEY,
  PET_KEY,
  DRESS_DESIGN_KEY,
  DEFAULT_OUTFIT,
  DEFAULT_ROOM_STYLE,
  DEFAULT_PET,
  DEFAULT_DRESS_DESIGN,
  MAX_STICKERS_PER_DESIGN
} from './storage-keys.js';
import { validatePetName } from './validation/Validator.js';

/** @typedef {{ hairId: string, dressId: string, shoesId: string, bagId: string, styleTag: string }} Outfit */
/** @typedef {{ wallpaperId: string }} RoomStyle */
/** @typedef {{ name: string, assetRef: string }} Pet */
/** @typedef {{ stickers: Array<{ id: string, position?: { x: number, y: number } }> }} DressDesign */
/** @typedef {{ valid: boolean, message: string }} ValidationResult */

let _storage = null;

/** @type {Pet | null} 宠物未保存时的内存缓存，savePet 后仍保留以保持 getPet 一致 */
let _petCache = null;

async function getStorage() {
  if (_storage) return _storage;
  _storage = await createStorage();
  return _storage;
}

function showSaveFailed() {
  const msg = '本次未保存';
  if (typeof document !== 'undefined') {
    const el = document.getElementById('toast') || (() => {
      const t = document.createElement('div');
      t.id = 'toast';
      t.setAttribute('role', 'alert');
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(45,38,64,0.9);color:#fff;padding:12px 20px;border-radius:14px;font-size:14px;z-index:9999;max-width:90%;';
      document.body.appendChild(t);
      return t;
    })();
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
  }
}

/**
 * @returns {Promise<Outfit>}
 */
export async function getOutfit() {
  const storage = await getStorage();
  try {
    const raw = await storage.get(OUTFIT_KEY);
    if (raw && typeof raw === 'object' && 'hairId' in raw) {
      return { ...DEFAULT_OUTFIT, ...raw };
    }
  } catch (_) {}
  return { ...DEFAULT_OUTFIT };
}

/**
 * @param {string} slot - 'hairId' | 'dressId' | 'shoesId' | 'bagId' | 'styleTag'
 * @param {string} value
 * @returns {Promise<void>}
 */
export async function setOutfit(slot, value) {
  const outfit = await getOutfit();
  if (slot === 'hairId' || slot === 'dressId' || slot === 'shoesId' || slot === 'bagId' || slot === 'styleTag') {
    outfit[slot] = value || 'default';
  }
  try {
    const storage = await getStorage();
    await storage.set(OUTFIT_KEY, outfit);
  } catch (e) {
    showSaveFailed();
  }
}

/**
 * @returns {Promise<RoomStyle>}
 */
export async function getRoomStyle() {
  const storage = await getStorage();
  try {
    const raw = await storage.get(ROOM_STYLE_KEY);
    if (raw && typeof raw === 'object' && 'wallpaperId' in raw) {
      return { ...DEFAULT_ROOM_STYLE, ...raw };
    }
  } catch (_) {}
  return { ...DEFAULT_ROOM_STYLE };
}

/**
 * @param {string} wallpaperId
 * @returns {Promise<void>}
 */
export async function setRoomStyle(wallpaperId) {
  const room = await getRoomStyle();
  room.wallpaperId = wallpaperId || 'default';
  try {
    const storage = await getStorage();
    await storage.set(ROOM_STYLE_KEY, room);
  } catch (e) {
    showSaveFailed();
  }
}

/**
 * @returns {Promise<Pet>}
 */
export async function getPet() {
  if (_petCache) return { ..._petCache };
  const storage = await getStorage();
  try {
    const raw = await storage.get(PET_KEY);
    if (raw && typeof raw === 'object' && 'name' in raw) {
      _petCache = { ...DEFAULT_PET, ...raw };
      return { ..._petCache };
    }
  } catch (_) {}
  _petCache = { ...DEFAULT_PET };
  return { ..._petCache };
}

/**
 * 仅校验并更新内存中的 Pet，不持久化。通过 savePet() 持久化。
 * @param {string} name
 * @returns {Promise<ValidationResult>}
 */
export async function setPetName(name) {
  const result = validatePetName(name);
  if (!result.valid) return result;
  const pet = await getPet();
  pet.name = (name || '').trim();
  pet.assetRef = pet.assetRef || DEFAULT_PET.assetRef;
  _petCache = pet;
  return { valid: true, message: '' };
}

/**
 * 将当前 Pet 持久化到存储
 * @returns {Promise<void>}
 */
export async function savePet() {
  const pet = _petCache || await getPet();
  try {
    const storage = await getStorage();
    await storage.set(PET_KEY, pet);
  } catch (e) {
    showSaveFailed();
  }
}

/**
 * @returns {Promise<DressDesign>}
 */
export async function getDressDesign() {
  const storage = await getStorage();
  try {
    const raw = await storage.get(DRESS_DESIGN_KEY);
    if (raw && typeof raw === 'object' && Array.isArray(raw.stickers)) {
      const stickers = raw.stickers.slice(0, MAX_STICKERS_PER_DESIGN);
      return { stickers };
    }
  } catch (_) {}
  return { stickers: [...DEFAULT_DRESS_DESIGN.stickers] };
}

/**
 * @param {Array<{ id: string, position?: { x: number, y: number } }> stickers
 * @returns {Promise<void>}
 */
export async function updateDressDesign(stickers) {
  const list = Array.isArray(stickers) ? stickers.slice(0, MAX_STICKERS_PER_DESIGN) : [];
  try {
    const storage = await getStorage();
    await storage.set(DRESS_DESIGN_KEY, { stickers: list });
  } catch (e) {
    showSaveFailed();
  }
}

/**
 * 将当前裙子设计应用为装扮的 dressId（用设计 id 或 'custom'）
 * @returns {Promise<void>}
 */
export async function applyDressDesignToOutfit() {
  const design = await getDressDesign();
  const outfit = await getOutfit();
  outfit.dressId = design.stickers.length > 0 ? 'custom' : outfit.dressId === 'custom' ? 'default' : outfit.dressId;
  try {
    const storage = await getStorage();
    await storage.set(OUTFIT_KEY, outfit);
  } catch (e) {
    showSaveFailed();
  }
}
