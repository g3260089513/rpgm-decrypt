import { useRef } from 'react';
import { Card, Button, Loading } from 'animal-island-ui';

interface FileDropZoneProps {
  isDragOver: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isScanning: boolean;
  mode: 'single' | 'directory';
}

export function FileDropZone({
  isDragOver,
  onDrop,
  onFileSelect,
  isScanning,
  mode,
}: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (isScanning) {
    return (
      <Card type={mode === 'directory' ? 'dashed' : 'default'} color="app-blue">
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
        }}>
          <Loading />
          <p style={{ color: '#725d42', marginTop: '16px', fontSize: '15px' }}>
            {mode === 'directory' ? '📂 正在扫描目录结构...' : '📄 正在读取文件...'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      type="dashed"
      color={isDragOver ? 'app-teal' : 'app-blue'}
      onDrop={onDrop}
      onDragOver={handleDragOver}
      style={{
        transition: 'all 0.2s ease',
        transform: isDragOver ? 'translateY(-2px)' : undefined,
        cursor: 'pointer',
      }}
    >
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {mode === 'directory' ? '📂' : '📄'}
        </div>
        <h3 style={{ color: '#794f27', marginBottom: '8px', fontSize: '16px' }}>
          {mode === 'directory'
            ? '拖拽项目文件夹到此处'
            : '拖拽加密文件到此处'}
        </h3>
        <p style={{ color: '#ffffff', fontSize: '13px', marginBottom: '16px' }}>
          {mode === 'directory'
            ? '自动扫描 .png_ / .m4a_ / .ogg_ 并读取密钥'
            : '支持 .png_ / .m4a_ / .ogg_ 加密文件'}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {mode === 'directory' ? (
            <>
              <Button
                type="primary"
                size="large"
                icon={<span>📁</span>}
                onClick={() => fileInputRef.current?.click()}
              >
                选择项目目录
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                // @ts-expect-error webkitdirectory is not standard TS type
                webkitdirectory=""
                multiple
                style={{ display: 'none' }}
                onChange={onFileSelect}
              />
            </>
          ) : (
            <>
              <Button
                type="primary"
                size="large"
                icon={<span>📎</span>}
                onClick={() => fileInputRef.current?.click()}
              >
                选择加密文件
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png_,.m4a_,.ogg_"
                style={{ display: 'none' }}
                onChange={onFileSelect}
              />
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
