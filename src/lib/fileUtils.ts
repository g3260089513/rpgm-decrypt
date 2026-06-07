import { IMAGE_MIME, AUDIO_MIME } from './constants';

/** 解密结果 */
export interface DecryptResult {
  /** 原始文件名（含路径） */
  originalName: string;
  /** 解密后文件名 */
  decryptedName: string;
  /** 解密后文件 Blob */
  blob: Blob;
  /** 文件大小（字节） */
  size: number;
  /** 图片预览 URL（仅图片），音频文件为 null */
  previewUrl: string | null;
  /** 是否为音频文件 */
  isAudio: boolean;
}

/**
 * 根据扩展名获取 MIME 类型
 */
export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  return IMAGE_MIME[`.${ext}`] ?? AUDIO_MIME[`.${ext}`] ?? 'application/octet-stream';
}

/**
 * 判断文件是否为图片
 */
export function isImageFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.png');
}

/**
 * 判断文件是否为音频
 */
export function isAudioFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.endsWith('.m4a') || lower.endsWith('.ogg');
}

/**
 * 创建解密结果对象
 */
export function createDecryptResult(
  originalName: string,
  decryptedName: string,
  buffer: ArrayBuffer,
): DecryptResult {
  const mimeType = getMimeType(decryptedName);
  const blob = new Blob([buffer], { type: mimeType });

  let previewUrl: string | null = null;
  if (isImageFile(decryptedName)) {
    previewUrl = URL.createObjectURL(blob);
  }

  return {
    originalName,
    decryptedName,
    blob,
    size: buffer.byteLength,
    previewUrl,
    isAudio: isAudioFile(decryptedName),
  };
}

/**
 * 清理预览 URL（释放内存）
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
