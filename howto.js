(() => {
  'use strict';
  const story = document.querySelector('.howto-story');
  if (!story) return;
  const stage = story.querySelector('.ht-stage');
  const panels = [...story.querySelectorAll('.ht-panel')];
  const copyLayers = story.querySelector('.ht-copy-layers');
  const screenLayers = story.querySelector('.ht-screen-layers');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // Keep the full-height stage pinned for the four-step reading interval.
  // Following content continues naturally after the final step.
  const following = document.getElementById('points');
  const track = document.createElement('div');
  track.className = 'ht-scroll-track';
  const content = document.createElement('div');
  content.className = 'ht-scroll-content';
  story.before(track);
  track.append(content);
  content.append(story);
  if (following) content.append(following);
  const copies = [], screens = [];
  for (const panel of panels) {
    const copy = panel.querySelector('.ht-copy').cloneNode(true);
    copy.classList.toggle('ht-light', panel.classList.contains('ht-light'));
    const screen = panel.querySelector('img').cloneNode(true);
    screen.loading = 'eager';
    screen.alt = '';
    copies.push(copy); screens.push(screen);
    copyLayers.append(copy); screenLayers.append(screen);
  }
  let current = -1, queued = false, ready = false, stepDistance = 400;
  function select(index) {
    if (current === index) return;
    current = index;
    stage.dataset.active = String(index + 1);
    stage.classList.toggle('is-orange', index % 2 === 1);
    for (const layers of [copies, screens]) layers.forEach((node, i) => {
      node.classList.toggle('is-active', i === index);
      node.classList.toggle('is-past', i < index);
    });
  }
  function progress() {
    queued = false;
    if (!story.classList.contains('is-animated')) return;
    const top = parseFloat(getComputedStyle(content).top) || 0;
    const travelled = top - track.getBoundingClientRect().top;
    select(Math.min(panels.length - 1, Math.max(0, Math.floor(travelled / stepDistance))));
  }
  function queue() {
    if (!queued) { queued = true; requestAnimationFrame(progress); }
  }
  function layout() {
    const animate = ready && !reduce.matches && innerHeight >= 520;
    story.classList.toggle('is-animated', animate);
    track.classList.toggle('is-enabled', animate);
    // WebKit can retain transitions on layers that have just become hidden.
    if (!animate) story.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    stepDistance = Math.round(Math.min(440, Math.max(300, innerHeight * .5)));
    track.style.setProperty('--ht-travel', stepDistance * panels.length + 'px');
    track.dataset.stepDistance = String(stepDistance);
    measure();
    queue();
  }
  function measure() {
    if (track.classList.contains('is-enabled')) track.style.setProperty('--ht-content-height', content.offsetHeight + 'px');
    queue();
  }
  function revealHash() {
    if (!ready || !track.classList.contains('is-enabled') || !location.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    if (!target) return;
    if (target === story || (following && following.contains(target))) {
      const start = scrollY + track.getBoundingClientRect().top;
      const within = target.getBoundingClientRect().top - content.getBoundingClientRect().top;
      const travel = target === story ? 0 : stepDistance * panels.length;
      const inset = target === story || target === following ? 0 : 24;
      scrollTo({top:start + travel + within - inset,behavior:'instant'});
    }
  }
  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', layout);
  addEventListener('pageshow', layout);
  reduce.addEventListener('change', layout);
  new ResizeObserver(measure).observe(content);
  addEventListener('hashchange', revealHash);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href="#howto"],a[href="#points"]');
    if (!link || !track.classList.contains('is-enabled')) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    revealHash();
  });
  select(0);
  // Keep the HTML list visible if an asset fails. Do not animate blank screens.
  Promise.all(screens.map(img => img.decode())).then(() => {
    ready = true;
    layout();
    // Preserve an existing in-page destination when the section changes height.
    if (location.hash) {
      let target;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
      if (target) {
        target.scrollIntoView({behavior:'instant',block:'start'});
        revealHash();
      }
    }
  }).catch(() => {});
})();
