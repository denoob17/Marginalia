
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      document.querySelectorAll('.error-msg').forEach((element) => {
        element.textContent = '';
      });

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const excerpt = document.getElementById('excerpt');
      const permission = document.getElementById('permission');
      const formSuccess = document.getElementById('formSuccess');

      let isValid = true;

      const showError = (id, message) => {
        const element = document.getElementById(id);
        if (element) element.textContent = message;
        isValid = false;
      };

      if (name && !name.value.trim()) {
        showError('nameError', 'Name is required.');
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.value.trim()) {
          showError('emailError', 'Email is required.');
        } else if (!emailRegex.test(email.value.trim())) {
          showError('emailError', 'Please enter a valid email address.');
        }
      }

      if (excerpt && !excerpt.value.trim()) {
        showError('excerptError', 'Please enter your excerpt.');
      }

      if (permission && !permission.checked) {
        showError('permissionError', 'Please confirm your permission.');
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

      document.querySelectorAll('.error-msg').forEach((element) => {
        element.textContent = '';
      });

      const email = document.getElementById('signupEmail');
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirmPassword');
      const accountSuccess = document.getElementById('accountSuccess');

      let isValid = true;

      const showError = (id, message) => {
        const element = document.getElementById(id);
        if (element) element.textContent = message;
        isValid = false;
      };

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.value.trim()) {
          showError('signupEmailError', 'Email is required.');
        } else if (!emailRegex.test(email.value.trim())) {
          showError('signupEmailError', 'Please enter a valid email address.');
        }
      }

      if (password) {
        if (!password.value) {
          showError('passwordError', 'Password is required.');
        } else if (password.value.length < 8) {
          showError('passwordError', 'Password must contain at least 8 characters.');
        }
      }

      if (confirmPassword && password) {
        if (!confirmPassword.value) {
          showError('confirmPasswordError', 'Please confirm your password.');
        } else if (confirmPassword.value !== password.value) {
          showError('confirmPasswordError', 'Passwords do not match.');
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

  document.querySelectorAll('.accordion-header').forEach((header) => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isOpen = header.classList.toggle('active');

      if (content) {
        content.classList.toggle('show', isOpen);
        header.setAttribute('aria-expanded', String(isOpen));
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

  const backgroundButton = document.getElementById('changeBgBtn');
  const themes = ['#211f1d', '#2a2723', '#34302a', '#302824'];
  let themeIndex = 0;

  if (backgroundButton) {
    backgroundButton.addEventListener('click', () => {
      themeIndex = (themeIndex + 1) % themes.length;
      document.documentElement.style.setProperty('--bg', themes[themeIndex]);
      document.documentElement.style.setProperty('--bs-body-bg', themes[themeIndex]);
    });
  }

  const updateDateTime = () => {
    const display = document.getElementById('dateTimeDisplay');

    if (display) {
      display.textContent = new Date().toLocaleString('en-US', {
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
  setInterval(updateDateTime, 1000);
});
