document.querySelectorAll('.cv-youtube-launch').forEach(button => {
  button.addEventListener('click', () => {
    const video = button.dataset.video;
    if (!/^[A-Za-z0-9_-]{11}$/.test(video || '')) return;
    const iframe = document.createElement('iframe');
    iframe.title = button.dataset.title || 'Techno Punch on YouTube';
    iframe.src = `https://www.youtube-nocookie.com/embed/${video}`;
    iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    button.replaceWith(iframe);
  });
});

const floating = document.querySelector('.cv-youtube-float');
const dialog = document.querySelector('.cv-video-dialog');
if (floating && dialog) {
  const frame = dialog.querySelector('.cv-video-frame');
  floating.addEventListener('click', () => {
    frame.replaceChildren();
    const iframe = document.createElement('iframe');
    iframe.title = 'Techno Punch — Polyrhythmic Drive on YouTube';
    iframe.src = 'https://www.youtube-nocookie.com/embed/u6hkw9bWDto';
    iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    frame.append(iframe);
    dialog.showModal();
  });
  dialog.querySelector('.cv-video-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => frame.replaceChildren());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}
