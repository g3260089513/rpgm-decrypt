// RPG Maker MZ 加密资源相关常量
// 参考: rmmz_core.js Utils.decryptArrayBuffer

/** RPG Maker MZ 加密文件 16 字节标准头部 */
export const RPGMV_HEADER = new Uint8Array([
  0x52, 0x50, 0x47, 0x4d, 0x56, 0x00, 0x00, 0x00,
  0x00, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

/** RPG Maker MZ 常见加密文件扩展名 */
export const ENCRYPTED_EXTENSIONS = ['.png_', '.m4a_', '.ogg_'];

/** 各扩展名对应的解密后扩展名 */
export const DECRYPTED_EXTENSIONS: Record<string, string> = {
  '.png_': '.png',
  '.m4a_': '.m4a',
  '.ogg_': '.ogg',
};

/** System.json 在 RPG Maker MZ 项目中的相对路径 */
export const SYSTEM_JSON_PATH = 'data/System.json';

/** RPG Maker MZ 加密只处理 body 的前 16 字节 */
export const XOR_BYTE_COUNT = 16;

/** 加密头部字节数 */
export const HEADER_SIZE = 16;

/** 十六进制密钥字符串长度 (32 字符 = 16 字节) */
export const KEY_HEX_LENGTH = 32;

/** 解密输出文件夹名 */
export const OUTPUT_DIR_NAME = 'decrypted';

/** 图片 MIME 类型 */
export const IMAGE_MIME: Record<string, string> = {
  '.png': 'image/png',
};

/** 音频 MIME 类型 */
export const AUDIO_MIME: Record<string, string> = {
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
};
