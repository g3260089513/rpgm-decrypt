import { useState } from 'react';
import { Card, Modal } from 'animal-island-ui';
import type { DecryptResult } from '../lib/fileUtils';

interface PreviewGridProps {
  results: DecryptResult[];
}

export function PreviewGrid({ results }: PreviewGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = results.filter(r => r.previewUrl);
  const audioFiles = results.filter(r => r.isAudio);

  if (results.length === 0) return null;

  return (
    <>
      {/* 图片网格预览 */}
      {images.length > 0 && (
        <Card color="app-green">
          <strong style={{ color: '#fff', display: 'block', marginBottom: '12px' }}>
            🖼️ 解密图片预览 ({images.length})
          </strong>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px',
          }}>
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(img.previewUrl)}
                style={{ cursor: 'pointer' }}
              >
                <Card color="default" style={{ padding: '8px', textAlign: 'center' }}>
                  <img
                    src={img.previewUrl!}
                    alt={img.decryptedName}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      background: '#f8f8f0',
                    }}
                  />
                  <div style={{
                    fontSize: '11px',
                    color: 'inherit',
                    marginTop: '6px',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {img.decryptedName}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 音频文件列表 */}
      {audioFiles.length > 0 && (
        <Card color="app-orange">
          <strong style={{ color: '#fff', display: 'block', marginBottom: '12px' }}>
            🎵 解密音频 ({audioFiles.length})
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {audioFiles.map((audio, i) => {
              const audioUrl = URL.createObjectURL(audio.blob);
              return (
                <Card key={i}>
                  <div style={{ fontSize: '13px', color: '#725d42', marginBottom: '6px', fontFamily: 'monospace' }}>
                    {audio.decryptedName}
                  </div>
                  <audio
                    controls
                    src={audioUrl}
                    style={{ width: '100%', height: '32px' }}
                  />
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* 大图预览 Modal */}
      <Modal
        open={selectedImage !== null}
        title="图片预览"
        onClose={() => setSelectedImage(null)}
        footer={null}
        width="80vw"
      >
        {selectedImage && (
          <img
            src={selectedImage}
            alt="预览"
            style={{
              width: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '12px',
            }}
          />
        )}
      </Modal>
    </>
  );
}
