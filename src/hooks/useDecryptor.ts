import { useState, useCallback, useRef } from 'react';
import { decryptRpgmFile, getDecryptedExtension } from '../lib/decrypt';
import { createDecryptResult, revokePreviewUrl } from '../lib/fileUtils';
import type { DecryptResult } from '../lib/fileUtils';
import type { FileEntry } from './useFileDrop';

/** 解密状态机 */
export type DecryptState = 'idle' | 'decrypting' | 'done' | 'error';

/** 日志条目 */
export interface LogEntry {
  id: number;
  type: 'info' | 'success' | 'error' | 'skip';
  message: string;
  timestamp: Date;
}

let logId = 0;

export function useDecryptor() {
  const [state, setState] = useState<DecryptState>('idle');
  const [results, setResults] = useState<DecryptResult[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const abortRef = useRef<AbortController | null>(null);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { id: ++logId, type, message, timestamp: new Date() }]);
  }, []);

  /** 解密一批文件 */
  const decryptFiles = useCallback(async (
    files: FileEntry[],
    hexKey: string,
  ) => {
    // 清理旧预览
    results.forEach(r => { if (r.previewUrl) revokePreviewUrl(r.previewUrl); });

    setState('decrypting');
    setResults([]);
    setLogs([]);
    setProgress({ current: 0, total: files.length });
    abortRef.current = new AbortController();

    const encryptedFiles = files.filter(f => f.isEncrypted);
    const newResults: DecryptResult[] = [];

    addLog('info', `🔍 开始处理 ${files.length} 个文件...`);
    addLog('info', `🔑 密钥: ${hexKey.substring(0, 8)}...${hexKey.substring(24)}`);

    const skipped = files.filter(f => !f.isEncrypted);
    skipped.forEach(f => {
      addLog('skip', `⏭️ 跳过: ${f.name}（非加密文件）`);
    });

    for (let i = 0; i < encryptedFiles.length; i++) {
      if (abortRef.current?.signal.aborted) break;

      const entry = encryptedFiles[i];
      try {
        const buffer = await entry.file.arrayBuffer();
        const decryptedName = getDecryptedExtension(entry.name);
        const decryptedBuffer = decryptRpgmFile(buffer, hexKey);
        const result = createDecryptResult(entry.path, decryptedName, decryptedBuffer);

        newResults.push(result);
        setResults([...newResults]);
        setProgress({ current: i + 1, total: encryptedFiles.length });

        const sizeKB = (result.size / 1024).toFixed(1);
        addLog('success', `✅ 解密成功: ${decryptedName} (${sizeKB}KB)`);
      } catch (err: any) {
        addLog('error', `❌ 失败: ${entry.name} — ${err.message}`);
        setState('error');
        // 继续处理剩余文件，不中断
      }
    }

    if (abortRef.current?.signal.aborted) {
      addLog('info', '🛑 解密已取消');
    } else if (newResults.length > 0) {
      addLog('info', `📦 解密完成: ${newResults.length} 个文件`);
    }

    setState('done');
  }, [results, addLog]);

  /** 取消解密 */
  const cancelDecrypt = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** 重置状态 */
  const resetDecryptor = useCallback(() => {
    results.forEach(r => { if (r.previewUrl) revokePreviewUrl(r.previewUrl); });
    setState('idle');
    setResults([]);
    setLogs([]);
    setProgress({ current: 0, total: 0 });
  }, [results]);

  return {
    state,
    results,
    logs,
    progress,
    decryptFiles,
    cancelDecrypt,
    resetDecryptor,
  };
}
