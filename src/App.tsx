import { useState, useMemo } from 'react';
import { Tabs, Divider, Modal } from 'animal-island-ui';
import { extractEncryptionInfo } from './lib/keyExtractor';
import { useFileDrop } from './hooks/useFileDrop';
import { useDecryptor } from './hooks/useDecryptor';
import { AppHeader } from './components/AppHeader';
import { KeyPanel } from './components/KeyPanel';
import { FileDropZone } from './components/FileDropZone';
import { FileList } from './components/FileList';
import { ProgressPanel } from './components/ProgressPanel';
import { PreviewGrid } from './components/PreviewGrid';
import { ActionBar } from './components/ActionBar';

export function App() {
  const [activeTab, setActiveTab] = useState('single');
  const [manualKey, setManualKey] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const {
    files,
    directoryScan,
    isScanning,
    handleDrop,
    handleFileSelect,
    clearFiles,
  } = useFileDrop();

  const {
    state,
    results,
    logs,
    progress,
    decryptFiles,
    resetDecryptor,
  } = useDecryptor();

  // 自动提取密钥
  const autoInfo = useMemo(() => {
    if (directoryScan?.systemJsonContent) {
      return extractEncryptionInfo(directoryScan.systemJsonContent);
    }
    return null;
  }, [directoryScan]);

  // 生效的密钥: 手动优先，自动备用
  const effectiveKey = manualKey.length === 32
    ? manualKey
    : autoInfo?.key ?? '';

  const [dragOver, setDragOver] = useState(false);

  const handleDropWithState = (e: React.DragEvent<HTMLDivElement>) => {
    setDragOver(false);
    handleDrop(e);
  };

  return (
    <div>
      {/* 标题 */}
      <AppHeader />

      {/* 帮助按钮 */}
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        <span
          onClick={() => setShowHelp(true)}
          style={{
            color: '#19c8b9',
            cursor: 'pointer',
            fontSize: '13px',
            textDecoration: 'underline',
          }}
        >
          📖 使用帮助
        </span>
      </div>

      <div className="app-section">
        {/* 密钥面板 */}
        <KeyPanel
          autoInfo={autoInfo}
          onManualKeyChange={setManualKey}
          effectiveKey={effectiveKey}
        />
      </div>

      <div className="app-section">
        <Divider />
      </div>

      {/* 功能标签页 */}
      <div className="app-section">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'single', label: '📄 单文件解密', children: null },
            { key: 'directory', label: '📁 项目目录批量', children: null },
          ]}
        />
      </div>

      <div className="app-section">
        {/* 文件拖放区 */}
        <div
          onDragEnter={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
        >
          <FileDropZone
            isDragOver={dragOver}
            onDrop={handleDropWithState}
            onFileSelect={handleFileSelect}
            isScanning={isScanning}
            mode={activeTab === 'directory' ? 'directory' : 'single'}
          />
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="app-section">
          <FileList files={files} onClear={clearFiles} />
        </div>
      )}

      {/* 解密进度 */}
      <div className="app-section">
        <ProgressPanel
          logs={logs}
          current={progress.current}
          total={progress.total}
          isProcessing={state === 'decrypting'}
        />
      </div>

      {/* 操作栏 */}
      <div className="app-section">
        <ActionBar
          state={state}
          hasFiles={files.length > 0}
          hasResults={results.length > 0}
          effectiveKey={effectiveKey}
          onDecrypt={() => decryptFiles(files, effectiveKey)}
          onReset={resetDecryptor}
          results={results}
        />
      </div>

      {/* 图片/音频预览 */}
      {results.length > 0 && (
        <div className="app-section">
          <PreviewGrid results={results} />
        </div>
      )}

      {/* 帮助弹窗 */}
      <Modal
        open={showHelp}
        title="📖 使用帮助"
        onClose={() => setShowHelp(false)}
        footer={null}
        width="600px"
        typewriter={false}
      >
        <div style={{ whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.8', color: '#725d42' }}>
{`🔑 密钥获取:
  方法一: 选择包含 "data/System.json" 的项目目录，密钥自动读取
  方法二: 手动输入 32 位 hex 密钥

📄 单文件模式:
  拖拽 .png_ / .m4a_ / .ogg_ 文件或点击"选择加密文件"

📁 批量模式:
  拖拽整个项目文件夹，或用"选择项目目录"按钮
  自动扫描所有加密资源文件

🔓 解密过程:
  点击"开始解密" → 等待进度条完成 → 预览图片/音频
  → ZIP 打包下载 或 写入磁盘

📝 注意事项:
  - 原文件不会被修改
  - 解密输出到新文件夹或 ZIP 包
  - 仅支持 RPG Maker MV/MZ 加密格式
  - 密钥是 32 位十六进制字符串`}
        </div>
      </Modal>
    </div>
  );
}
