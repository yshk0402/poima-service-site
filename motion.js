(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = 'cubic-bezier(.16,1,.3,1)';
  const active = new Set();
  function animate(node, frames, options = {}) {
    if (!node || reduce.matches || document.hidden) return null;
    const animation = node.animate(frames, {duration:560,easing:ease,fill:'backwards',...options});
    active.add(animation);
    animation.finished.catch(() => {}).finally(() => active.delete(animation));
    return animation;
  }
  function enter(node, delay=0, x=0, y=18, duration=560) {
    return animate(node,[{opacity:0,transform:`translate(${x}px,${y}px)`},{opacity:1,transform:'translate(0,0)'}],{delay,duration});
  }
  const effects = new WeakMap();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      entry.target.dataset.motionSeen = 'true';
      effects.get(entry.target)?.();
    }
  }, {threshold:.12,rootMargin:'0px 0px -24px 0px'});
  function once(selector, effect) {
    document.querySelectorAll(selector).forEach(node => {effects.set(node,()=>effect(node));observer.observe(node)});
  }
  once('.hero h1', node => [...node.children].forEach((line,i)=>enter(line,i*80,0,12,640)));
  once('.topic-montage', node => {
    node.querySelectorAll('.rail').forEach((rail,i)=>enter(rail,i*75,i%2?-20:24,10,720));
    enter(node.querySelector('.hit'),260,0,7,420);
    enter(node.querySelector('.earned'),380,0,10,500);
  });
  once('.hero-action', node => enter(node,80,0,12));
  once('#daily h2,#points h2,.faq-section .section-head,#release h2', node => enter(node,0,0,18));
  once('.pack-visual', node => animate(node,[{opacity:0,transform:'translateY(24px) rotate(-6deg) scale(.96)'},{opacity:1,transform:'translateY(0) rotate(0) scale(1)'}],{duration:800}));
  once('.reward-flow', node => [...node.children].forEach((part,i)=>enter(part,i*140,0,10,460)));
  once('#release .button', node => enter(node,80,0,14));

  // Native summary click/keyboard activation remains the entry point. Keep the
  // answer in the layout while animating closed so the surrounding page follows.
  const accordionStates = new Map();
  document.querySelectorAll('.faq-list details,.reward-details').forEach(details => {
    const summary = details.querySelector('summary');
    const state = {animation:null,desired:details.open};
    accordionStates.set(details,state);
    summary.addEventListener('click', event => {
      if (reduce.matches) return;
      event.preventDefault();
      const start = details.getBoundingClientRect().height;
      const opening = state.animation ? !state.desired : !details.open;
      state.animation?.cancel();
      state.desired = opening;
      details.open = true;
      const end = opening ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + (details.offsetHeight-details.clientHeight);
      details.style.overflow = 'hidden';
      const animation = animate(details,[{height:start+'px'},{height:end+'px'}],{duration:260,easing:'cubic-bezier(.22,.7,.25,1)',fill:'none'});
      if (!animation) {details.open=opening;details.style.overflow='';state.animation=null;return;}
      state.animation = animation;
      animation.onfinish = () => {if(state.animation!==animation)return;details.open=opening;details.style.overflow='';state.animation=null;};
      if(opening)enter(details.querySelector('p'),40,0,5,220);
    });
  });
  const menu = document.querySelector('#mobile-menu');
  if (menu) new MutationObserver(() => {
    if(menu.open)animate(menu,[{opacity:0,transform:'translateY(8px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:220});
  }).observe(menu,{attributes:true,attributeFilter:['open']});
  reduce.addEventListener('change', () => {
    if (!reduce.matches) return;
    active.forEach(animation => animation.cancel());
    accordionStates.forEach((state,details)=>{if(state.animation){details.open=state.desired;details.style.overflow='';state.animation=null;}});
  });
})();
