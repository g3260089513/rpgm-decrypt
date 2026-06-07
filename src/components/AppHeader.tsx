import { Title, Icon } from 'animal-island-ui';

export function AppHeader() {
  return (
    <header style={{ textAlign: 'center', padding: '24px 0 8px' }}>
      <Title size="large" color="app-teal">
        <Icon name="icon-diy" />
        {' '}图片解密工具{' '}
        <Icon name="icon-diy" />
      </Title>
      <p style={{
        color: 'inherit',
        fontSize: '14px',
        marginTop: '8px',
        fontFamily: 'inherit',
      }}>
        RPG Maker MV/MZ 加密资源解密 — 支持 .png_ / .m4a_ / .ogg_
      </p>
    </header>
  );
}
