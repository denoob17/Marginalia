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
 
  function setupModal(modalId, openButtonId, closeButtonId, onClose) {
    const modalElement = document.getElementById(modalId);
    const openBtn = document.getElementById(openButtonId);
    const closeBtn = document.getElementById(closeButtonId);
 
    if (!modalElement) return null;
 
    const open = () => {
      modalElement.setAttribute('aria-hidden', 'false');
      modalElement.style.display = 'flex';
 
      const firstField = modalElement.querySelector('input, textarea, select, a[href]');
      if (firstField) firstField.focus();
    };
 
    const close = () => {
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.style.display = 'none';
 
      if (onClose) onClose();
      if (openBtn) openBtn.focus();
    };
 
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
 
    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
 
    modalElement.addEventListener('click', (event) => {
      if (event.target === modalElement) close();
    });
 
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modalElement.getAttribute('aria-hidden') === 'false') {
        close();
      }
    });
 
    return { open, close };
  }
 
  setupModal('popupModal', 'openPopupBtn', 'closePopupBtn');
 
 
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
 

  function validateName(rawValue) {
    const value = rawValue.trim();
 
    if (!value) return 'Name is required.';
    if (value.length < 2) return 'Name must contain at least 2 characters.';
    if (value.length > 50) return 'Name must be 50 characters or fewer.';
    if (/\s{2,}/.test(value)) return 'Use only one space between words.';
    if (!/^\p{L}+(?:[ '’-]\p{L}+)*$/u.test(value)) {
      return 'Name may contain only letters (and one space, hyphen or apostrophe between words).';
    }
 
    return '';
  }
 
  
  function validateUsername(value) {
    if (!value) return 'Username is required.';
    if (/\s/.test(value)) return 'Username must not contain spaces.';
    if (value.length < 3) return 'Username must contain at least 3 characters.';
    if (value.length > 20) return 'Username must be 20 characters or fewer.';
    if (!/^[A-Za-z]/.test(value)) return 'Username must start with a letter.';
    if (!/^[A-Za-z0-9_]+$/.test(value)) {
      return 'Username may contain only Latin letters, digits and "_".';
    }
 
    return '';
  }
 
  const typoDomains = ['gmial.com', 'gmai.com', 'gamil.com', 'gmail.con', 'gmail.co', 'gmail.cm'];
 
  function validateEmail(rawValue) {
    const value = rawValue.trim();
 
    if (!value) return 'Email is required.';
    if (/\s/.test(value)) return 'Email must not contain spaces.';
    if (value.length > 254) return 'Email is too long (maximum 254 characters).';
 
    const parts = value.split('@');
    if (parts.length !== 2) return 'Email must contain exactly one "@".';
 
    const local = parts[0];
    const domain = parts[1].toLowerCase();
 
    if (!local) return 'Enter the part of the email before "@".';
    if (local.length > 64) return 'The part before "@" is too long (maximum 64 characters).';
    if (!/^[A-Za-z0-9._%+-]+$/.test(local)) {
      return 'Email contains invalid characters. Use letters, digits and . _ % + - only.';
    }
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
      return 'Dots in the email cannot be first, last or doubled.';
    }
 
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) {
      return 'The part after "@" is not a valid domain (for example gmail.com).';
    }
 
    const labels = domain.split('.');
    if (labels.some((label) => label.startsWith('-') || label.endsWith('-'))) {
      return 'Domain parts cannot start or end with a hyphen.';
    }
    if (!/^[a-z]{2,}$/.test(labels[labels.length - 1])) {
      return 'The domain ending is not valid (for example .com).';
    }
 
    if (typoDomains.includes(domain)) {
      return 'Did you mean "gmail.com"? Please check the domain.';
    }
 
   
    if (domain === 'gmail.com') {
      if (!/^[A-Za-z0-9.]+$/.test(local)) {
        return 'Gmail addresses may contain only letters, digits and dots before "@".';
      }
      if (local.length < 6 || local.length > 30) {
        return 'Gmail addresses must have 6–30 characters before "@".';
      }
    }
 
    return '';
  }
 
  function validatePassword(value, username) {
    if (!value) return 'Password is required.';
    if (/\s/.test(value)) return 'Password must not contain spaces.';
    if (value.length < 8) return 'Password must contain at least 8 characters.';
    if (value.length > 64) return 'Password must be 64 characters or fewer.';
    if (!/^[\x21-\x7E]+$/.test(value)) {
      return 'Password may contain only Latin letters, digits and standard symbols.';
    }
    if (!/[a-z]/.test(value)) return 'Password needs at least one lowercase letter.';
    if (!/[A-Z]/.test(value)) return 'Password needs at least one uppercase letter.';
    if (!/\d/.test(value)) return 'Password needs at least one digit.';
    if (!/[^A-Za-z0-9]/.test(value)) return 'Password needs at least one symbol (for example ! ? # $).';
    if (username && value.toLowerCase().includes(username.toLowerCase())) {
      return 'Password must not contain your username.';
    }
 
    return '';
  }
 
  function validateExcerpt(rawValue) {
    const value = rawValue.trim();
 
    if (!value) return 'Please enter your excerpt.';
    if (value.length < 10) return 'The excerpt is too short (at least 10 characters).';
    if (value.length > 500) return 'The excerpt is too long (maximum 500 characters).';
 
    return '';
  }
 
  const readValue = (id) => {
    const element = document.getElementById(id);
    return element ? element.value : '';
  };
 

  const fieldValidators = {
    name: validateName,
    email: validateEmail,
    excerpt: validateExcerpt,
    username: validateUsername,
    signupEmail: validateEmail,
    password: (value) => validatePassword(value, readValue('username')),
    confirmPassword: (value) => {
      if (!value) return 'Please confirm your password.';
      if (value !== readValue('password')) return 'Passwords do not match.';
      return '';
    }
  };
 
  
  const getErrorElement = (input) => document.getElementById(`${input.id}Error`);
 
  function clearFieldState(input) {
    input.classList.remove('is-invalid', 'is-valid');
    clearError(getErrorElement(input));
  }
 
  function validateInput(input) {
    const check = fieldValidators[input.id];
    const message = check ? check(input.value) : '';
 
    if (message) {
      showError(getErrorElement(input), message);
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
    } else {
      clearError(getErrorElement(input));
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    }
 
    return message === '';
  }
 
  
  Object.keys(fieldValidators).forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
 
    input.addEventListener('input', () => {
      
      if (input.hasAttribute('data-no-spaces')) {
        const cleaned = input.value.replace(/\s/g, '');
 
        if (cleaned !== input.value) {
          input.value = cleaned;
          showError(getErrorElement(input), 'Spaces are not allowed in this field.');
          input.classList.add('is-invalid');
          return;
        }
      }
 
      clearFieldState(input);
    });
 
    input.addEventListener('blur', () => {
      if (input.value !== '') validateInput(input);
    });
  });
 
  function resetValidationState(form) {
    form.querySelectorAll('input, textarea').forEach(clearFieldState);
    form.querySelectorAll('.error-msg').forEach(clearError);
  }
 
  function focusFirstInvalid(form) {
    const firstInvalid = form.querySelector('.is-invalid');
    if (firstInvalid) firstInvalid.focus();
  }
  const contactForm = document.getElementById('contactForm');
 
  if (contactForm) {
    const permission = document.getElementById('permission');
    const permissionError = document.getElementById('permissionError');
 
    contactForm.addEventListener('reset', () => resetValidationState(contactForm));
 
    if (permission) {
      permission.addEventListener('change', () => clearError(permissionError));
    }
 
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
 
      const formSuccess = document.getElementById('formSuccess');
      if (formSuccess) formSuccess.hidden = true;
 
 
      const fields = ['name', 'email', 'excerpt']
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      const fieldsAreValid = fields.map(validateInput).every(Boolean);
 
      let permissionIsValid = true;
 
      if (permission && !permission.checked) {
        showError(permissionError, 'Please confirm your permission.');
        permissionIsValid = false;
      }
 
      if (!fieldsAreValid || !permissionIsValid) {
        focusFirstInvalid(contactForm);
        return;
      }
 
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
 
      contactForm.reset();
    });
  }
 
  
  const accountForm = document.getElementById('accountForm');
 
  if (accountForm) {
    const accountSuccess = document.getElementById('accountSuccess');
 
    const hideAccountSuccess = () => {
      if (accountSuccess) {
        accountSuccess.hidden = true;
        accountSuccess.classList.add('d-none');
      }
    };
 
    const accountModal = setupModal('accountModal', 'openAccountBtn', 'closeAccountBtn', () => {
      accountForm.reset();
      hideAccountSuccess();
    });
 
    accountForm.addEventListener('reset', () => resetValidationState(accountForm));
 
    accountForm.addEventListener('submit', (event) => {
      event.preventDefault();
 
      const fields = ['username', 'signupEmail', 'password', 'confirmPassword']
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      const allValid = fields.map(validateInput).every(Boolean);
 
      if (!allValid) {
        focusFirstInvalid(accountForm);
        return;
      }
 
      const username = readValue('username');
 
      if (accountSuccess) {
        accountSuccess.textContent = `Account created! Welcome, ${username}.`;
        accountSuccess.hidden = false;
        accountSuccess.classList.remove('d-none');
      }
 
      accountForm.reset();
 
      
      if (accountModal) {
        window.setTimeout(accountModal.close, 1800);
      }
    });
  }
 
 
  const initMenuKeyboard = () => {
    const menu = document.getElementById('mainNav');
    if (!menu) return;
 
 
    const getItems = () =>
      Array.from(menu.querySelectorAll('.nav-link')).filter(
        (link) => link.offsetParent !== null
      );
 
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
 
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target.closest('input, textarea, select, [contenteditable="true"], .carousel')) return;
 
 
      if (document.querySelector('.popup-modal[aria-hidden="false"]')) return;
 
      const items = getItems();
      if (items.length === 0) return;
 
 
      let currentIndex = items.indexOf(document.activeElement);
      if (currentIndex === -1) {
        currentIndex = items.findIndex(
          (link) => link.getAttribute('aria-current') === 'page'
        );
      }
      if (currentIndex === -1) currentIndex = 0;
 
      let nextIndex = currentIndex;
 
      switch (event.key) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % items.length;
          break;
        case 'ArrowLeft':
          nextIndex = (currentIndex - 1 + items.length) % items.length;
          break;
      }
 
      event.preventDefault();
      items[nextIndex].focus();
    });
  };
 
  initMenuKeyboard();
 
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
  const statusFilterButtons = document.querySelectorAll('#statusFilters button');
  const readingStats = document.getElementById('readingStats');
  const readingAuthors = document.getElementById('readingAuthors');
 
  const statusClasses = {
    Finished: 'badge text-bg-success',
    Reading: 'badge text-bg-primary',
    'To-Read': 'badge text-bg-secondary'
  };

  function createReadingRow(book) {
    const row = document.createElement('tr');
 
    const title = document.createElement('td');
    title.textContent = book.title;
 
    const author = document.createElement('td');
    author.textContent = book.author;
 
    const genre = document.createElement('td');
    genre.textContent = book.genre;
 
    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = statusClasses[book.status] || 'badge text-bg-secondary';
    status.textContent = book.status;
 
    statusCell.append(status);
    row.append(title, author, genre, statusCell);
    return row;
  }
 
  
  function renderReadingLog(books) {
    readingLogBody.replaceChildren();
    readingLogBody.append(...books.map(createReadingRow));
  }
 
  
  function getBooksByStatus(status) {
    switch (status) {
      case 'Finished':
        return readingLog.filter((book) => book.status === 'Finished');
      case 'Reading':
        return readingLog.filter((book) => book.status === 'Reading');
      case 'To-Read':
        return readingLog.filter((book) => book.status === 'To-Read');
      default:
        return readingLog;
    }
  }
 
 
  function renderReadingStats() {
    if (!readingStats) return;
 
    const counts = readingLog.reduce((total, book) => {
      total[book.status] = (total[book.status] || 0) + 1;
      return total;
    }, {});
 
    readingStats.textContent =
      `Total: ${readingLog.length} · ` +
      `Finished: ${counts.Finished || 0} · ` +
      `Reading: ${counts.Reading || 0} · ` +
      `To-Read: ${counts['To-Read'] || 0}`;
  }
 
  
  function renderReadingAuthors() {
    if (!readingAuthors) return;
 
    readingAuthors.textContent =
      'Authors on our shelf: ' + readingLog.map((book) => book.author).join(', ');
  }
 
  if (readingLogBody) {
    renderReadingLog(readingLog);
    renderReadingStats();
    renderReadingAuthors();
 
    statusFilterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        renderReadingLog(getBooksByStatus(button.dataset.status));
 
      
        statusFilterButtons.forEach((other) => {
          const isActive = other === button;
          other.classList.toggle('active', isActive);
          other.setAttribute('aria-pressed', String(isActive));
        });
      });
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
 
  function createGalleryCard(book) {
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
    return column;
  }
 
  if (galleryBooksContainer && !galleryBooksContainer.dataset.rendered) {
    galleryBooksContainer.dataset.rendered = 'true';
 
    
    galleryBooksContainer.append(...galleryBooks.map(createGalleryCard));
  }
 
 
 
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
 