# Marginalia 📖

**Marginalia** is a simple web project for collecting and sharing meaningful book excerpts.

The idea is inspired by the notes and thoughts people write in the margins of books — small pieces of text that stay with you.

### ✨ Features

* Home page
* About Us page
* Book excerpts
* Contact page
* Simple responsive design
* **Assignment 6 (jQuery):** live reading-log filter, autocomplete search, search highlighting, scroll progress bar, animated number counter, submit spinner, toast notifications, copy-to-clipboard buttons, lazy image loading

### 🛠️ Built With

* HTML
* CSS

### USED frameworks or libraries
* Bootstrap
* jQuery 4 (loaded from the official CDN)

### 🌐 Live Website

[Visit Marginalia](https://denoob17.github.io/Marginalia/)

[Visit Marginalia](https://marginalia-brown.vercel.app/)

### 👥 Team

Created as a university web development project.
SE-2503 Akerke Ramazan & Gabidin Kaldybek


## Final Project

Marginalia is a website for readers: collect memorable excerpts, browse a book gallery and find new books with the Google Books API.
Target audience: students and readers who want a quiet place to keep quotes and a shelf of books they plan to read.

### Pages (9)
`index.html`, `about.html`, `excerpts.html`, `gallery.html`, `books.html` (Google Books search), `contact.html`, `login.html`, `signup.html`, `profile.html`

### Requirements checklist
* **Responsive:** Bootstrap grid + Flexbox, tested at 360, 768, 1280 and 1920 px (no horizontal overflow)
* **Light / dark mode:** sun/moon button in the menu, saved in `localStorage` (`marginaliaColorMode`), same on every page
* **Authentication simulation:** Sign Up stores name, email, phone and password in `localStorage`; Log In checks them and opens the Profile page; the Profile page shows the stored details and the saved books
* **Form validation:** email, password (length + complexity), required fields and phone pattern; error messages are shown on the page; no `required` / `pattern` / `minlength` / `maxlength` / `type="email"`, and every `<form>` has `novalidate`
* **Search and filters:** Books page (query, language, sort, free e-books) with recent searches, last results and the saved shelf in `localStorage`; reading-log filter, gallery autocomplete and page search with highlighting
* **Button and UI effects:** hover lift and shadow, animated menu underline, spinner on submit, toasts, heart "pop", skeleton loading cards, fade-in images (all reduced-motion friendly)
* **External API:** Google Books API (`fetch` + `async/await`) with a loading state, error message with "Try again", and cached results when the request fails

### localStorage keys
`marginaliaUsers`, `marginaliaSession`, `marginaliaShelf`, `marginaliaLastSearch`, `marginaliaLastResults`, `marginaliaRecentSearches`, `marginaliaLogSearch`, `marginaliaColorMode`

Note: storing a password in `localStorage` is only for this school simulation. A real website never does this; it needs a server that stores a password hash.

### Google Books quota (429 "too many requests")
The API works without a key, but all visitors on the same network share a very small quota. To avoid the message:
1. Create a free API key in Google Cloud Console (enable "Books API").
2. Paste it into `GOOGLE_BOOKS_API_KEY` at the top of the Books block in `js/script.js`.

The site also keeps every search result for 30 minutes (`marginaliaApiCache`), so repeating a search sends no request.
