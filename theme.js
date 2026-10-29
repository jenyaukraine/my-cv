(function () {
  const KEY = 'cv_theme';

  function apply(theme) {
    const light = theme === 'light';
    document.body.classList.toggle('theme-light', light);
    const toggles = document.querySelectorAll('.theme-toggle-input');
    toggles.forEach(t => { t.checked = light; });
  }

  function init() {
    const saved = localStorage.getItem(KEY);
    // Light is the default for new visitors; an explicit dark preference is preserved.
    apply(saved === 'dark' ? 'dark' : 'light');

    document.querySelectorAll('.theme-toggle-input').forEach(input => {
      input.addEventListener('change', () => {
        const theme = input.checked ? 'light' : 'dark';
        localStorage.setItem(KEY, theme);
        apply(theme);
      });
    });

    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
      const language = document.documentElement.lang;
      const projects = [
        {
          title: 'TidyDrive', image: 'assets/tidydrive-logo.webp', stack: 'Hardware · product',
          copy: { en: 'A phone flash drive. Development is ongoing.', de: 'Ein USB-Stick für das Smartphone. Die Entwicklung läuft.', uk: 'Флешка для телефона. Розробка триває.', fr: 'Une clé USB pour téléphone. Le développement est en cours.' }
        },
        {
          title: 'Punchenko NNL / Tabula', image: 'assets/nnl-tabula-preview.jpg', stack: 'AI · language · interface',
          copy: { en: 'An experimental language and companion interface for conversation and parallel model-training workflows. Training results remain under evaluation.', de: 'Experimentelle Sprache und Oberfläche für Dialoge und parallele Modell-Trainingsabläufe. Die Ergebnisse werden noch geprüft.', uk: 'Експериментальна мова й інтерфейс для діалогу та паралельних процесів навчання моделі. Результати ще перевіряються.', fr: 'Langage expérimental et interface de dialogue avec des processus parallèles d’entraînement de modèle. Les résultats restent à évaluer.' }
        },
        {
          title: 'Rezar Auto MiniApp', image: 'assets/rezar-miniapp-preview.jpg', stack: 'MiniApp · car catalogue',
          copy: { en: 'A mobile-first car catalogue with search, filters, budget estimates and vehicle details.', de: 'Mobil optimierter Autokatalog mit Suche, Filtern, Budgetschätzung und Fahrzeugdetails.', uk: 'Мобільний каталог авто з пошуком, фільтрами, оцінкою бюджету й деталями машин.', fr: 'Catalogue automobile mobile avec recherche, filtres, estimation du budget et fiches véhicules.' }
        },
        {
          title: 'Shop Jewel / 6 Moments', image: 'assets/shopjewel-preview.webp', stack: 'Commerce · jewellery',
          copy: { en: 'Jewellery storefront and editorial product presentation.', de: 'Schmuck-Onlineshop mit redaktioneller Produktpräsentation.', uk: 'Ювелірна вітрина з редакційною подачею товарів.', fr: 'Boutique de bijoux et présentation éditoriale des produits.' }
        },
        {
          title: 'Alex TikTok / VideoDrop', image: 'assets/alex_tiktok-preview.jpg', stack: 'React · video tools',
          copy: { en: 'Interface for video link previews and download options. The image is a visual asset from the project.', de: 'Oberfläche für Videolinks, Vorschau und Download-Optionen. Das Bild ist ein Projektmotiv.', uk: 'Інтерфейс попереднього перегляду відеопосилань і варіантів завантаження. Зображення — візуальний матеріал проєкту.', fr: 'Interface de prévisualisation de liens vidéo et d’options de téléchargement. L’image est un visuel du projet.' }
        },
        {
          title: 's-termin', image: 'assets/stermin-preview.webp', stack: 'Family platform · web',
          copy: { en: 'A private digital home for families with a shared day plan, messages and media.', de: 'Privater digitaler Treffpunkt für Familien mit gemeinsamem Tagesplan, Nachrichten und Medien.', uk: 'Приватний цифровий простір для родини зі спільним планом дня, повідомленнями та медіа.', fr: 'Espace numérique privé pour les familles avec agenda partagé, messages et médias.' }
        },
        {
          title: 'Inkora', image: 'assets/inkora-preview.webp', stack: 'Tattoo concepts · image workflow',
          copy: { en: 'Tattoo concept exploration from prompts and references, with stencil and dotwork output.', de: 'Entwicklung von Tattoo-Motiven aus Text und Referenzen, mit Schablonen- und Dotwork-Ausgabe.', uk: 'Пошук ідей татуювань за описом і референсами з виводом трафарету та dotwork.', fr: 'Exploration de motifs de tatouage à partir de descriptions et de références, avec rendu pochoir et dotwork.' }
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
        uk: 'Також створив додаток для Warcraft і Kain One — систему керування.',
        fr: 'Autres réalisations : un add-on pour Warcraft et Kain One, un système de gestion.'
      })[language] || 'Also built: a Warcraft add-on and Kain One, a management system.';
      projectGrid.after(additional);
    }

    const projectImages = document.querySelectorAll('.project-card > img');
    if (projectImages.length) {
      const labels = {
        en: ['Open larger image', 'Close image'],
        de: ['Bild vergrößern', 'Bild schließen'],
        uk: ['Збільшити зображення', 'Закрити зображення'],
        fr: ["Agrandir l’image", "Fermer l’image"]
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

    const hero = document.querySelector('.hero');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (hero && !reduceMotion.matches) {
      const canvas = document.createElement('canvas');
      canvas.className = 'matrix-rain';
      canvas.setAttribute('aria-hidden', 'true');
      hero.prepend(canvas);
      const scene = document.createElement('div');
      scene.className = 'action-scene';
      scene.setAttribute('aria-hidden', 'true');
      scene.innerHTML = '<div class="elevator-door"></div><div class="action-figure"></div><i class="bullet-trail bullet-trail-one"></i><i class="bullet-trail bullet-trail-two"></i>';
      hero.prepend(scene);
      hero.addEventListener('pointermove', event => {
        const rect = hero.getBoundingClientRect();
        scene.style.setProperty('--parallax-x', `${((event.clientX - rect.left) / rect.width - .5) * 22}px`);
        scene.style.setProperty('--parallax-y', `${((event.clientY - rect.top) / rect.height - .5) * 14}px`);
      }, { passive: true });
      const context = canvas.getContext('2d');
      const glyphs = '01アイウエオカキクケコサシスセソタチツテト';
      let drops = [];
      let width = 0;
      let height = 0;
      let lastFrame = 0;
      let visible = true;
      const resize = () => {
        const scale = Math.min(window.devicePixelRatio || 1, 1.5);
        width = hero.clientWidth;
        height = hero.clientHeight;
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        context.setTransform(scale, 0, 0, scale, 0, 0);
        context.fillStyle = '#0b1b27';
        context.fillRect(0, 0, width, height);
        drops = Array.from({ length: Math.ceil(width / 24) }, () => -Math.random() * height / 24);
      };
      resize();
      new ResizeObserver(resize).observe(hero);
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(hero);
      const draw = time => {
        requestAnimationFrame(draw);
        if (!visible || reduceMotion.matches || time - lastFrame < 48) return;
        lastFrame = time;
        context.fillStyle = 'rgba(10, 27, 37, .13)';
        context.fillRect(0, 0, width, height);
        context.font = '15px monospace';
        drops.forEach((drop, index) => {
          const x = index * 24;
          const y = drop * 24;
          context.fillStyle = Math.random() > .96 ? '#c8ffe6' : '#47c896';
          context.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], x, y);
          drops[index] = y > height + Math.random() * 500 ? -Math.random() * 30 : drop + .32;
        });
      };
      requestAnimationFrame(draw);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
