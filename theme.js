(function () {
  const KEY = 'cv_theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let manualTheme = null;

  function apply(theme) {
    const light = theme === 'light';
    document.body.classList.toggle('theme-light', light);
    const toggles = document.querySelectorAll('.theme-toggle-input');
    toggles.forEach(t => { t.checked = light; });
    document.querySelectorAll('.theme-auto').forEach(button => button.setAttribute('aria-pressed', String(!manualTheme)));
    document.dispatchEvent(new CustomEvent('cv-theme-change', { detail: { theme } }));
  }

  function init() {
    try { const saved = localStorage.getItem(KEY); manualTheme = ['light', 'dark'].includes(saved) ? saved : null; } catch {}
    apply(manualTheme || (systemTheme.matches ? 'dark' : 'light'));
    systemTheme.addEventListener('change', event => {
      if (!manualTheme) apply(event.matches ? 'dark' : 'light');
    });

    document.querySelectorAll('.theme-toggle-input').forEach(input => {
      input.addEventListener('change', () => {
        const theme = input.checked ? 'light' : 'dark';
        manualTheme = theme;
        try { localStorage.setItem(KEY, theme); } catch {}
        apply(theme);
      });
    });
    document.querySelectorAll('.theme-auto').forEach(button => {
      button.addEventListener('click', () => {
        manualTheme = null;
        try { localStorage.removeItem(KEY); } catch {}
        apply(systemTheme.matches ? 'dark' : 'light');
      });
    });

    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
      const language = document.documentElement.lang;
      const projects = [
        {
          title: 'TidyDrive', image: 'assets/tidydrive-logo.webp', stack: 'Hardware · product',
          copy: { en: 'A phone flash drive. Development is ongoing.', de: 'Ein USB-Stick für das Smartphone. Die Entwicklung läuft.' }
        },
        {
          title: 'Punchenko NNL / Tabula', image: 'assets/nnl-tabula-preview.jpg', stack: 'AI · language · interface',
          copy: { en: 'An experimental language and companion interface for conversation and parallel model-training workflows. Training results remain under evaluation.', de: 'Experimentelle Sprache und Oberfläche für Dialoge und parallele Modell-Trainingsabläufe. Die Ergebnisse werden noch geprüft.' }
        },
        {
          title: 'Rezar Auto MiniApp', image: 'assets/rezar-miniapp-preview.jpg', stack: 'MiniApp · car catalogue',
          copy: { en: 'A mobile-first car catalogue with search, filters, budget estimates and vehicle details.', de: 'Mobil optimierter Autokatalog mit Suche, Filtern, Budgetschätzung und Fahrzeugdetails.' }
        },
        {
          title: 'Shop Jewel / 6 Moments', image: 'assets/shopjewel-preview.webp', stack: 'Commerce · jewellery',
          copy: { en: 'Jewellery storefront and editorial product presentation.', de: 'Schmuck-Onlineshop mit redaktioneller Produktpräsentation.' }
        },
        {
          title: 'Alex TikTok / VideoDrop', image: 'assets/alex_tiktok-preview.jpg', stack: 'React · video tools',
          copy: { en: 'Interface for video link previews and download options. The image is a visual asset from the project.', de: 'Oberfläche für Videolinks, Vorschau und Download-Optionen. Das Bild ist ein Projektmotiv.' }
        },
        {
          title: 's-termin', image: 'assets/stermin-preview.webp', stack: 'Family platform · web',
          copy: { en: 'A private digital home for families with a shared day plan, messages and media.', de: 'Privater digitaler Treffpunkt für Familien mit gemeinsamem Tagesplan, Nachrichten und Medien.' }
        },
        {
          title: 'Inkora', image: 'assets/inkora-preview.webp', stack: 'Tattoo concepts · image workflow',
          copy: { en: 'Tattoo concept exploration from prompts and references, with stencil and dotwork output.', de: 'Entwicklung von Tattoo-Motiven aus Text und Referenzen, mit Schablonen- und Dotwork-Ausgabe.' }
        }
      ];
      projects.forEach(project => {
        const card = document.createElement('article');
        card.className = 'project-card';
        const image = document.createElement('img');
        image.src = project.image;
        image.alt = `${project.title} project visual`;
        image.loading = 'lazy';
        const body = document.createElement('div');
        const stack = document.createElement('span');
        stack.textContent = project.stack;
        const heading = document.createElement('h3');
        heading.textContent = project.title;
        const description = document.createElement('p');
        description.textContent = project.copy[language] || project.copy.en;
        body.append(stack, heading, description);
        card.append(image, body);
        projectGrid.append(card);
      });
      const additional = document.createElement('p');
      additional.className = 'additional-projects';
      additional.textContent = ({
        en: 'Also built: a Warcraft add-on and Kain One, a management system.',
        de: 'Weitere Arbeiten: ein Warcraft-Add-on und Kain One, ein Verwaltungssystem.',
      })[language] || 'Also built: a Warcraft add-on and Kain One, a management system.';
      projectGrid.after(additional);
    }

    const projectImages = document.querySelectorAll('.project-card > img');
    if (projectImages.length) {
      const labels = {
        en: ['Open larger image', 'Close image'],
        de: ['Bild vergrößern', 'Bild schließen'],
      };
      const [openLabel, closeLabel] = labels[document.documentElement.lang] || labels.en;
      const dialog = document.createElement('dialog');
      dialog.className = 'project-lightbox';
      dialog.innerHTML = '<button type="button" class="project-lightbox-close"></button><img alt=""><p></p>';
      const largeImage = dialog.querySelector('img');
      const caption = dialog.querySelector('p');
      const closeButton = dialog.querySelector('button');
      closeButton.textContent = '×';
      closeButton.setAttribute('aria-label', closeLabel);
      closeButton.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
      });
      document.body.append(dialog);

      projectImages.forEach(image => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-image-button';
        button.setAttribute('aria-label', `${openLabel}: ${image.alt}`);
        image.before(button);
        button.append(image);
        button.addEventListener('click', () => {
          largeImage.src = image.currentSrc || image.src;
          largeImage.alt = image.alt;
          caption.textContent = image.alt;
          dialog.showModal();
        });
      });
    }

    const firstTrack = document.querySelector('audio[aria-label*="Polyrhythmic Drive"]');
    if (firstTrack) {
      const nextTrack = document.createElement('div');
      nextTrack.className = 'next-track';
      nextTrack.innerHTML = '<img src="assets/pentaloop.webp" alt="Techno Punch — Pentaloop cover art" loading="lazy"><div><span>UP NEXT · TECHNO PUNCH</span><h4>Pentaloop</h4></div><audio controls preload="metadata" aria-label="Play Techno Punch — Pentaloop"><source src="assets/pentaloop.mp3" type="audio/mpeg"></audio>';
      firstTrack.after(nextTrack);
      const secondTrack = nextTrack.querySelector('audio');
      firstTrack.addEventListener('ended', () => secondTrack.play().catch(() => {}));
      firstTrack.addEventListener('play', () => secondTrack.pause());
      secondTrack.addEventListener('play', () => firstTrack.pause());
    }


  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
