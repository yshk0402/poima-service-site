(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const menu = $('#mobile-menu');
  const toggle = $('.menu-toggle');
  const notice = $('#notice-dialog');
  const config = window.POIMA_SITE_CONFIG || {};
  const live = config.phase === 'live' || new URLSearchParams(location.search).get('phase') === 'live';
  const safeURL = value => {
    if (!value) return null;
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
    catch { return null; }
  };
  toggle.addEventListener('click', () => {
    menu.showModal();
    toggle.setAttribute('aria-expanded', 'true');
  });
  menu.addEventListener('close', () => toggle.setAttribute('aria-expanded', 'false'));
  $$('.close-dialog').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }));
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => {
    menu.close();
    // Closing a modal restores its opener's focus. Move focus to the destination next.
    const target = $(link.hash);
    if (target) requestAnimationFrame(() => { target.tabIndex = -1; target.focus({preventScroll:true}); });
  }));
  function showNotice(title, body) {
    if (menu.open) menu.close();
    $('#notice-title').textContent = title;
    $('#notice-body').textContent = body;
    if (!notice.open) notice.showModal();
  }
  if (live) {
    $$('[data-main-cta]').forEach(label => label.textContent = 'アプリをダウンロード');
    $('#release-status').textContent = 'iOS / Android';
  }
  $$('[data-notify]').forEach(button => button.addEventListener('click', () => {
    const url = safeURL(live ? config.downloadUrl : config.notificationUrl);
    if (url) { location.assign(url); return; }
    showNotice(live ? 'アプリのダウンロード' : 'リリース通知', live
      ? '配信開始後の表示サンプルです。App Store・Google Playのリンクは準備中です。'
      : 'リリース通知の受付は準備中です。\nこのプレビューでは登録・送信は行いません。');
  }));
  $$('[data-info]').forEach(button => button.addEventListener('click', () => {
    const url = safeURL(config.infoLinks?.[button.dataset.info]);
    if (url) { location.assign(url); return; }
    showNotice(button.dataset.info, '公開時に確定した情報をご案内します。\n現在はデザイン確認用のプレビューです。');
  }));
  function revealHash() {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target?.tagName === 'DETAILS') target.open = true;
  }
  addEventListener('hashchange', revealHash);
  revealHash();
})();
