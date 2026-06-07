import { Card, Button } from 'animal-island-ui';
import type { FileEntry } from '../hooks/useFileDrop';

interface FileListProps {
  files: FileEntry[];
  onClear: () => void;
}

/** 格式化文件大小 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function FileList({ files, onClear }: FileListProps) {
  if (files.length === 0) return null;

  const encrypted = files.filter(f => f.isEncrypted);
  const skipped = files.filter(f => !f.isEncrypted);

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <strong style={{ color: '#725d42' }}>
          📋 文件列表 ({encrypted.length} 个加密文件{skipped.length > 0 ? `，${skipped.length} 个其他文件` : ''})
        </strong>
        <Button type="text" size="small" onClick={onClear}>
          🗑️ 清空
        </Button>
      </div>

      <div style={{
        maxHeight: '240px',
        overflowY: 'auto',
        borderRadius: '12px',
      }}>
        {files.map(f => (
          <div
            key={f.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderBottom: '1px solid #f0ecd8',
              fontSize: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{f.isEncrypted ? '🔒' : '📎'}</span>
              <span style={{
                color: f.isEncrypted ? '#725d42' : '#c4b89e',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}>
                {f.path}
              </span>
            </div>
            <span style={{ color: 'inherit', fontSize: '12px' }}>
              {formatSize(f.file.size)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
