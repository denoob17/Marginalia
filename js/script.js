(function () {
  'use strict';

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
    // Day mode: the dark background themes and Halloween mode are switched off
    if (root.getAttribute('data-bs-theme') === 'light') {
      root.style.removeProperty('--bg');
      root.style.removeProperty('--bs-body-bg');
      body.classList.remove('halloween-mode');
 
      if (isHalloween) {
        isHalloween = false;
        localStorage.setItem('marginaliaHalloween', 'false');
        stopMusic();
      }
 
      stopGhost();
      updateMusicButton();
      return;
    }
 
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
 
  window.marginaliaApplyTheme = applyTheme; // used by the jQuery day/night switch
 
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
 
      if (window.jQuery) {
        // Assignment 6 (Task 6): jQuery shows the spinner, then the success message
        contactForm.dispatchEvent(new CustomEvent('mq:valid'));
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
 
      if (window.jQuery) {
        accountForm.dispatchEvent(new CustomEvent('mq:valid', { detail: { username } }));
        return;
      }
 
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
 
  const LAZY_PLACEHOLDER = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3Crect width='3' height='4' fill='%2334302a'/%3E%3C/svg%3E";
 
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
      img.alt = book.alt;
      img.className = 'd-block w-100 carousel-img';
 
      // Task 9: only the first slide loads right away, the rest wait for jQuery
      if (index === 0 || !window.jQuery) {
        img.src = book.src;
      } else {
        img.src = LAZY_PLACEHOLDER;
        img.dataset.src = book.src;
        img.classList.add('lazy-slide');
      }
 
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
    img.alt = book.alt;
    img.className = 'card-img-top gallery-img';
 
    // Task 9: lazy loading - the real file is stored in data-src until the card scrolls into view
    if (window.jQuery) {
      img.src = LAZY_PLACEHOLDER;
      img.dataset.src = book.src;
      img.classList.add('lazy');
    } else {
      img.src = book.src;
    }
 
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
})();

/* =====================================================================
   ASSIGNMENT 6 - jQuery
   Task 0  Setup
   Part 1  Task 1 Live filter | Task 2 Autocomplete | Task 3 Highlighting
   Part 2  Task 4 Scroll progress bar | Task 5 Number counter | Task 6 Submit spinner
   Part 3  Task 7 Toasts | Task 8 Copy button | Task 9 Lazy loading
   ===================================================================== */

$(document).ready(function () {
  // ---------------------------------------------------------------
  // Task 0. Setup
  // ---------------------------------------------------------------
  console.log('jQuery is ready!');

  const $win = $(window);
  const $doc = $(document);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Escape user text before it is put into a RegExp
  const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Run a function at most once per animation frame (keeps scroll handlers cheap)
  function rafThrottle(fn) {
    let waiting = false;
    return function () {
      if (waiting) return;
      waiting = true;
      window.requestAnimationFrame(() => {
        waiting = false;
        fn();
      });
    };
  }

  // Is the element (partly) inside the visible part of the window?
  function isInView($el, margin) {
    if (!$el.length) return false;
    const top = $el.offset().top;
    const bottom = top + $el.outerHeight();
    const viewTop = $win.scrollTop() - (margin || 0);
    const viewBottom = $win.scrollTop() + $win.height() + (margin || 0);
    return bottom >= viewTop && top <= viewBottom;
  }

  // ---------------------------------------------------------------
  // Task 7. Notification system (toasts)
  // Defined first because the other tasks use it.
  // ---------------------------------------------------------------
  const $toastBox = $('<div id="mq-toasts" aria-live="polite" aria-atomic="false"></div>').appendTo('body');
  const toastIcons = { success: '✓', info: 'i', error: '!' };

  function showToast(message, type) {
    type = toastIcons[type] ? type : 'success';

    const $toast = $('<div class="mq-toast" role="status"></div>')
      .addClass('mq-toast-' + type)
      .append($('<span class="mq-toast-icon" aria-hidden="true"></span>').text(toastIcons[type]))
      .append($('<span class="mq-toast-msg"></span>').text(message))
      .append('<button type="button" class="mq-toast-close" aria-label="Dismiss notification">&times;</button>')
      .hide()
      .appendTo($toastBox);

    // fade in -> stay for 3.2 s -> fade out -> remove from the DOM
    $toast.fadeIn(250).delay(3200).fadeOut(600, function () {
      $(this).remove();
    });

    // limit the stack to 4 messages
    $toastBox.children().slice(0, -4).remove();
    return $toast;
  }

  $toastBox.on('click', '.mq-toast-close', function () {
    $(this).closest('.mq-toast').stop(true).fadeOut(150, function () {
      $(this).remove();
    });
  });

  // ---------------------------------------------------------------
  // Task 1. Real-time search and live filter (Excerpts page, reading log)
  // ---------------------------------------------------------------
  const $logSearch = $('#logSearch');

  if ($logSearch.length) {
    const $logCount = $('<p id="logCount" class="small text-body-secondary mb-2" aria-live="polite"></p>')
      .insertAfter('#statusFilters');
    const $logEmpty = $('<p id="logEmpty" class="text-body-secondary fst-italic" hidden>No books match your search.</p>')
      .insertBefore('.table-responsive');

    function applyLogFilter() {
      const query = $logSearch.val().trim().toLowerCase();
      const $rows = $('#readingLogBody tr');

      // keep the rows whose text contains the query
      const $matches = $rows.filter(function () {
        return $(this).text().toLowerCase().indexOf(query) > -1;
      });

      $rows.not($matches).hide();
      $matches.show();

      $logEmpty.prop('hidden', $matches.length > 0);
      $logCount.text(
        query
          ? 'Showing ' + $matches.length + ' of ' + $rows.length + ' books'
          : ''
      );
    }

    $logSearch.on('keyup input', applyLogFilter);

    // the status buttons re-render the table, so apply the search again afterwards
    $('#statusFilters').on('click', 'button', applyLogFilter);
  }

  // ---------------------------------------------------------------
  // Task 2. Autocomplete search suggestions (Gallery page)
  // ---------------------------------------------------------------
  const $gallerySearch = $('#gallerySearch');

  if ($gallerySearch.length) {
    const $suggestList = $('#suggestList');
    const entries = [];
    let activeIndex = -1;
    let shown = [];

    // Build the suggestion data from the cards that are on the page
    $('#galleryBooksContainer article.card').each(function () {
      const $card = $(this);
      const title = $card.find('.card-title').text();
      const author = $card.find('.card-subtitle').text();

      entries.push({ text: title, kind: 'Book', $cards: $card });

      if (!entries.some((e) => e.kind === 'Author' && e.text === author)) {
        const $sameAuthor = $('#galleryBooksContainer article.card').filter(function () {
          return $(this).find('.card-subtitle').text() === author;
        });
        entries.push({ text: author, kind: 'Author', $cards: $sameAuthor });
      }
    });

    function closeSuggestions() {
      $suggestList.prop('hidden', true).empty();
      $gallerySearch.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
      activeIndex = -1;
      shown = [];
    }

    function setActive(index) {
      const $items = $suggestList.children();
      $items.removeClass('active').attr('aria-selected', 'false');
      activeIndex = index;

      if (index >= 0) {
        const $item = $items.eq(index).addClass('active').attr('aria-selected', 'true');
        $gallerySearch.attr('aria-activedescendant', $item.attr('id'));
      } else {
        $gallerySearch.removeAttr('aria-activedescendant');
      }
    }

    function renderSuggestions() {
      const query = $gallerySearch.val().trim().toLowerCase();

      if (!query) {
        closeSuggestions();
        return;
      }

      shown = entries.filter((e) => e.text.toLowerCase().indexOf(query) > -1).slice(0, 6);
      $suggestList.empty();

      if (!shown.length) {
        $suggestList.append('<li class="mq-suggest-empty">No suggestions found</li>');
      }

      $.each(shown, function (i, entry) {
        const at = entry.text.toLowerCase().indexOf(query);
        const $li = $('<li class="mq-suggest-item" role="option" aria-selected="false"></li>')
          .attr('id', 'suggest-' + i)
          .data('index', i)
          .append($('<span class="mq-suggest-kind"></span>').text(entry.kind))
          .append(
            $('<span class="mq-suggest-text"></span>')
              .append(document.createTextNode(entry.text.slice(0, at)))
              .append($('<strong></strong>').text(entry.text.slice(at, at + query.length)))
              .append(document.createTextNode(entry.text.slice(at + query.length)))
          );
        $suggestList.append($li);
      });

      $suggestList.prop('hidden', false);
      $gallerySearch.attr('aria-expanded', 'true');
      activeIndex = -1;
    }

    function chooseSuggestion(entry) {
      $gallerySearch.val(entry.text);
      closeSuggestions();

      const $first = entry.$cards.first();
      $first[0].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });

      // pulse the chosen card(s)
      entry.$cards.removeClass('mq-flash');
      void entry.$cards[0].offsetWidth; // restart the CSS animation
      entry.$cards.addClass('mq-flash');
      window.setTimeout(() => entry.$cards.removeClass('mq-flash'), 2400);

      showToast('Showing: ' + entry.text, 'info');
      lazyLoadImages();
    }

    $gallerySearch.on('input', renderSuggestions);

    $gallerySearch.on('keydown', function (event) {
      if ($suggestList.prop('hidden')) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive(shown.length ? (activeIndex + 1) % shown.length : -1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive(shown.length ? (activeIndex - 1 + shown.length) % shown.length : -1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const entry = shown[activeIndex >= 0 ? activeIndex : 0];
        if (entry) chooseSuggestion(entry);
      } else if (event.key === 'Escape') {
        closeSuggestions();
      }
    });

    // mousedown (not click) so the input does not lose focus first
    $suggestList.on('mousedown', '.mq-suggest-item', function (event) {
      event.preventDefault();
      chooseSuggestion(shown[$(this).data('index')]);
    });

    $suggestList.on('mouseenter', '.mq-suggest-item', function () {
      setActive($(this).data('index'));
    });

    $doc.on('click', function (event) {
      if (!$(event.target).closest('.mq-search').length) closeSuggestions();
    });
  }

  // ---------------------------------------------------------------
  // Task 3. Search highlighting (About page)
  // ---------------------------------------------------------------
  const $pageSearch = $('#pageSearch');

  if ($pageSearch.length) {
    const $searchRoot = $('#main');
    const $pageCount = $('#pageSearchCount');
    let debounceTimer = null;

    function setAccordion($item, open) {
      $item.find('.accordion-header').toggleClass('active', open).attr('aria-expanded', String(open));
      $item.find('.accordion-content')
        .toggleClass('show', open)
        .prop('hidden', !open)
        .css('display', open ? 'block' : 'none');
    }

    // Replace every <mark> by its plain text again
    function clearHighlights() {
      $searchRoot.find('mark.mq-highlight').each(function () {
        $(this).replaceWith(document.createTextNode($(this).text()));
      });
      $searchRoot[0].normalize(); // glue the split text nodes back together

      // close the FAQ items that the search had opened
      $searchRoot.find('.accordion-item.mq-auto-open').each(function () {
        setAccordion($(this), false);
        $(this).removeClass('mq-auto-open');
      });
    }

    // Walk through the text nodes of an element and wrap the matches
    function highlightIn($element, regex) {
      $element.contents().each(function () {
        if (this.nodeType === 3) { // text node
          if (!this.nodeValue.trim()) return;
          regex.lastIndex = 0;
          if (!regex.test(this.nodeValue)) return;

          const safeHtml = $('<div>').text(this.nodeValue).html(); // escape < > &
          const marked = safeHtml.replace(regex, '<mark class="mq-highlight">$1</mark>');
          $(this).replaceWith(marked);
        } else if (this.nodeType === 1) { // element
          const $el = $(this);
          if ($el.is('script, style, textarea, input, select, mark') || $el.closest('.mq-no-highlight').length) return;
          highlightIn($el, regex);
        }
      });
    }

    function runPageSearch() {
      const term = $pageSearch.val().trim();
      clearHighlights();

      if (term.length < 2) {
        $pageCount.text(term.length ? 'Type at least 2 characters.' : '');
        return;
      }

      // the capture group lets "$1" keep the original upper/lower case
      const regex = new RegExp('(' + escapeRegExp(term) + ')', 'gi');
      highlightIn($searchRoot, regex);

      const total = $searchRoot.find('mark.mq-highlight').length;

      // open FAQ answers that contain a match
      $searchRoot.find('.accordion-item').each(function () {
        const $item = $(this);
        if ($item.find('mark.mq-highlight').length && !$item.find('.accordion-header').hasClass('active')) {
          setAccordion($item, true);
          $item.addClass('mq-auto-open');
        }
      });

      $pageCount.text(
        total
          ? total + (total === 1 ? ' match' : ' matches') + ' for “' + term + '”'
          : 'No matches for “' + term + '”'
      );
    }

    $pageSearch.on('input', function () {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(runPageSearch, 150);
    });

    // Enter jumps to the first match
    $pageSearch.on('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const first = $searchRoot.find('mark.mq-highlight').first()[0];
      if (first) first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  }

  // ---------------------------------------------------------------
  // Task 4. Colourful scroll progress bar (every page)
  // ---------------------------------------------------------------
  const $progress = $(
    '<div id="mq-progress" role="presentation">' +
      '<div class="mq-progress-bar"></div>' +
      '<span class="mq-progress-label" aria-hidden="true">0%</span>' +
    '</div>'
  ).prependTo('body');
  const $progressBar = $progress.find('.mq-progress-bar');
  const $progressLabel = $progress.find('.mq-progress-label');

  function updateProgress() {
    const scrollable = $doc.height() - $win.height();
    const percent = scrollable > 0 ? Math.min(100, Math.max(0, ($win.scrollTop() / scrollable) * 100)) : 0;

    $progressBar.css('width', percent + '%');
    $progressLabel.text(Math.round(percent) + '%');
    $progress.toggleClass('is-active', percent > 1);
    $progress.toggleClass('is-complete', percent >= 99.5);
  }

  $win.on('scroll resize', rafThrottle(updateProgress));
  updateProgress();

  // ---------------------------------------------------------------
  // Task 5. Animated number counter (Home page, "Marginalia in Numbers")
  // ---------------------------------------------------------------
  const $counters = $('.mq-stat-number');

  function animateCounter($el) {
    const target = Number($el.data('target')) || 0;
    const suffix = $el.data('suffix') || '';
    const format = (n) => Math.round(n).toLocaleString('en-US') + suffix;

    $el.data('counted', true);

    if (reduceMotion) {
      $el.text(format(target));
      return;
    }

    // animate a plain object from 0 to the target and print every step
    $({ value: 0 }).animate({ value: target }, {
      duration: 2000,
      easing: 'swing',
      step: function (now) {
        $el.text(format(now));
      },
      complete: function () {
        $el.text(format(target));
      }
    });
  }

  function checkCounters() {
    $counters.each(function () {
      const $el = $(this);
      if (!$el.data('counted') && isInView($el, -40)) animateCounter($el);
    });
  }

  if ($counters.length) {
    $win.on('scroll resize', rafThrottle(checkCounters));
    checkCounters();
  }

  // ---------------------------------------------------------------
  // Task 6. Loading spinner on submit (contact form + sign-up form)
  // ---------------------------------------------------------------
  // Shows "Please wait...", disables the button, and after ~2 s (a fake server call)
  // restores the button and runs the callback.
  function submitWithSpinner($form, callback) {
    const $submit = $form.find('[type="submit"]');
    const $others = $form.find('button').not($submit);
    const originalHtml = $submit.html();

    $submit
      .prop('disabled', true)
      .attr('aria-busy', 'true')
      .html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Please wait…');
    $others.prop('disabled', true);

    window.setTimeout(function () {
      $submit.prop('disabled', false).removeAttr('aria-busy').html(originalHtml);
      $others.prop('disabled', false);
      callback();
    }, 2000);
  }

  // Contact form: the original validation (above) fires "mq:valid" once everything is correct
  $('#contactForm').on('mq:valid', function () {
    const $form = $(this);

    submitWithSpinner($form, function () {
      const $success = $('#formSuccess').prop('hidden', false);
      $success[0].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      $form[0].reset();
      showToast('Form submitted successfully. Thank you!', 'success');
    });
  });

  // Sign-up form (modal on the Contact page)
  $('#accountForm').on('mq:valid', function (event) {
    const $form = $(this);
    const username = event.originalEvent.detail.username;

    submitWithSpinner($form, function () {
      $('#accountSuccess')
        .text('Account created! Welcome, ' + username + '.')
        .prop('hidden', false)
        .removeClass('d-none');
      $form[0].reset();
      showToast('Account created. Welcome, ' + username + '!', 'success');

      // close the modal after a moment (re-uses the existing close button)
      window.setTimeout(() => $('#closeAccountBtn').trigger('click'), 1800);
    });
  });

  // ---------------------------------------------------------------
  // Task 8. "Copy" button next to the quotes (Home + Excerpts pages)
  // ---------------------------------------------------------------
  const ICON_COPY =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="9" width="12" height="12" rx="2"></rect>' +
    '<path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>';
  const ICON_CHECK =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';

  let copyingFromButton = false;

  // Copy text with the Clipboard API; fall back to execCommand when it is not available
  function copyText(text) {
    const result = $.Deferred();

    function fallback() {
      const $helper = $('<textarea readonly aria-hidden="true"></textarea>')
        .val(text)
        .css({ position: 'fixed', top: 0, left: 0, opacity: 0 })
        .appendTo('body');
      $helper[0].select();

      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (error) {
        ok = false;
      }
      $helper.remove();
      return ok ? result.resolve() : result.reject();
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(result.resolve, fallback);
    } else {
      fallback();
    }

    return result.promise();
  }

  // Put a copy button beside every quote card
  $('.mq-card blockquote').each(function () {
    const $quote = $(this).addClass('mq-copyable');

    $quote.wrap('<div class="mq-quote-row"></div>');

    $('<span class="mq-copy-wrap"></span>')
      .append(
        $('<button type="button" class="mq-copy-btn" aria-label="Copy quote to clipboard" title="Copy"></button>')
          .html(ICON_COPY)
      )
      .append('<span class="mq-tooltip" role="status">Copied to clipboard!</span>')
      .insertAfter($quote);
  });

  $doc.on('click', '.mq-copy-btn', function () {
    const $btn = $(this);
    const $row = $btn.closest('.mq-quote-row');
    const quote = $row.find('blockquote').text().trim();
    const source = $row.next('p').text().trim(); // "— Leo Tolstoy"
    const $tooltip = $btn.siblings('.mq-tooltip');

    copyingFromButton = true;
    copyText(source ? quote + ' ' + source : quote)
      .done(function () {
        window.clearTimeout($btn.data('timer'));

        $btn.addClass('is-copied').html(ICON_CHECK).attr('aria-label', 'Copied');
        $tooltip.stop(true, true).fadeIn(150);
        showToast('Quote copied to clipboard', 'success');

        // back to the normal icon after 2 s
        $btn.data('timer', window.setTimeout(function () {
          $btn.removeClass('is-copied').html(ICON_COPY).attr('aria-label', 'Copy quote to clipboard');
          $tooltip.fadeOut(250);
        }, 2000));
      })
      .fail(function () {
        showToast('Could not copy. Please select the text and press Ctrl+C.', 'error');
      })
      .always(function () {
        copyingFromButton = false;
      });
  });

  // Also react when a visitor copies a quote by hand (select + Ctrl+C)
  $doc.on('copy', function () {
    if (copyingFromButton) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && $(selection.anchorNode).closest('.mq-copyable').length) {
      showToast('Copied to clipboard!', 'success');
    }
  });

  // ---------------------------------------------------------------
  // Extra: Day / Night mode switch (button in the navbar, every page)
  // ---------------------------------------------------------------
  const MODE_KEY = 'marginaliaColorMode';
  const ICON_SUN =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle>' +
    '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>';
  const ICON_MOON =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>';

  const $root = $('html');
  const $modeBtn = $('<button type="button" class="mq-mode-btn"></button>');

  function paintModeButton() {
    const isLight = $root.attr('data-bs-theme') === 'light';
    // the icon shows what a click will switch TO
    $modeBtn
      .html(isLight ? ICON_MOON : ICON_SUN)
      .attr('aria-label', isLight ? 'Switch to night mode' : 'Switch to day mode')
      .attr('title', isLight ? 'Night mode' : 'Day mode')
      .attr('aria-pressed', String(isLight));
  }

  function setColorMode(mode, announce) {
    // short colour transition, removed again afterwards
    $root.addClass('mq-mode-anim');
    window.setTimeout(() => $root.removeClass('mq-mode-anim'), 500);

    $root.attr('data-bs-theme', mode);
    try { localStorage.setItem(MODE_KEY, mode); } catch (error) { /* private mode: ignore */ }

    if (window.marginaliaApplyTheme) window.marginaliaApplyTheme();
    paintModeButton();

    if (announce) showToast(mode === 'light' ? 'Day mode on' : 'Night mode on', 'info');
  }

  $('<li class="nav-item d-flex align-items-center ms-lg-2"></li>').append($modeBtn).appendTo('#mainNav .navbar-nav');
  paintModeButton();

  $modeBtn.on('click', function () {
    setColorMode($root.attr('data-bs-theme') === 'light' ? 'dark' : 'light', true);
  });

  // ---------------------------------------------------------------
  // Task 9. Image lazy loading (Home portraits, Gallery cards + carousel)
  // ---------------------------------------------------------------
  function loadImage($img) {
    const realSrc = $img.attr('data-src');
    if (!realSrc) return;

    $img
      .removeAttr('data-src')
      .one('load', function () {
        $img.removeClass('lazy lazy-slide').addClass('mq-loaded');
      })
      .attr('src', realSrc); // swap the placeholder for the real picture
  }

  function lazyLoadImages() {
    $('img.lazy[data-src]').each(function () {
      const $img = $(this);
      const top = $img.offset().top;
      const bottom = top + $img.height();
      const viewTop = $win.scrollTop();
      const viewBottom = viewTop + $win.height();
      const margin = 150; // start loading a little before it is visible

      if (bottom >= viewTop - margin && top <= viewBottom + margin) {
        loadImage($img);
      }
    });
  }

  $win.on('scroll resize load', rafThrottle(lazyLoadImages));
  lazyLoadImages();

  // Carousel slides are hidden (offset() would be 0), so load them just before they are shown
  const $carousel = $('#galleryCarousel');

  if ($carousel.length) {
    const $slideImages = $carousel.find('.carousel-item img');

    function preloadAround(index) {
      [index, index + 1].forEach(function (i) {
        const $img = $slideImages.eq(i % $slideImages.length);
        if ($img.length) loadImage($img);
      });
    }

    preloadAround(0);

    $carousel.on('slide.bs.carousel', function (event) {
      const index = $carousel.find('.carousel-item').index(event.relatedTarget);
      if (index > -1) preloadAround(index);
    });
  }
});
