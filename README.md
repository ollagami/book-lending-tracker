# Book Lending Tracker

A page that tracks lent books, built with only HTML, CSS and JavaScript.

**Live:** https://book-lending-tracker-app.pages.dev

## Features
- Form with required fields: Title, Author, Borrower, Due date, Genre
- Table with columns: Title, Author, Borrower, Due date, Genre, Status, Action
- Summary area with total loans and overdue loans
- Mark a book as returned or delete a loan
- Data is saved in the browser (localStorage)

## Libraries
This project uses only my own two libraries. Each one lives in its own repository and can be used in any project:

| Library | Repository | CDN link |
|---------|------------|----------|
| CSS library (MiniUI CSS) | https://github.com/ollagami/css-library | `https://cdn.jsdelivr.net/gh/ollagami/css-library@main/library.css` |
| JS library (MiniUI JS) | https://github.com/ollagami/js-library | `https://cdn.jsdelivr.net/gh/ollagami/js-library@main/library.js` |

- `styles.css` only imports the CSS library.
- `app.js` contains the app logic and uses only the JS library (`window.MiniUI`).

## Workflow
Every feature was added to `main` through its own branch and Pull Request.
