import { RPGMV_HEADER, HEADER_SIZE, XOR_BYTE_COUNT, KEY_HEX_LENGTH } from './constants';

/**
 * 解密单个 RPG Maker MZ 加密文件
 *
 * 加密格式:
 *   [16 字节 RPGMV 头部] [前 16 字节 XOR 加密的原始数据] [其余未加密数据]
 *
 * 算法:
 *   1. 验证前 16 字节 === RPGMV_HEADER
 *   2. 将 hexKey 转为 16 字节 Uint8Array
 *   3. 对 body[0..15] 逐字节 XOR key[i]
 *   4. 返回解密后的完整原始数据（不含 RPGMV 头部）
 *
 * @param buffer - 文件原始 ArrayBuffer
 * @param hexKey - 32 字符的十六进制加密密钥
 * @returns 解密后的 ArrayBuffer（PNG/M4A/OGG 原始数据）
 * @throws 如果头部不匹配 RPGMV 签名
 */
export function decryptRpgmFile(buffer: ArrayBuffer, hexKey: string): ArrayBuffer {
  if (hexKey.length !== KEY_HEX_LENGTH) {
    throw new Error(
      `密钥长度错误: 期望 ${KEY_HEX_LENGTH} 字符，实际 ${hexKey.length} 字符`
    );
  }

  const data = new Uint8Array(buffer);

  // 1. 验证 RPGMV 头部
  for (let i = 0; i < HEADER_SIZE; i++) {
    if (data[i] !== RPGMV_HEADER[i]) {
      const actual = Array.from(data.slice(0, HEADER_SIZE))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
      throw new Error(
        `文件头部不匹配 RPG Maker MZ 加密格式\n期望: 52 50 47 4d 56...\n实际: ${actual}`
      );
    }
  }

  // 2. 将 hex 密钥转为字节数组
  const keyBytes = parseHexKey(hexKey);

  // 3. XOR 解密 body 的前 16 字节（原地修改副本）
  const bodyOffset = HEADER_SIZE;
  const decrypted = new Uint8Array(buffer.byteLength - bodyOffset);
  // 复制 body 数据
  decrypted.set(data.subarray(bodyOffset));

  // XOR 前 16 字节
  for (let i = 0; i < XOR_BYTE_COUNT && i < decrypted.length; i++) {
    decrypted[i] ^= keyBytes[i];
  }

  return decrypted.buffer;
}

/**
 * 将 32 字符十六进制密钥解析为 16 字节数组
 */
function parseHexKey(hexKey: string): Uint8Array {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hexKey.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * 检查文件是否为 RPG Maker MZ 加密格式（仅检查头部）
 */
export function isRpgmEncrypted(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < HEADER_SIZE) return false;
  const header = new Uint8Array(buffer, 0, HEADER_SIZE);
  return header.every((b, i) => b === RPGMV_HEADER[i]);
}

/**
 * 根据加密文件扩展名获取解密后的扩展名
 */
export function getDecryptedExtension(encryptedName: string): string {
  for (const [enc, dec] of Object.entries({
    '.png_': '.png',
    '.m4a_': '.m4a',
    '.ogg_': '.ogg',
  })) {
    if (encryptedName.toLowerCase().endsWith(enc)) {
      return encryptedName.slice(0, -enc.length) + dec;
    }
  }
  // 不是已知加密扩展名，去掉末尾下划线
  return encryptedName.replace(/_$/, '');
}
