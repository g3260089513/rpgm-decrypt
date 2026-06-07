import { useState, useRef } from 'react';
import { Card, Input, Button } from 'animal-island-ui';

interface KeyPanelProps {
  autoInfo: { key: string; hasEncryptedImages: boolean; hasEncryptedAudio: boolean } | null;
  onManualKeyChange: (key: string) => void;
  effectiveKey: string;
}

export function KeyPanel({ autoInfo, onManualKeyChange, effectiveKey }: KeyPanelProps) {
  const [manualInput, setManualInput] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAutoAvailable = autoInfo !== null;

  const handleManualChange = (value: string) => {
    const cleaned = value.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
    setManualInput(cleaned);
    onManualKeyChange(cleaned);
  };

  /** 上传 System.json 文件并提取密钥 */
  const handleSystemJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const key = data?.encryptionKey;

      if (typeof key === 'string' && key.length === 32 && /^[0-9a-fA-F]+$/.test(key)) {
        setManualInput(key.toLowerCase());
        onManualKeyChange(key.toLowerCase());
        setUseManual(true);
        setUploadFeedback(`✅ 已从 ${file.name} 读取密钥`);
      } else {
        setUploadFeedback('❌ 未找到有效的 encryptionKey 字段');
      }
    } catch {
      setUploadFeedback('❌ 文件解析失败，请确认是有效的 System.json');
    }

    // 重置 input 以允许重复上传同一文件
    e.target.value = '';
  };

  return (
    <Card color="app-yellow">
      <div style={{ marginBottom: '12px' }}>
        <strong style={{ color: '#725d42' }}>🔑 加密密钥</strong>
      </div>

      {/* 自动检测状态 */}
      {isAutoAvailable && !useManual && (
        <div style={{
          background: 'rgb(247,243,223)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '12px',
          fontSize: '14px',
        }}>
          <div style={{ color: '#6fba2c', fontWeight: 600, marginBottom: '4px' }}>
            ✅ 从项目 System.json 自动读取
          </div>
          <div style={{
            fontFamily: 'monospace',
            color: '#725d42',
            wordBreak: 'break-all',
            background: '#f8f8f0',
            padding: '8px 12px',
            borderRadius: '8px',
          }}>
            {autoInfo.key}
          </div>
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#9f927d' }}>
            加密图片: {autoInfo.hasEncryptedImages ? '是' : '否'} | 加密音频: {autoInfo.hasEncryptedAudio ? '是' : '否'}
          </div>
        </div>
      )}

      {/* 手动输入 */}
      {(useManual || !isAutoAvailable) && (
        <div>
          <Input
            size="large"
            placeholder="输入 32 位 hex 密钥"
            value={manualInput}
            onChange={e => handleManualChange((e.target as HTMLInputElement).value)}
            allowClear
            status={
              manualInput.length > 0 && manualInput.length !== 32 ? 'error' : undefined
            }
            suffix={
              <span style={{ fontSize: '12px', color: '#9f927d' }}>
                {manualInput.length}/32
              </span>
            }
          />
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {isAutoAvailable && (
          <Button
            type={useManual ? 'default' : 'primary'}
            size="small"
            onClick={() => {
              setUseManual(false);
              if (autoInfo) onManualKeyChange(autoInfo.key);
            }}
          >
            🔍 自动读取
          </Button>
        )}
        {isAutoAvailable && (
          <Button
            type={useManual ? 'primary' : 'default'}
            size="small"
            onClick={() => setUseManual(!useManual)}
          >
            ✏️ 手动输入
          </Button>
        )}
        <Button
          type="default"
          size="small"
          onClick={() => fileInputRef.current?.click()}
        >
          📤 上传 System.json
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleSystemJsonUpload}
        />
        {uploadFeedback && (
          <span style={{
            fontSize: '13px',
            color: uploadFeedback.startsWith('✅') ? '#6fba2c' : '#e05a5a',
          }}>
            {uploadFeedback}
          </span>
        )}
      </div>

      {/* 密钥就绪提示 */}
      {effectiveKey.length === 32 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: '#e6f9f6',
          color: '#11a89b',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          ✅ 密钥已就绪 ({effectiveKey.substring(0, 8)}...{effectiveKey.substring(24)})
        </div>
      )}
    </Card>
  );
}
