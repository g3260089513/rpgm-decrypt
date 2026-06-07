import { useState, useCallback, useRef } from 'react';
import { ENCRYPTED_EXTENSIONS, SYSTEM_JSON_PATH } from '../lib/constants';

/** 单个文件条目 */
export interface FileEntry {
  /** 唯一 ID */
  id: string;
  /** 相对路径（目录模式下）或文件名 */
  path: string;
  /** 文件名 */
  name: string;
  /** File 对象 */
  file: File;
  /** 是否为加密文件 */
  isEncrypted: boolean;
}

/** 目录扫描结果 */
export interface DirectoryScan {
  /** 扫描到的文件列表 */
  files: FileEntry[];
  /** 找到的 System.json 内容（用于自动提取密钥） */
  systemJsonContent: string | null;
  /** 目录名 */
  directoryName: string;
}

let idCounter = 0;
function nextId(): string {
  return `file-${++idCounter}-${Date.now()}`;
}

export function useFileDrop() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [directoryScan, setDirectoryScan] = useState<DirectoryScan | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  /** 判断文件名是否为加密文件 */
  const isEncryptedFile = (name: string): boolean => {
    const lower = name.toLowerCase();
    return ENCRYPTED_EXTENSIONS.some(ext => lower.endsWith(ext));
  };

  /** 递归遍历目录树 */
  const scanDirectoryEntry = useCallback(async (
    entry: FileSystemDirectoryEntry | FileSystemDirectoryHandle,
    basePath: string = ''
  ): Promise<{ files: FileEntry[]; systemJson: string | null }> => {
    const result: FileEntry[] = [];
    let systemJson: string | null = null;

    // File System Access API (showDirectoryPicker)
    if ('values' in entry && typeof entry.values === 'function') {
      for await (const handle of entry.values()) {
        const name = handle.name;
        if (handle.kind === 'file') {
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const fullPath = basePath ? `${basePath}/${name}` : name;

          if (name === 'System.json' && basePath === 'data') {
            systemJson = await file.text();
          }

          if (isEncryptedFile(name) || name === 'System.json') {
            result.push({
              id: nextId(),
              path: fullPath,
              name,
              file,
              isEncrypted: isEncryptedFile(name),
            });
          }
        } else if (handle.kind === 'directory') {
          const dirHandle = handle as FileSystemDirectoryHandle;
          const subPath = basePath ? `${basePath}/${name}` : name;
          const sub = await scanDirectoryEntry(dirHandle, subPath);
          result.push(...sub.files);
          if (sub.systemJson) systemJson = sub.systemJson;
        }
      }
      return { files: result, systemJson };
    }

    // Legacy: DataTransferItem.webkitGetAsEntry (drop directory)
    const dirEntry = entry as FileSystemDirectoryEntry;
    const reader = dirEntry.createReader();

    const readAllEntries = (): Promise<FileSystemEntry[]> => {
      return new Promise((resolve) => {
        const allEntries: FileSystemEntry[] = [];
        const readBatch = () => {
          reader.readEntries((entries) => {
            if (entries.length === 0) {
              resolve(allEntries);
            } else {
              allEntries.push(...entries);
              readBatch();
            }
          });
        };
        readBatch();
      });
    };

    const entries = await readAllEntries();
    for (const child of entries) {
      const childPath = basePath ? `${basePath}/${child.name}` : child.name;

      if (child.isFile) {
        const fileEntry = child as FileSystemFileEntry;
        const file = await new Promise<File>((resolve) => {
          fileEntry.file(resolve);
        });

        if (child.name === 'System.json' && childPath === SYSTEM_JSON_PATH) {
          systemJson = await file.text();
        }

        if (isEncryptedFile(child.name) || child.name === 'System.json') {
          result.push({
            id: nextId(),
            path: childPath,
            name: child.name,
            file,
            isEncrypted: isEncryptedFile(child.name),
          });
        }
      } else if (child.isDirectory) {
        const subEntry = child as FileSystemDirectoryEntry;
        const sub = await scanDirectoryEntry(subEntry, childPath);
        result.push(...sub.files);
        if (sub.systemJson) systemJson = sub.systemJson;
      }
    }

    return { files: result, systemJson };
  }, []);

  /** 处理拖入的文件/目录 */
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsScanning(true);

    try {
      const items = e.dataTransfer.items;
      const allFiles: FileEntry[] = [];
      let systemJson: string | null = null;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.kind === 'file') {
          const entry = (item as any).webkitGetAsEntry?.() as FileSystemEntry | null;

          if (entry?.isDirectory) {
            // 拖入目录 → 递归扫描
            const scan = await scanDirectoryEntry(entry as FileSystemDirectoryEntry);
            allFiles.push(...scan.files);
            if (scan.systemJson) systemJson = scan.systemJson;
          } else if (entry?.isFile) {
            const file = item.getAsFile();
            if (file) {
              allFiles.push({
                id: nextId(),
                path: file.name,
                name: file.name,
                file,
                isEncrypted: isEncryptedFile(file.name),
              });
            }
          } else {
            // fallback: 直接读文件
            const file = item.getAsFile();
            if (file) {
              allFiles.push({
                id: nextId(),
                path: file.name,
                name: file.name,
                file,
                isEncrypted: isEncryptedFile(file.name),
              });
            }
          }
        }
      }

      setFiles(allFiles);
      if (systemJson || allFiles.length > 0) {
        setDirectoryScan({
          files: allFiles,
          systemJsonContent: systemJson,
          directoryName: systemJson ? 'RPG Maker MZ 项目' : '拖拽文件',
        });
      }
    } catch (err) {
      console.error('Drop processing error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [scanDirectoryEntry]);

  /** 处理文件选择器（多选文件 / webkitdirectory 目录） */
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsScanning(true);
    try {
      const selected = Array.from(e.target.files ?? []);
      const entries: FileEntry[] = [];
      let systemJson: string | null = null;

      for (const file of selected) {
        // webkitdirectory 文件有 webkitRelativePath
        const relativePath = (file as any).webkitRelativePath || file.name;

        entries.push({
          id: nextId(),
          path: relativePath,
          name: file.name,
          file,
          isEncrypted: isEncryptedFile(file.name),
        });

        // 检测 data/System.json
        if (relativePath === SYSTEM_JSON_PATH || file.name === 'System.json') {
          try {
            systemJson = await file.text();
          } catch { /* ignore */ }
        }
      }

      setFiles(entries);
      setDirectoryScan({
        files: entries,
        systemJsonContent: systemJson,
        directoryName: entries[0]?.path.split('/')[0] || '选中文件',
      });
    } catch (err) {
      console.error('File select error:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  /** 使用 showDirectoryPicker 选择项目目录 */
  const handleDirectorySelect = useCallback(async () => {
    try {
      setIsScanning(true);
      const dirHandle = await (window as any).showDirectoryPicker();
      const scan = await scanDirectoryEntry(dirHandle as FileSystemDirectoryHandle);
      setFiles(scan.files);
      setDirectoryScan({
        files: scan.files,
        systemJsonContent: scan.systemJson,
        directoryName: dirHandle.name,
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Directory picker error:', err);
      }
    } finally {
      setIsScanning(false);
    }
  }, [scanDirectoryEntry]);

  /** 清空文件列表 */
  const clearFiles = useCallback(() => {
    setFiles([]);
    setDirectoryScan(null);
  }, []);

  return {
    files,
    directoryScan,
    isScanning,
    dropZoneRef,
    handleDrop,
    handleFileSelect,
    handleDirectorySelect,
    clearFiles,
    setFiles,
  };
}
