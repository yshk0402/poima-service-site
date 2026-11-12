// Set verified destination URLs when registration or distribution opens.
// An empty destination shows a preparation notice; it never submits anything.
window.POIMA_SITE_CONFIG = {
  phase: 'prelaunch', // 'prelaunch' | 'live'; ?phase=live previews the released mode
  exchangeAvailable: false, // Enable only after gift exchange is actually available.
  notificationUrl: '',
  downloadUrl: '',
  infoLinks: {
    '運営会社': '',
    '利用規約': '',
    'プライバシーポリシー': '',
    'お問い合わせ': ''
  },
  ...window.POIMA_SITE_CONFIG
};
