/**
 * FEAT-004 宠物命名校验：长度 ≤10 字、敏感词过滤（plan A3.3 / NFR-SEC-001）
 */

/** 敏感词最小集（儿童合规） */
const SENSITIVE_WORDS = ['敏感词1', '敏感词2', '违规', '脏话'];

const MAX_PET_NAME_LENGTH = 10;

/**
 * @param {string} name
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePetName(name) {
  if (name == null || typeof name !== 'string') {
    return { valid: false, message: '请输入宠物名字' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, message: '名字不能为空' };
  }
  if (trimmed.length > MAX_PET_NAME_LENGTH) {
    return { valid: false, message: `名字最多 ${MAX_PET_NAME_LENGTH} 个字哦` };
  }
  const lower = trimmed.toLowerCase();
  for (const word of SENSITIVE_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      return { valid: false, message: '这个名字不合适，换一个吧' };
    }
  }
  return { valid: true, message: '' };
}
