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
