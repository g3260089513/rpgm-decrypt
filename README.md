# 🔓 RPG Maker MV/MZ 图片解密工具

解密 RPG Maker MV/MZ 游戏的加密资源文件（`.png_` / `.m4a_` / `.ogg_`），支持单文件拖拽和项目目录批量扫描。

## 快速开始

双击 **`开始使用.bat`** 即可启动（首次运行会自动安装依赖）。

或手动运行：

```bash
npm install
npm run dev
```

## 功能

- 📄 **单文件解密** — 拖拽或选择 `.png_` / `.m4a_` / `.ogg_` 文件
- 📁 **批量扫描** — 选择 RPG Maker 项目目录，自动扫描所有加密资源
- 🔑 **自动密钥** — 自动读取项目中的 `data/System.json` 提取密钥，也支持手动输入
- 🖼️ **即时预览** — 解密后图片网格预览，音频可在线播放
- 📦 **导出方式** — ZIP 打包下载，或写入本地磁盘
- 🎮 **动森风 UI** — 动物森友会风格界面，基于 [animal-island-ui](https://github.com/guokaigdg/animal-island-ui)

## 解密原理

RPG Maker MZ 加密格式：文件前 16 字节为 `RPGMV` 标识头，紧接着 16 字节与密钥 XOR 加密，其余数据未加密。密钥存储在 `data/System.json` 的 `encryptionKey` 字段。

## 技术栈

- React + TypeScript + Vite
- [animal-island-ui](https://github.com/guokaigdg/animal-island-ui) — 动森风格组件库
- JSZip + FileSaver — 打包下载

## 构建

```bash
npm run build    # 输出到 dist/
npm run preview  # 预览构建结果
```
