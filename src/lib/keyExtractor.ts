import { KEY_HEX_LENGTH } from './constants';

/**
 * 从 RPG Maker MZ 项目的 System.json 内容中提取加密密钥
 *
 * System.json 中关键字段:
 *   "encryptionKey": "13e2bc24d23418dec2e82fccb838025f"
 *   "hasEncryptedImages": true
 *   "hasEncryptedAudio": true
 *
 * @param jsonText - System.json 文本内容
 * @returns 32 字符 hex 密钥，或 null（如果未找到或无效）
 */
export function extractKeyFromSystemJson(jsonText: string): string | null {
  try {
    const data = JSON.parse(jsonText);
    const key = data?.encryptionKey;
    if (typeof key !== 'string') return null;
    if (key.length !== KEY_HEX_LENGTH) return null;
    if (!/^[0-9a-fA-F]+$/.test(key)) return null; // 必须是 hex
    return key.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * 从 System.json 中提取加密配置信息
 */
export interface SystemEncryptionInfo {
  key: string;
  hasEncryptedImages: boolean;
  hasEncryptedAudio: boolean;
}

/**
 * 提取完整的加密配置
 */
export function extractEncryptionInfo(jsonText: string): SystemEncryptionInfo | null {
  const key = extractKeyFromSystemJson(jsonText);
  if (!key) return null;

  try {
    const data = JSON.parse(jsonText);
    return {
      key,
      hasEncryptedImages: data?.hasEncryptedImages ?? true,
      hasEncryptedAudio: data?.hasEncryptedAudio ?? true,
    };
  } catch {
    return null;
  }
}
