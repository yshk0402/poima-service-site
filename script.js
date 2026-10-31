const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function fit(){document.documentElement.style.setProperty('--scale',String(Math.min(innerWidth/390,700/390)))}fit();addEventListener('resize',fit);
const menu=$('#mobile-menu'), toggle=$('.menu-toggle'), notice=$('#notice-dialog');
toggle.addEventListener('click',()=>{menu.showModal();toggle.setAttribute('aria-expanded','true')});
menu.addEventListener('close',()=>toggle.setAttribute('aria-expanded','false'));
$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
$$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>menu.close()));
$$('.demo-choices button').forEach(b=>b.addEventListener('click',()=>$$('.demo-choices button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))));
const track=$('.topic-track'), controls=$$('[data-slide]');
function updateControls(){controls[0].disabled=track.scrollLeft<2;controls[1].disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-3}
controls.forEach(b=>b.addEventListener('click',()=>{const card=$('.topic');const gap=parseFloat(getComputedStyle(track).gap)||15;track.scrollBy({left:Number(b.dataset.slide)*(card.offsetWidth+gap),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}));
track.addEventListener('scroll',updateControls,{passive:true});addEventListener('resize',updateControls);updateControls();
function showNotice(title,body){if(menu.open)menu.close();$('#notice-title').textContent=title;$('#notice-body').textContent=body;notice.showModal()}
let live=new URLSearchParams(location.search).get('phase')==='live';
if(live){$$('[data-main-cta]').forEach(n=>n.textContent='アプリをダウンロード');$$('[data-phase-label]').forEach(n=>n.textContent='DOWNLOAD');$('.nav-cta').textContent='ダウンロード';$('#release-status').textContent='iOS / Android';}
$$('[data-notify]').forEach(b=>b.addEventListener('click',()=>showNotice(live?'ダウンロード導線':'リリース通知',live?'配信開始後のデザイン確認用です。App Store・Google Playの実URLは未接続です。':'通知登録先は未接続です。この画面から登録・送信は行いません。')));
$$('[data-info]').forEach(b=>b.addEventListener('click',()=>showNotice(b.dataset.info,'ここはデザイン確認用の導線です。公開時に確定した情報とURLを接続します。')));
$$('a[href="#faq-points"]').forEach(a=>a.addEventListener('click',()=>$('#faq-points').open=true));

// Progressive enhancement: readable without JS, with reduced motion, or on print.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const elements = $$('#howto .section-head, #howto .step');
  const reveal = element => {
    element.classList.add('is-revealed');
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.12});
  elements.forEach((element, index) => {
    if (element.getBoundingClientRect().top < innerHeight * .9) return;
    element.style.setProperty('--reveal-delay', `${Math.max(0, index - 1) * 110}ms`);
    element.classList.add('scroll-reveal');
    observer.observe(element);
  });
  $('#howto').addEventListener('focusin', event => {
    const element = event.target.closest('.scroll-reveal');
    if (element) reveal(element);
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { elements.forEach(reveal); observer.disconnect(); }
  });
})();
