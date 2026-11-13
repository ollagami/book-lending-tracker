# Book Lending Tracker

A page that tracks lent books, built with only HTML, CSS and JavaScript.

**Live:** https://book-lending-tracker-app.pages.dev

## Features
- Tabs: **Lend a book**, **Lent books**, **Summary**
- Form with required fields: Title, Author, Borrower, Due date, Genre
- Table with columns: Title, Author, Borrower, Due date, Genre, Status, Action
- Summary with total loans and overdue loans
- Mark a book as returned or delete a loan
- Links open in a new tab
- Data is saved in the browser (localStorage)

## Libraries
| Type | Library | Used in |
|------|---------|---------|
| CSS | [Bootstrap 5.3](https://getbootstrap.com/) | `index.html` (only Bootstrap classes, `styles.css` has no custom styles) |
| JavaScript | [jQuery 3.7](https://jquery.com/) | `app.js` (all app logic written with jQuery) |

## Files
- `index.html` – page structure (Bootstrap)
- `styles.css` – no custom CSS; the page uses only Bootstrap
- `app.js` – app logic (jQuery)

## Workflow
Every feature was added to `main` through its own branch and Pull Request.
