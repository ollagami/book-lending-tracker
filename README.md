# Book Lending Tracker

A website that tracks lent books, built with only HTML, CSS and JavaScript.

**Live:** https://book-lending-tracker-app.pages.dev

## Pages
Every page has its own link and is reachable from the navbar:

| Page | Link | What it does |
|------|------|--------------|
| Home | [/index.html](https://book-lending-tracker-app.pages.dev/index.html) | Introduction and links to all pages |
| Lend a book | [/add.html](https://book-lending-tracker-app.pages.dev/add.html) | Form with Title, Author, Borrower, Due date, Genre (all required) |
| Lent books | [/books.html](https://book-lending-tracker-app.pages.dev/books.html) | Table with Title, Author, Borrower, Due date, Genre, Status, Action (search, filter, edit, return, delete) |
| Summary | [/summary.html](https://book-lending-tracker-app.pages.dev/summary.html) | Total loans and overdue loans |

## Libraries
- **CSS library:** [Bootstrap 5.3.3](https://getbootstrap.com/) from cdnjs. `styles.css` only adds a few small extras on top of Bootstrap.
- **JavaScript library:** `app.js` is our own library, `BookLib`, used by every page
  (storage, validation, status, summary, toast, clock). Bootstrap's JS bundle is used for the navbar and the edit modal.

## Files
```
index.html        Home
add.html          Lend a book
books.html        Lent books
summary.html      Summary
styles.css        small additions on top of Bootstrap
app.js            BookLib - the JavaScript library
add.js            logic of the Lend a book page
books.js          logic of the Lent books page
summary.js        logic of the Summary page
```

Data is saved in the browser with `localStorage`.

## Workflow
Every feature was added to `main` through its own branch and Pull Request.
