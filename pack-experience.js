// Marketing demo only. Fixed sample results; no native bridge, storage, or grants.
(() => {
  const dialog = document.querySelector('#pack-dialog');
  const find = selector => dialog.querySelector(selector);
  const stage = find('.pack-experience-stage'), viewport = find('.pack-experience-viewport');
  const pack = find('.foil-pack'), packWrap = find('.experience-pack');
  const seal = find('.foil-seal'), cutLine = find('.foil-cut');
  const bundle = find('.experience-bundle'), ticket = find('.experience-ticket');
  const turner = find('.experience-turner'), back = find('.experience-back'), front = find('.experience-front');
  const stack = find('.experience-stack'), complete = find('.experience-complete');
  const action = find('#pack-action'), title = find('#pack-title'), count = find('#pack-count'), hint = find('#pack-instruction');
  const artwork = document.querySelector('.hero .ticket').innerHTML;
  const samples = [1, 0, 3, 1, 5];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = value => Math.max(0, Math.min(1, value));
  let phase = 'closed', session = 0, index = 0, cut = 0, progress = 0, gesture = null, opener = null;

  function fit() {
    const scale = Math.max(.25, Math.min(1.2, (innerWidth - 32) / 390, (innerHeight - 40) / 540));
    viewport.style.width = `${390 * scale}px`;
    viewport.style.height = `${540 * scale}px`;
    stage.style.setProperty('--experience-scale', scale);
  }
  addEventListener('resize', fit);
  function setPhase(next) { phase = next; stage.dataset.phase = next; dialog.dataset.phase = next; }
  function controls(label, instruction) {
    action.textContent = label || '開封中'; action.disabled = !label;
    hint.textContent = instruction || '';
  }
  function tween(ms, paint) {
    const token = session;
    if (reduced()) { paint(1); return Promise.resolve(true); }
    const start = performance.now();
    return new Promise(resolve => {
      function frame(now) {
        if (token !== session || !dialog.open) return resolve(false);
        const p = clamp((now - start) / ms);
        paint(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(frame); else resolve(true);
      }
      requestAnimationFrame(frame);
    });
  }
  function setCut(value) {
    cut = clamp(value); cutLine.style.width = `${cut * 80}%`;
    seal.style.transform = `translate(${cut * 3}px,${-cut * 5}px) rotate(${-cut * 2}deg)`;
    pack.style.transform = `rotate(${-3 + cut * 1.4}deg)`;
  }
  function turn(value) {
    progress = clamp(value);
    const showFront = progress >= .5;
    back.style.visibility = showFront ? 'hidden' : 'visible'; front.style.visibility = showFront ? 'visible' : 'hidden';
    back.setAttribute('aria-hidden', String(showFront)); front.setAttribute('aria-hidden', String(!showFront));
    turner.style.transform = `translateY(${-Math.sin(Math.PI * progress) * 40}px)`;
    back.style.transform = `rotateX(${-180 * progress}deg)`;
    front.style.transform = `rotateX(${180 - 180 * progress}deg)`;
  }
  function paintTicket() {
    back.innerHTML = artwork;
    back.querySelector('.stub small').textContent = `${String(index + 1).padStart(2, '0')} / 05`;
    const n = samples[index];
    front.innerHTML = `<span class="face-main">${n ? `<span class="result-label">あたり</span><span class="prize">チケット <b>+${n}</b><small>枚</small></span>` : '<span class="miss">ハズレ</span><span class="miss-note">BONUS TICKET</span>'}</span><span class="stub"><span>${n ? '＋' : '—'}</span><small>SAMPLE</small></span>`;
    front.classList.toggle('miss-face', !n);
    stack.replaceChildren();
    for (let i = 4 - index; i >= 1; i--) {
      const layer = document.createElement('div'); layer.className = 'experience-stack-layer';
      layer.style.transform = `translate(${i * 1.5}px,${i * 10}px) rotate(${i % 2 ? -1 : 1}deg)`;
      layer.innerHTML = `<span class="experience-back">${artwork}</span>`; stack.append(layer);
    }
    turn(0);
  }
  function ready() {
    setPhase('ready'); ticket.disabled = false;
    count.textContent = `${index + 1} / 5`; title.textContent = 'この1枚を、めくろう。';
    ticket.setAttribute('aria-label', `${index + 1}枚目のチケットをめくる`);
    controls('タップでめくる', 'チケットを上になぞって、1枚ずつ ↑');
  }
  function launch(button) {
    opener = button; session++; index = 0; gesture = null;
    packWrap.hidden = false; bundle.hidden = true; complete.hidden = true;
    for (const node of [packWrap, seal, bundle, ticket]) { node.style.transform = ''; node.style.opacity = ''; }
    pack.disabled = false; ticket.disabled = true; setCut(0); turn(0); setPhase('sealed');
    title.textContent = '上端を、右になぞって。'; count.textContent = 'TRY THE DAILY PACK';
    controls('タップで開ける', '上の切り口を左から右へスワイプ →');
    if (!dialog.open) dialog.showModal(); fit();
    if (!reduced()) packWrap.animate([{opacity:0,transform:'translateY(70px) scale(.82)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:550,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  async function openPack() {
    if (phase !== 'sealed') return;
    setPhase('opening'); gesture = null; pack.disabled = true; controls(null, 'パックを開封しています');
    const start = cut;
    if (!await tween(200, p => setCut(start + (1 - start) * p))) return;
    if (!await tween(430, p => {seal.style.transform = `translate(${p * 100}px,${-p * 85}px) rotate(${p * 24}deg)`; seal.style.opacity = 1 - p;})) return;
    paintTicket(); bundle.hidden = false; bundle.style.transform = 'translate(-20px,60px) rotate(-90deg)';
    if (!await tween(720, p => {
      bundle.style.transform = `translate(-20px,${60 - p * 167}px) rotate(-90deg)`;
      packWrap.style.transform = `translateY(${p * 270}px) rotate(${p * 4}deg)`;
      packWrap.style.opacity = 1 - Math.max(0, (p - .48) / .52);
    })) return;
    packWrap.hidden = true;
    if (!await tween(560, p => {bundle.style.transform = `translate(${-20 * (1 - p)}px,${-107 * (1 - p)}px) rotate(${-90 * (1 - p)}deg)`;})) return;
    bundle.style.transform = ''; ready();
    if (document.activeElement === pack) ticket.focus({preventScroll:true});
  }
  async function flip() {
    if (phase !== 'ready') return;
    setPhase('flipping'); ticket.disabled = true; controls(null, 'チケットをめくっています');
    const start = progress;
    if (!await tween(600, p => turn(start + (1 - start) * p))) return;
    setPhase('face'); ticket.disabled = false;
    const result = samples[index] ? `あたり、チケット＋${samples[index]}枚` : 'ハズレ';
    const next = index === 4 ? '開封を終える' : '次のチケットへ';
    ticket.setAttribute('aria-label', `${result}。サンプルです。${next}`);
    controls(next, `${result} · サンプル`);
  }
  async function next() {
    if (phase !== 'face') return;
    setPhase('moving'); ticket.disabled = true; controls(null, '');
    if (!await tween(260, p => {ticket.style.opacity = 1 - p; ticket.style.transform = `translateY(${-p * 60}px)`;})) return;
    if (index === 4) {
      bundle.hidden = true; setPhase('done'); dialog.close(); return;
    }
    index++; paintTicket(); ticket.style.opacity = ''; ticket.style.transform = ''; ready();
  }
  action.addEventListener('click', () => {
    if (phase === 'sealed') openPack(); else if (phase === 'ready') flip();
    else if (phase === 'face') next(); else if (phase === 'done') launch(opener);
  });
  pack.addEventListener('pointerdown', e => {
    if (phase !== 'sealed') return;
    const r = pack.getBoundingClientRect();
    e.preventDefault(); pack.setPointerCapture(e.pointerId);
    gesture = {id:e.pointerId,x:e.clientX,y:e.clientY,width:r.width,type:'pack',moved:false,canTear:e.clientY <= r.top + r.height * .26};
  });
  pack.addEventListener('pointermove', e => {
    if (gesture?.type !== 'pack' || gesture.id !== e.pointerId) return;
    gesture.moved ||= Math.hypot(e.clientX - gesture.x,e.clientY - gesture.y) > 9;
    if (gesture.canTear) setCut((e.clientX - gesture.x) / (gesture.width * .74));
  });
  pack.addEventListener('pointerup', async e => {
    if (gesture?.type !== 'pack' || gesture.id !== e.pointerId) return;
    const moved = gesture.moved; gesture = null;
    if (!moved || cut >= .75) openPack();
    else {const start = cut; setPhase('resetting'); if (await tween(230,p => setCut(start * (1-p)))) setPhase('sealed');}
  });
  pack.addEventListener('pointercancel', () => {gesture = null; if (phase === 'sealed') setCut(0);});
  pack.addEventListener('click', e => {if (e.detail === 0) openPack();});
  ticket.addEventListener('pointerdown', e => {
    if (!['ready','face'].includes(phase)) return;
    e.preventDefault(); ticket.setPointerCapture(e.pointerId); gesture = {id:e.pointerId,y:e.clientY,x:e.clientX,type:'ticket',moved:false};
  });
  ticket.addEventListener('pointermove', e => {
    if (gesture?.type !== 'ticket' || gesture.id !== e.pointerId) return;
    gesture.moved ||= Math.hypot(e.clientX - gesture.x,e.clientY - gesture.y) > 9;
    if (phase === 'ready') turn((gesture.y - e.clientY) / (125 * parseFloat(stage.style.getPropertyValue('--experience-scale'))));
  });
  ticket.addEventListener('pointerup', async e => {
    if (gesture?.type !== 'ticket' || gesture.id !== e.pointerId) return;
    const moved = gesture.moved; gesture = null;
    if (phase === 'face') next(); else if (!moved || progress >= .65) flip();
    else {const start = progress;setPhase('resetting');if(await tween(250,p=>turn(start*(1-p))))setPhase('ready');}
  });
  ticket.addEventListener('pointercancel', () => {gesture = null; if (phase === 'ready') turn(0);});
  ticket.addEventListener('click', e => {if (e.detail === 0) {if (phase === 'face') next();else flip();}});
  document.querySelectorAll('[data-open-pack]').forEach(button => button.addEventListener('click', () => launch(button)));
  dialog.addEventListener('click', event => {
    if (!event.target.closest('button')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    session++; gesture = null; setPhase('closed');
    dialog.getAnimations({subtree:true}).forEach(animation => animation.cancel());
  });
})();
