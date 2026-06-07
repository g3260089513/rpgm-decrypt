import { Card, Typewriter } from 'animal-island-ui';
import type { LogEntry } from '../hooks/useDecryptor';

interface ProgressPanelProps {
  logs: LogEntry[];
  current: number;
  total: number;
  isProcessing: boolean;
}

const LOG_ICONS: Record<LogEntry['type'], string> = {
  info: '💬',
  success: '',
  error: '',
  skip: '',
};

export function ProgressPanel({ logs, current, total, isProcessing }: ProgressPanelProps) {
  if (logs.length === 0 && !isProcessing) return null;

  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Card>
      <strong style={{ color: '#725d42' }}>📝 解密日志</strong>

      {/* 进度条 */}
      {total > 0 && (
        <div style={{ margin: '12px 0' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
            fontSize: '13px',
            color: '#725d42',
          }}>
            <span>{isProcessing ? '🔄 解密中...' : '✅ 完成'}</span>
            <span>{current} / {total} ({percent}%)</span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            borderRadius: '50px',
            background: '#f0ecd8',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${percent}%`,
              height: '100%',
              borderRadius: '50px',
              background: percent === 100
                ? 'linear-gradient(90deg, #6fba2c, #86d67a)'
                : 'linear-gradient(90deg, #19c8b9, #3dd4c6)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* Typewriter 日志 */}
      {logs.length > 0 && (
        <div style={{
          background: '#2b2118',
          borderRadius: '16px',
          padding: '12px 16px',
          maxHeight: '200px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.7',
        }}>
          <Typewriter speed={10} trigger={logs.length}>
            {logs.map(l =>
              `${LOG_ICONS[l.type] || ''} ${l.message}`
            ).join('\n')}
          </Typewriter>
        </div>
      )}
    </Card>
  );
}
