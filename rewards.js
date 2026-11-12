(() => {
  'use strict';
  const config = window.POIMA_SITE_CONFIG || {};
  // The download-mode preview must never imply gift exchange is already open.
  if (config.phase !== 'live' || config.exchangeAvailable !== true) return;
  document.querySelector('[data-exchange-status]').textContent = '交換受付中';
  document.querySelector('[data-exchange-conditions]').textContent = 'ポイマでの交換条件と、受け取ったギフトの使い方をご案内します。';
  document.querySelector('[data-exchange-faq]').textContent = 'えらべるPayへ交換できます。';
})();
