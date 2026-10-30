(() => {
  function init() {
    const card = document.querySelector('.music-card');
    const firstAudio = card?.querySelector('audio');
    if (!firstAudio) return;

    const de = document.documentElement.lang === 'de';
    const tracks = [
      { title: 'Polyrhythmic Drive', cover: 'assets/polyrhythmic-drive.webp', audio: firstAudio },
      { title: 'Pentaloop', cover: 'assets/pentaloop.webp', src: 'assets/pentaloop.mp3' }
    ];
    const playlist = document.createElement('div');
    playlist.className = 'cv-playlist';
    playlist.setAttribute('aria-label', de ? 'Musik von Techno Punch' : 'Music by Techno Punch');

    const format = time => Number.isFinite(time)
      ? `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`
      : '–:–';

    for (const track of tracks) {
      const audio = track.audio || document.createElement('audio');
      if (!track.audio) {
        audio.src = track.src;
        audio.preload = 'metadata';
      }
      audio.pause();
      audio.currentTime = 0;
      audio.autoplay = false;
      audio.controls = false;
      audio.hidden = true;

      const row = document.createElement('div');
      row.className = 'cv-track-row';
      const cover = document.createElement('img');
      cover.src = track.cover;
      cover.alt = '';
      cover.width = 54;
      cover.height = 54;
      const name = document.createElement('div');
      name.className = 'cv-track-name';
      const title = document.createElement('strong');
      title.textContent = track.title;
      const artist = document.createElement('span');
      artist.textContent = 'Techno Punch';
      name.append(title, artist);
      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'cv-track-play';
      const time = document.createElement('span');
      time.className = 'cv-track-duration';
      const seek = document.createElement('input');
      let userStarted = false;
      seek.type = 'range';
      seek.className = 'cv-track-seek';
      seek.min = '0';
      seek.max = '100';
      seek.value = '0';
      seek.step = '0.1';
      seek.setAttribute('aria-label', `${de ? 'Position' : 'Seek'} ${track.title}`);
      row.append(cover, name, play, time, seek, audio);
      playlist.append(row);

      function update() {
        const playing = !audio.paused;
        play.textContent = playing ? 'Ⅱ' : '▶';
        play.setAttribute('aria-label', `${playing ? (de ? 'Pause' : 'Pause') : (de ? 'Abspielen' : 'Play')} ${track.title}`);
        time.textContent = `${format(audio.currentTime)} / ${format(audio.duration)}`;
        seek.disabled = !Number.isFinite(audio.duration);
        if (!seek.disabled) {
          seek.max = String(audio.duration);
          seek.value = String(audio.currentTime);
        }
      }
      play.addEventListener('click', () => {
        if (audio.paused) { userStarted = true; audio.play().catch(() => {}); }
        else audio.pause();
      });
      seek.addEventListener('input', () => {
        if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value);
      });
      audio.addEventListener('play', () => {
        if (!userStarted) { audio.pause(); audio.currentTime = 0; update(); return; }
        for (const other of playlist.querySelectorAll('audio')) if (other !== audio) other.pause();
      });
      for (const event of ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata', 'durationchange']) {
        audio.addEventListener(event, update);
      }
      update();
    }
    card.append(playlist);

    const floating = document.createElement('div');
    floating.className = 'cv-floating-track';
    floating.setAttribute('aria-label', de ? 'Kompakte Musiksteuerung' : 'Compact music control');
    const floatingCover = document.createElement('img');
    floatingCover.alt = '';
    const floatingName = document.createElement('div');
    floatingName.className = 'cv-floating-name';
    const floatingTitle = document.createElement('strong');
    const floatingArtist = document.createElement('small');
    floatingArtist.textContent = 'Techno Punch';
    floatingName.append(floatingTitle, floatingArtist);
    const floatingPlay = document.createElement('button');
    floatingPlay.type = 'button';
    floating.append(floatingCover, floatingName, floatingPlay);
    document.body.append(floating);

    let active = 0;
    const rows = [...playlist.querySelectorAll('.cv-track-row')];
    function updateFloating() {
      const audio = rows[active].querySelector('audio');
      floatingCover.src = tracks[active].cover;
      floatingTitle.textContent = tracks[active].title;
      floatingPlay.textContent = audio.paused ? '▶' : 'Ⅱ';
      floatingPlay.setAttribute('aria-label', `${audio.paused ? (de ? 'Abspielen' : 'Play') : 'Pause'} ${tracks[active].title}`);
    }
    floatingPlay.addEventListener('click', () => {
      rows[active].querySelector('.cv-track-play').click();
    });
    rows.forEach((row, index) => {
      const audio = row.querySelector('audio');
      audio.addEventListener('play', () => { active = index; updateFloating(); });
      for (const event of ['pause', 'ended']) audio.addEventListener(event, updateFloating);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        floating.hidden = entries[0].isIntersecting;
      }, { threshold: .15 }).observe(playlist);
    }
    updateFloating();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
