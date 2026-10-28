
document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;

    const themes = ["#211f1d", "#2a2723", "#34302a", "#302824"];
    let themeIndex = Number(localStorage.getItem("marginaliaThemeIndex")) || 0;
    let isHalloween = localStorage.getItem("marginaliaHalloween") === "true";

    const backgroundButton = document.getElementById("changeBgBtn");
    const music = new Audio("audio/halloween.mp3");
    music.loop = true;
    music.volume = 0.3;

    let musicButton = document.getElementById("halloweenMusicBtn");

    if (!musicButton) {
        musicButton = document.createElement("button");
        musicButton.id = "halloweenMusicBtn";
        musicButton.type = "button";
        musicButton.textContent = "Play Halloween Music";
        document.body.appendChild(musicButton);
    }

    Object.assign(musicButton.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: "9999",
        padding: "10px 16px",
        border: "1px solid #b5915b",
        borderRadius: "8px",
        background: "#211f1d",
        color: "#f5e6c8",
        cursor: "pointer",
        display: "none"
    });

    let ghost = document.getElementById("halloweenGhost");

    if (!ghost && document.querySelector("body")) {
        ghost = document.createElement("img");
        ghost.id = "halloweenGhost";
        ghost.src = "images/ghost.png";
        ghost.alt = "";
        ghost.setAttribute("aria-hidden", "true");

        Object.assign(ghost.style, {
            position: "fixed",
            width: "100px",
            height: "auto",
            left: "-120px",
            bottom: "30px",
            zIndex: "999",
            pointerEvents: "none",
            display: "none"
        });

        document.body.appendChild(ghost);
    }

    function updateMusicButton() {
        musicButton.style.display = isHalloween ? "block" : "none";
        musicButton.textContent = music.paused
            ? "Play Halloween Music"
            : "Mute Halloween Music";
        musicButton.setAttribute("aria-pressed", String(!music.paused));
    }

    function stopMusic() {
        music.pause();
        music.currentTime = 0;
        updateMusicButton();
    }

    async function playMusic() {
        try {
            await music.play();
        } catch (error) {
            console.warn("Music playback was blocked. Press the music button to start it.");
        }

        updateMusicButton();
    }

    function runGhost() {
        if (!ghost || !isHalloween) return;

        ghost.style.display = "block";
        ghost.style.transition = "none";
        ghost.style.left = "-120px";

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                ghost.style.transition = "left 7s linear";
                ghost.style.left = `${window.innerWidth + 120}px`;
            });
        });

        window.setTimeout(() => {
            if (ghost) {
                ghost.style.display = "none";
            }
        }, 7200);
    }

    function applyTheme() {
        root.style.setProperty("--bg", themes[themeIndex]);
        document.body.classList.toggle("halloween-mode", isHalloween);

        if (isHalloween) {
            root.style.setProperty("--bg", "#21150f");
            runGhost();
        } else if (ghost) {
            ghost.style.display = "none";
        }

        updateMusicButton();
    }

    if (backgroundButton) {
        backgroundButton.addEventListener("click", async () => {
            if (!isHalloween) {
                themeIndex++;

                if (themeIndex >= themes.length) {
                    themeIndex = 0;
                    isHalloween = true;
                    await playMusic();
                }
            } else {
                isHalloween = false;
                themeIndex = 0;
                stopMusic();
            }

            localStorage.setItem("marginaliaThemeIndex", String(themeIndex));
            localStorage.setItem("marginaliaHalloween", String(isHalloween));

            applyTheme();
        });
    }

    musicButton.addEventListener("click", async () => {
        if (music.paused) {
            await playMusic();
        } else {
            music.pause();
            updateMusicButton();
        }
    });

    applyTheme();

    const dateTimeDisplay = document.getElementById("dateTimeDisplay");

    if (dateTimeDisplay) {
        const updateDateTime = () => {
            dateTimeDisplay.textContent = new Date().toLocaleString();
        };

        updateDateTime();
        window.setInterval(updateDateTime, 1000);
    }

    document.querySelectorAll(".accordion-header").forEach((header) => {
        header.addEventListener("click", () => {
            const content =
                header.nextElementSibling ||
                document.getElementById(header.getAttribute("aria-controls"));

            const isExpanded = header.getAttribute("aria-expanded") === "true";

            header.setAttribute("aria-expanded", String(!isExpanded));
            header.classList.toggle("active", !isExpanded);

            if (content) {
                content.hidden = isExpanded;

                if (!content.hidden) {
                    content.style.display = "block";
                } else {
                    content.style.display = "none";
                }
            }
        });
    });

    const popup = document.getElementById("popupModal");
    const openPopupButton = document.getElementById("openPopupBtn");
    const closePopupButton = document.getElementById("closePopupBtn");

    function openPopup() {
        if (!popup) return;

        popup.style.display = "flex";
        popup.classList.add("visible");
        popup.setAttribute("aria-hidden", "false");
    }

    function closePopup() {
        if (!popup) return;

        popup.style.display = "none";
        popup.classList.remove("visible");
        popup.setAttribute("aria-hidden", "true");
    }

    if (openPopupButton) {
        openPopupButton.addEventListener("click", openPopup);
    }

    if (closePopupButton) {
        closePopupButton.addEventListener("click", closePopup);
    }

    if (popup) {
        popup.addEventListener("click", (event) => {
            if (event.target === popup) {
                closePopup();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closePopup();
        }
    });

    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.style.display = "block";
        }
    }

    function clearError(element) {
        if (element) {
            element.textContent = "";
            element.style.display = "none";
        }
    }

    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = contactForm.querySelector('[name="name"]');
            const email = contactForm.querySelector('[name="email"]');
            const message = contactForm.querySelector(
                '[name="message"], [name="excerpt"], textarea'
            );
            const consent = contactForm.querySelector(
                '[name="consent"], [name="permission"]'
            );

            const nameError = document.getElementById("nameError");
            const emailError = document.getElementById("emailError");
            const messageError = document.getElementById("messageError");
            const successMessage = document.getElementById("successMessage");

            [nameError, emailError, messageError].forEach(clearError);

            if (successMessage) {
                successMessage.textContent = "";
            }

            let valid = true;

            if (name && !name.value.trim()) {
                showError(nameError, "Please enter your name.");
                valid = false;
            }

            if (
                email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
            ) {
                showError(emailError, "Please enter a valid email address.");
                valid = false;
            }

            if (message && !message.value.trim()) {
                showError(messageError, "Please enter a message.");
                valid = false;
            }

            if (consent && !consent.checked) {
                valid = false;
                consent.setCustomValidity("Please confirm your permission.");
                consent.reportValidity();
            } else if (consent) {
                consent.setCustomValidity("");
            }

            if (!valid) return;

            if (successMessage) {
                successMessage.textContent = "Your message has been submitted successfully!";
                successMessage.style.display = "block";
            }

            contactForm.reset();
        });
    }

    const accountForm = document.getElementById("accountForm");

    if (accountForm) {
        accountForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const email = accountForm.querySelector('[name="email"]');
            const password = accountForm.querySelector('[name="password"]');
            const confirmPassword = accountForm.querySelector(
                '[name="confirmPassword"], [name="confirm-password"]'
            );

            const emailError = document.getElementById("emailError");
            const passwordError = document.getElementById("passwordError");
            const confirmPasswordError = document.getElementById("confirmPasswordError");
            const successMessage = document.getElementById("successMessage");

            [emailError, passwordError, confirmPasswordError].forEach(clearError);

            let valid = true;

            if (
                email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
            ) {
                showError(emailError, "Please enter a valid email address.");
                valid = false;
            }

            if (password && password.value.length < 8) {
                showError(passwordError, "Password must contain at least 8 characters.");
                valid = false;
            }

            if (
                password &&
                confirmPassword &&
                password.value !== confirmPassword.value
            ) {
                showError(confirmPasswordError, "Passwords do not match.");
                valid = false;
            }

            if (!valid) return;

            if (successMessage) {
                successMessage.textContent = "Form submitted successfully!";
                successMessage.style.display = "block";
            }

            accountForm.reset();
        });
    }

    document.querySelectorAll(".nav-link").forEach((link, index, links) => {
        link.addEventListener("keydown", (event) => {
            let nextIndex = index;

            if (event.key === "ArrowRight") {
                nextIndex = (index + 1) % links.length;
            } else if (event.key === "ArrowLeft") {
                nextIndex = (index - 1 + links.length) % links.length;
            } else {
                return;
            }

            event.preventDefault();
            links[nextIndex].focus();
        });
    });

    const scoobyRunner = document.getElementById("scooby-runner");

    if (scoobyRunner) {
        const frames = [
            "images/scooby-1.png",
            "images/scooby-2.png",
            "images/scooby-3.png",
            "images/scooby-1.png",
            "images/scooby-2.png",
            "images/scooby-3.png"
        ];

        const frameImage = document.createElement("img");
        frameImage.src = frames[0];
        frameImage.alt = "";
        frameImage.setAttribute("aria-hidden", "true");

        Object.assign(frameImage.style, {
            width: "100%",
            height: "100%",
            objectFit: "contain"
        });

        scoobyRunner.replaceChildren(frameImage);

        let frameIndex = 0;
        let frameTimer = null;

        scoobyRunner.classList.add("running");

        frameTimer = window.setInterval(() => {
            frameIndex = (frameIndex + 1) % frames.length;
            frameImage.src = frames[frameIndex];
        }, 200);

        scoobyRunner.addEventListener("animationend", () => {
            window.clearInterval(frameTimer);
            scoobyRunner.classList.remove("running");
            scoobyRunner.style.display = "none";
        }, { once: true });
    }
});
