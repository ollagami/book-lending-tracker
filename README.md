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
| File | Library | Description |
|------|---------|-------------|
| `styles.css` | **MiniUI CSS library** | Reusable `ui-` classes: layout, cards, forms, buttons, table, badges, stats, tabs, links. Theme with `--ui-*` variables. |
| `app.js` | **BookLending JS library** | Reusable library exposed as `window.BookLending` with a public API. |

The page uses only these two libraries.

### JS library API
```js
BookLending.init({ form, tableBody, totalEl, overdueEl, tabs, listTab, storageKey, emptyText });
BookLending.addLoan({ title, author, borrower, dueDate, genre });
BookLending.markReturned(id);
BookLending.removeLoan(id);
BookLending.getLoans();
BookLending.getSummary();   // { total, overdue }
BookLending.tabs("#tabs");  // make any .ui-tabs element work
BookLending.utils;          // el, formatDate, isPast, createStore, readForm, ...
```

## Workflow
Every feature was added to `main` through its own branch and Pull Request.
