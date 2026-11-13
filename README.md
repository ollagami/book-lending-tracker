# Book Lending Tracker

A page that tracks lent books, built with only HTML, CSS and JavaScript.

## Features
- Form with required fields: Title, Author, Borrower, Due date, Genre
- Table with columns: Title, Author, Borrower, Due date, Genre, Status, Action
- Summary area with total loans and overdue loans
- Mark a book as returned or delete a loan
- Data is saved in the browser (localStorage)

## Libraries (reusable in any project)
| File | Library | What it gives you |
|------|---------|-------------------|
| `styles.css` | **MiniUI CSS** | Design tokens + `ui-` classes: container, grid, card, form fields, buttons, table, badges, stats |
| `miniui.js` | **MiniUI JS** | `window.MiniUI`: DOM helpers, localStorage store, form validation, table rendering, date helpers, badge/button components |

The page uses only these two libraries. `app.js` contains the app logic and calls `MiniUI`.

To reuse them in another project, copy `styles.css` and `miniui.js` and add:
```html
<link rel="stylesheet" href="styles.css">
<script src="miniui.js"></script>
```

## Workflow
Every feature was added to `main` through its own branch and Pull Request.
