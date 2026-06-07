import { Card, Button } from 'animal-island-ui';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { DecryptResult } from '../lib/fileUtils';
import type { DecryptState } from '../hooks/useDecryptor';

interface ActionBarProps {
  state: DecryptState;
  hasFiles: boolean;
  hasResults: boolean;
  effectiveKey: string;
  onDecrypt: () => void;
  onReset: () => void;
  results: DecryptResult[];
}

export function ActionBar({
  state,
  hasFiles,
  hasResults,
  effectiveKey,
  onDecrypt,
  onReset,
  results,
}: ActionBarProps) {
  const isReady = hasFiles && effectiveKey.length === 32;
  const isProcessing = state === 'decrypting';

  /** ZIP 打包下载 */
  const handleZipDownload = async () => {
    const zip = new JSZip();
    results.forEach(r => {
      zip.file(r.decryptedName, r.blob);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const date = new Date().toISOString().split('T')[0];
    saveAs(zipBlob, `decrypted-${date}.zip`);
  };

  /** 写入磁盘（使用 File System Access API） */
  const handleWriteToDisk = async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      for (const r of results) {
        const fileHandle = await dirHandle.getFileHandle(r.decryptedName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(r.blob);
        await writable.close();
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      alert('写入失败: ' + err.message);
    }
  };

  return (
    <Card>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {/* 解密按钮 */}
        {!hasResults && (
          <Button
            type="primary"
            size="large"
            disabled={!isReady}
            loading={isProcessing}
            onClick={onDecrypt}
            icon={<span>🔓</span>}
            className="btn-accent"
            style={{ minWidth: '200px' }}
          >
            {isProcessing ? '解密中...' : '开始解密'}
          </Button>
        )}

        {/* 解密完成后的操作 */}
        {hasResults && (
          <>
            <Button
              type="primary"
              size="large"
              icon={<span>📦</span>}
              onClick={handleZipDownload}
              style={{ minWidth: '160px' }}
            >
              下载 ZIP 包
            </Button>
            <Button
              type="default"
              size="large"
              icon={<span>💾</span>}
              onClick={handleWriteToDisk}
            >
              写入磁盘
            </Button>
            <Button
              type="text"
              size="large"
              onClick={onReset}
            >
              🔄 重新解密
            </Button>
          </>
        )}

        {/* 无密钥提示 */}
        {hasFiles && effectiveKey.length !== 32 && !hasResults && (
          <span style={{ color: '#e05a5a', fontSize: '13px' }}>
            ⚠️ 请先设置解密密钥（32 位 hex）
          </span>
        )}

        {/* 无文件提示 */}
        {!hasFiles && (
          <span style={{ color: 'inherit', fontSize: '13px' }}>
            👆 请先拖拽文件或选择项目目录
          </span>
        )}
      </div>
    </Card>
  );
}
