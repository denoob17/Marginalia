
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const body = document.body;
  const pageName = window.location.pathname.split('/').pop().toLowerCase();
  const isIndexPage = pageName === '' || pageName === 'index.html';

  const themes = ['#211f1d', '#2a2723', '#34302a', '#302824'];
  const savedThemeIndex = Number(localStorage.getItem('marginaliaThemeIndex'));
  let themeIndex = Number.isInteger(savedThemeIndex) && savedThemeIndex >= 0 && savedThemeIndex < themes.length
    ? savedThemeIndex
    : 0;

  let isHalloween = localStorage.getItem('marginaliaHalloween') === 'true';

  const backgroundButton = document.getElementById('changeBgBtn');
  const music = new Audio('audio/halloween.mp3');

  music.loop = true;
  music.volume = 0.3;
  music.preload = 'auto';

  let savedMusicTime = Number(localStorage.getItem('marginaliaMusicTime')) || 0;
  let shouldResumeMusic = localStorage.getItem('marginaliaMusicPlaying') === 'true';
  let musicWasRestored = false;

  let musicButton = document.getElementById('halloweenMusicBtn');

  if (!musicButton) {
    musicButton = document.createElement('button');
    musicButton.id = 'halloweenMusicBtn';
    musicButton.type = 'button';
    musicButton.textContent = 'Play Halloween Music';
    body.appendChild(musicButton);
  }

  Object.assign(musicButton.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    zIndex: '9999',
    padding: '10px 16px',
    border: '1px solid #b5915b',
    borderRadius: '8px',
    background: '#211f1d',
    color: '#f5e6c8',
    cursor: 'pointer',
    display: 'none'
  });

  let ghost = isIndexPage ? document.getElementById('halloweenGhost') : null;
  let ghostHideTimer = null;
  let ghostRepeatTimer = null;

  if (isIndexPage && !ghost) {
    ghost = document.createElement('img');
    ghost.id = 'halloweenGhost';
    ghost.src = 'images/ghost.png';
    ghost.alt = '';
    ghost.setAttribute('aria-hidden', 'true');
    body.appendChild(ghost);
  }

  if (ghost) {
    Object.assign(ghost.style, {
      position: 'fixed',
      width: '150px',
      height: 'auto',
      left: '-180px',
      top: '25%',
      bottom: 'auto',
      zIndex: '10000',
      pointerEvents: 'none',
      display: 'none'
    });
  }

  function updateMusicButton() {
    musicButton.style.display = isHalloween ? 'block' : 'none';
    musicButton.textContent = music.paused
      ? 'Play Halloween Music'
      : 'Mute Halloween Music';
    musicButton.setAttribute('aria-pressed', String(!music.paused));
  }

  function saveMusicState() {
    if (!music.paused) {
      localStorage.setItem('marginaliaMusicTime', String(music.currentTime));
      localStorage.setItem('marginaliaMusicPlaying', 'true');
    } else if (!shouldResumeMusic) {
      localStorage.setItem('marginaliaMusicPlaying', 'false');
    }
  }

  function stopMusic() {
    music.pause();
    music.currentTime = 0;
    shouldResumeMusic = false;
    savedMusicTime = 0;

    localStorage.setItem('marginaliaMusicTime', '0');
    localStorage.setItem('marginaliaMusicPlaying', 'false');

    updateMusicButton();
  }

  async function playMusic() {
    try {
      if (!musicWasRestored && savedMusicTime > 0) {
        music.currentTime = savedMusicTime;
        musicWasRestored = true;
      }

      await music.play();

      shouldResumeMusic = true;
      localStorage.setItem('marginaliaMusicPlaying', 'true');
    } catch (error) {
      shouldResumeMusic = true;
      localStorage.setItem('marginaliaMusicPlaying', 'true');
    }

    updateMusicButton();
  }

  music.addEventListener('timeupdate', () => {
    if (!music.paused) {
      localStorage.setItem('marginaliaMusicTime', String(music.currentTime));
    }
  });

  music.addEventListener('loadedmetadata', () => {
    if (!musicWasRestored && savedMusicTime > 0 && savedMusicTime < music.duration) {
      music.currentTime = savedMusicTime;
      musicWasRestored = true;
    }

    if (isHalloween && shouldResumeMusic) {
      playMusic();
    }
  });

  window.addEventListener('pagehide', saveMusicState);

  function stopGhost() {
    window.clearTimeout(ghostHideTimer);
    window.clearTimeout(ghostRepeatTimer);

    if (ghost) {
      ghost.classList.remove('fly');
      ghost.style.display = 'none';
    }
  }

  function runGhost() {
    if (!isIndexPage || !isHalloween || !ghost) {
      stopGhost();
      return;
    }

    window.clearTimeout(ghostHideTimer);
    window.clearTimeout(ghostRepeatTimer);

    ghost.classList.remove('fly');
    ghost.style.display = 'block';
    ghost.style.opacity = '1';
    ghost.style.left = '-180px';
    ghost.style.top = '25%';

    void ghost.offsetWidth;
    ghost.classList.add('fly');

    ghostHideTimer = window.setTimeout(() => {
      if (ghost) {
        ghost.classList.remove('fly');
        ghost.style.display = 'none';
      }
    }, 5200);

    ghostRepeatTimer = window.setTimeout(() => {
      if (isIndexPage && isHalloween) {
        runGhost();
      }
    }, 8000);
  }

  function applyTheme() {
    root.style.setProperty('--bg', themes[themeIndex]);
    root.style.setProperty('--bs-body-bg', themes[themeIndex]);
    body.classList.toggle('halloween-mode', isHalloween);

    if (isHalloween) {
      root.style.setProperty('--bg', '#21150f');
      root.style.setProperty('--bs-body-bg', '#21150f');

      if (isIndexPage) {
        runGhost();
      } else {
        stopGhost();
      }
    } else {
      stopGhost();
    }

    if (backgroundButton) {
      backgroundButton.textContent = isHalloween
        ? ' Normal Background'
        : ' Change Background';
    }

    updateMusicButton();
  }

  if (backgroundButton) {
    backgroundButton.addEventListener('click', async () => {
      if (!isHalloween) {
        themeIndex++;

        if (themeIndex >= themes.length) {
          themeIndex = 0;
          isHalloween = true;
          shouldResumeMusic = true;
          localStorage.setItem('marginaliaMusicPlaying', 'true');
          await playMusic();
        }
      } else {
        isHalloween = false;
        themeIndex = 0;
        stopMusic();
      }

      localStorage.setItem('marginaliaThemeIndex', String(themeIndex));
      localStorage.setItem('marginaliaHalloween', String(isHalloween));

      applyTheme();
    });
  }

  musicButton.addEventListener('click', async () => {
    if (music.paused) {
      shouldResumeMusic = true;
      await playMusic();
    } else {
      music.pause();
      shouldResumeMusic = false;
      localStorage.setItem('marginaliaMusicPlaying', 'false');
      saveMusicState();
      updateMusicButton();
    }
  });

  applyTheme();

  if (isHalloween && shouldResumeMusic) {
    playMusic();
  }

  const dateTimeDisplay = document.getElementById('dateTimeDisplay');

  const updateDateTime = () => {
    if (dateTimeDisplay) {
      dateTimeDisplay.textContent = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
  };

  updateDateTime();
  window.setInterval(updateDateTime, 1000);

  document.querySelectorAll('.accordion-header').forEach((header) => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isOpen = header.classList.toggle('active');

      header.setAttribute('aria-expanded', String(isOpen));

      if (content) {
        content.classList.toggle('show', isOpen);
        content.hidden = !isOpen;
        content.style.display = isOpen ? 'block' : 'none';
      }
    });
  });

  const modal = document.getElementById('popupModal');
  const openButton = document.getElementById('openPopupBtn');
  const closeButton = document.getElementById('closePopupBtn');

  const openModal = () => {
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  };

  const closeModal = () => {
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  };

  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  if (openButton && modal) {
    openButton.addEventListener('click', openModal);
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });
  }

  function showError(element, message) {
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  }

  function clearError(element) {
    if (element) {
      element.textContent = '';
      element.style.display = 'none';
    }
  }

  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      contactForm.querySelectorAll('.error-msg').forEach(clearError);

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const excerpt = document.getElementById('excerpt');
      const permission = document.getElementById('permission');
      const formSuccess = document.getElementById('formSuccess');

      let isValid = true;

      const showFormError = (id, message) => {
        showError(document.getElementById(id), message);
        isValid = false;
      };

      if (name && !name.value.trim()) {
        showFormError('nameError', 'Name is required.');
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.value.trim()) {
          showFormError('emailError', 'Email is required.');
        } else if (!emailRegex.test(email.value.trim())) {
          showFormError('emailError', 'Please enter a valid email address.');
        }
      }

      if (excerpt && !excerpt.value.trim()) {
        showFormError('excerptError', 'Please enter your excerpt.');
      }

      if (permission && !permission.checked) {
        showFormError('permissionError', 'Please confirm your permission.');
      }

      if (isValid) {
        if (formSuccess) {
          formSuccess.hidden = false;
          formSuccess.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }

        contactForm.reset();
      }
    });
  }

  const accountForm = document.getElementById('accountForm');

  if (accountForm) {
    accountForm.addEventListener('submit', (event) => {
      event.preventDefault();

      accountForm.querySelectorAll('.error-msg').forEach(clearError);

      const email = document.getElementById('signupEmail');
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirmPassword');
      const accountSuccess = document.getElementById('accountSuccess');

      let isValid = true;

      const showFormError = (id, message) => {
        showError(document.getElementById(id), message);
        isValid = false;
      };

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.value.trim()) {
          showFormError('signupEmailError', 'Email is required.');
        } else if (!emailRegex.test(email.value.trim())) {
          showFormError('signupEmailError', 'Please enter a valid email address.');
        }
      }

      if (password) {
        if (!password.value) {
          showFormError('passwordError', 'Password is required.');
        } else if (password.value.length < 8) {
          showFormError('passwordError', 'Password must contain at least 8 characters.');
        }
      }

      if (confirmPassword && password) {
        if (!confirmPassword.value) {
          showFormError('confirmPasswordError', 'Please confirm your password.');
        } else if (confirmPassword.value !== password.value) {
          showFormError('confirmPasswordError', 'Passwords do not match.');
        }
      }

      if (isValid) {
        if (accountSuccess) {
          accountSuccess.hidden = false;
        }

        accountForm.reset();
      }
    });
  }

  const excerpts = [
    {
      quote: 'All happy families are alike.',
      author: 'Leo Tolstoy',
      book: 'Anna Karenina',
      definition: "The most quoted opening line on this entire list, and we still think it's underrated. One sentence and you already know the whole book will argue with itself."
    },
    {
      quote: 'It was the best of times, it was the worst of times.',
      author: 'Charles Dickens',
      book: 'A Tale of Two Cities',
      definition: "We almost left this one out for being too obvious, then re-read the next few pages and understood why it's still taught."
    }
  ];

  const excerptsContainer = document.getElementById('excerptsContainer');

  if (excerptsContainer && !excerptsContainer.dataset.rendered) {
    excerptsContainer.dataset.rendered = 'true';

    excerpts.forEach((excerpt) => {
      const card = document.createElement('article');
      card.className = 'card mq-card';

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      const quote = document.createElement('blockquote');
      quote.className = 'border-start border-3 border-primary ps-3 mb-2 fst-italic';
      quote.textContent = `“${excerpt.quote}”`;

      const source = document.createElement('p');
      source.className = 'small text-body-secondary';
      source.textContent = `— ${excerpt.author}, ${excerpt.book}`;

      const definition = document.createElement('p');
      definition.className = 'card-text border-top pt-3';
      definition.textContent = excerpt.definition;

      cardBody.append(quote, source, definition);
      card.append(cardBody);
      excerptsContainer.append(card);
    });
  }

  const readingLog = [
    {
      title: 'Murder on the Orient Express',
      author: 'Agatha Christie',
      genre: 'Mystery Novel',
      status: 'Finished'
    },
    {
      title: 'Anna Karenina',
      author: 'Leo Tolstoy',
      genre: 'Classic Fiction',
      status: 'Reading'
    },
    {
      title: 'Outsider',
      author: 'Albert Camus',
      genre: 'Philosophy',
      status: 'Finished'
    },
    {
      title: 'First principle',
      author: 'Thomas E. Ricks',
      genre: 'Nonfiction',
      status: 'To-Read'
    },
    {
      title: 'The Human Chair',
      author: 'Edogawa Ranpo',
      genre: 'Mystery / Horror',
      status: 'Finished'
    },
    {
      title: 'No Longer Human',
      author: 'Osamu Dazai',
      genre: 'Classic Fiction',
      status: 'Reading'
    }
  ];

  const readingLogBody = document.getElementById('readingLogBody');

  if (readingLogBody && !readingLogBody.dataset.rendered) {
    readingLogBody.dataset.rendered = 'true';

    readingLog.forEach((book) => {
      const row = document.createElement('tr');

      const title = document.createElement('td');
      title.textContent = book.title;

      const author = document.createElement('td');
      author.textContent = book.author;

      const genre = document.createElement('td');
      genre.textContent = book.genre;

      const statusCell = document.createElement('td');
      const status = document.createElement('span');

      const statusClasses = {
        Finished: 'badge text-bg-success',
        Reading: 'badge text-bg-primary',
        'To-Read': 'badge text-bg-secondary'
      };

      status.className = statusClasses[book.status] || 'badge text-bg-secondary';
      status.textContent = book.status;

      statusCell.append(status);
      row.append(title, author, genre, statusCell);
      readingLogBody.append(row);
    });
  }

  const carouselBooks = [
    {
      src: 'images/anna-karenina.jpg',
      alt: 'Book cover of Anna Karenina',
      title: 'Anna Karenina'
    },
    {
      src: 'images/murder-on-the-orient-express.jpg',
      alt: 'Book cover of Murder on the Orient Express',
      title: 'Murder on the Orient Express'
    },
    {
      src: 'images/the-outsider.jpg',
      alt: 'Book cover of The Outsider',
      title: 'The Outsider'
    },
    {
      src: 'images/first-principle.jpg',
      alt: 'Book cover of First Principle',
      title: 'First Principle'
    },
    {
      src: 'images/the-human-chair.jpg',
      alt: 'Book cover of The Human Chair',
      title: 'The Human Chair'
    },
    {
      src: 'images/no-longer-human.jpg',
      alt: 'Book cover of No Longer Human',
      title: 'No Longer Human'
    },
    {
      src: 'images/leo-tolstoy.jpg',
      alt: 'Portrait of Leo Tolstoy',
      title: 'Leo Tolstoy'
    },
    {
      src: 'images/fyodor-dostoevsky.jpg',
      alt: 'Portrait of Fyodor Dostoevsky',
      title: 'Fyodor Dostoevsky'
    },
    {
      src: 'images/oscar-wilde.jpg',
      alt: 'Portrait of Oscar Wilde',
      title: 'Oscar Wilde'
    }
  ];

  const carouselIndicators = document.getElementById('carouselIndicators');
  const carouselInner = document.getElementById('carouselInner');

  if (
    carouselIndicators &&
    carouselInner &&
    !carouselInner.dataset.rendered &&
    !carouselIndicators.dataset.rendered
  ) {
    carouselInner.dataset.rendered = 'true';
    carouselIndicators.dataset.rendered = 'true';

    carouselBooks.forEach((book, index) => {
      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.setAttribute('data-bs-target', '#galleryCarousel');
      indicator.setAttribute('data-bs-slide-to', String(index));
      indicator.setAttribute('aria-label', `Slide ${index + 1}: ${book.title}`);

      if (index === 0) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'true');
      }

      carouselIndicators.append(indicator);

      const slide = document.createElement('div');
      slide.className = 'carousel-item';

      if (index === 0) {
        slide.classList.add('active');
      }

      const img = document.createElement('img');
      img.src = book.src;
      img.alt = book.alt;
      img.className = 'd-block w-100 carousel-img';

      const caption = document.createElement('div');
      caption.className = 'carousel-caption d-none d-md-block bg-dark bg-opacity-75 rounded py-2';

      const title = document.createElement('h2');
      title.className = 'h5 mb-0';
      title.textContent = book.title;

      caption.append(title);
      slide.append(img, caption);
      carouselInner.append(slide);
    });
  }

  const galleryBooks = [
    {
      src: 'images/murder-on-the-orient-express.jpg',
      alt: 'Book cover of Murder on the Orient Express',
      title: 'Murder on the Orient Express',
      author: 'Agatha Christie',
      description: 'A classic mystery about a murder aboard the famous Orient Express, investigated by Hercule Poirot.'
    },
    {
      src: 'images/anna-karenina.jpg',
      alt: 'Book cover of Anna Karenina',
      title: 'Anna Karenina',
      author: 'Leo Tolstoy',
      description: 'A classic novel about love, family, society, and the consequences of difficult personal choices.'
    },
    {
      src: 'images/the-outsider.jpg',
      alt: 'Book cover of The Outsider',
      title: 'The Outsider',
      author: 'Albert Camus',
      description: 'A philosophical novel exploring alienation, morality, and the absurd through the life of Meursault.'
    },
    {
      src: 'images/first-principle.jpg',
      alt: 'Book cover of First Principle',
      title: 'First Principle',
      author: 'Thomas E. Ricks',
      description: 'A nonfiction work exploring leadership, military history, and the principles behind successful strategy.'
    },
    {
      src: 'images/the-human-chair.jpg',
      alt: 'Book cover of The Human Chair',
      title: 'The Human Chair',
      author: 'Edogawa Ranpo',
      description: 'A mysterious and unsettling story about obsession, identity, and a disturbing secret hidden inside a chair.'
    },
    {
      src: 'images/no-longer-human.jpg',
      alt: 'Book cover of No Longer Human',
      title: 'No Longer Human',
      author: 'Osamu Dazai',
      description: "A dark psychological novel about loneliness, alienation, and a man's struggle to connect with society."
    }
  ];

  const galleryBooksContainer = document.getElementById('galleryBooksContainer');

  if (galleryBooksContainer && !galleryBooksContainer.dataset.rendered) {
    galleryBooksContainer.dataset.rendered = 'true';

    galleryBooks.forEach((book) => {
      const column = document.createElement('div');
      column.className = 'col-12 col-sm-6 col-lg-4';

      const card = document.createElement('article');
      card.className = 'card h-100';

      const img = document.createElement('img');
      img.src = book.src;
      img.alt = book.alt;
      img.className = 'card-img-top gallery-img';

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      const title = document.createElement('h3');
      title.className = 'card-title h5';
      title.textContent = book.title;

      const author = document.createElement('p');
      author.className = 'card-subtitle fst-italic text-body-secondary mb-2';
      author.textContent = book.author;

      const description = document.createElement('p');
      description.className = 'card-text';
      description.textContent = book.description;

      cardBody.append(title, author, description);
      card.append(img, cardBody);
      column.append(card);
      galleryBooksContainer.append(column);
    });
  }

  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  navLinks.forEach((link, index) => {
    link.addEventListener('keydown', (event) => {
      let nextIndex;

      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % navLinks.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + navLinks.length) % navLinks.length;
      } else {
        return;
      }

      event.preventDefault();
      navLinks[nextIndex].focus();
    });
  });

  const scoobyRunner = document.getElementById('scooby-runner');

  if (scoobyRunner) {
    const frames = [
      'images/scooby-1.png',
      'images/scooby-2.png',
      'images/scooby-3.png'
    ];

    const frameImage = document.createElement('img');
    frameImage.src = frames[0];
    frameImage.alt = '';
    frameImage.setAttribute('aria-hidden', 'true');

    Object.assign(frameImage.style, {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      opacity: '1',
      animation: 'none'
    });

    scoobyRunner.replaceChildren(frameImage);
    scoobyRunner.classList.add('running');

    let frameIndex = 0;

    const frameTimer = window.setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length;
      frameImage.src = frames[frameIndex];
    }, 200);

    scoobyRunner.addEventListener('animationend', () => {
      window.clearInterval(frameTimer);
      scoobyRunner.classList.remove('running');
      scoobyRunner.style.display = 'none';
    }, { once: true });
  }
});
