(() => {
  const dock = document.querySelector('.cv-video-dock');
  const floating = document.querySelector('.cv-youtube-float');
  if (!dock || !floating) return;
  const frame = dock.querySelector('.cv-video-frame');
  const title = dock.querySelector('.cv-video-title');
  const link = dock.querySelector('.cv-video-youtube-link');
  const minimize = dock.querySelector('.cv-video-minimize');
  const close = dock.querySelector('.cv-video-close');
  let activeVideo = '';

  function collapse() {
    dock.classList.add('is-minimized');
    minimize.setAttribute('aria-label', document.documentElement.lang === 'de' ? 'Player vergrößern' : 'Expand player');
    minimize.textContent = '▢';
  }
  function expand() {
    dock.classList.remove('is-minimized');
    minimize.setAttribute('aria-label', document.documentElement.lang === 'de' ? 'Player minimieren' : 'Minimize player');
    minimize.textContent = '−';
  }
  function open(video, videoTitle) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(video || '')) return;
    dock.hidden = false;
    title.textContent = videoTitle;
    link.href = `https://www.youtube.com/watch?v=${video}`;
    expand();
    if (video === activeVideo && frame.firstElementChild) return;
    activeVideo = video;
    const iframe = document.createElement('iframe');
    iframe.title = `Techno Punch — ${videoTitle}`;
    iframe.src = `https://www.youtube-nocookie.com/embed/${video}?enablejsapi=1&autoplay=1&origin=${encodeURIComponent(location.origin)}`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.addEventListener('load', () => iframe.contentWindow?.postMessage(JSON.stringify({event: 'listening', id: 1}), 'https://www.youtube-nocookie.com'));
    frame.replaceChildren(iframe);
  }
  floating.addEventListener('click', () => open('u6hkw9bWDto', 'Polyrhythmic Drive'));
  document.querySelectorAll('.cv-youtube-launch').forEach(button => {
    button.addEventListener('click', () => open(button.dataset.video, button.querySelector('span')?.textContent?.replace('▶', '').trim() || 'Techno Punch'));
  });
  minimize.addEventListener('click', () => dock.classList.contains('is-minimized') ? expand() : collapse());
  close.addEventListener('click', () => { frame.replaceChildren(); activeVideo = ''; dock.hidden = true; });
  window.addEventListener('message', event => {
    if (event.origin !== 'https://www.youtube-nocookie.com' || event.source !== frame.firstElementChild?.contentWindow) return;
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (data.event === 'onReady') frame.firstElementChild?.contentWindow?.postMessage(JSON.stringify({event: 'listening', id: 1}), event.origin);
      if (data.event === 'onStateChange' && Number(data.info) === 1) collapse();
    } catch {}
  });
})();
