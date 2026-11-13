// Lent books page: table, search, filter, edit, return and delete.
const tbody = document.getElementById("loan-list");
const emptyMessage = document.getElementById("empty-message");
const countBadge = document.getElementById("count");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter-status");
const editForm = document.getElementById("edit-form");
const editModal = new bootstrap.Modal(document.getElementById("edit-modal"));

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const SAMPLE = [
  { title: "Dune", author: "Frank Herbert", borrower: "Elira", dueDate: addDays(7), genre: "Science Fiction" },
  { title: "The Hobbit", author: "J.R.R. Tolkien", borrower: "Arben", dueDate: addDays(-3), genre: "Fantasy" },
  { title: "Sapiens", author: "Yuval Noah Harari", borrower: "Klea", dueDate: addDays(14), genre: "History" }
];

function cell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function button(text, className, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
}

function render() {
  const all = BookLib.getLoans();

  const term = searchInput.value.trim().toLowerCase();
  const status = filterSelect.value;
  const shown = all
    .filter((l) =>
      (l.title + " " + l.author + " " + l.borrower).toLowerCase().includes(term) &&
      (status === "" || BookLib.getStatus(l) === status)
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  tbody.innerHTML = "";
  shown.forEach((l) => {
    const tr = document.createElement("tr");
    tr.appendChild(cell(l.title));
    tr.appendChild(cell(l.author));
    tr.appendChild(cell(l.borrower));
    tr.appendChild(cell(l.dueDate));
    tr.appendChild(cell(l.genre));

    const statusTd = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = BookLib.statusBadgeClass(l);
    badge.textContent = BookLib.getStatus(l);
    statusTd.appendChild(badge);
    tr.appendChild(statusTd);

    const actions = document.createElement("td");
    actions.className = "text-end text-nowrap";
    if (!l.returned) {
      actions.appendChild(button("Return", "btn btn-sm btn-outline-success me-2", () => markReturned(l.id)));
    }
    actions.appendChild(button("Edit", "btn btn-sm btn-outline-primary me-2", () => openEdit(l.id)));
    actions.appendChild(button("Delete", "btn btn-sm btn-outline-danger", () => deleteLoan(l.id)));
    tr.appendChild(actions);

    tbody.appendChild(tr);
  });

  countBadge.textContent = shown.length;
  emptyMessage.classList.toggle("d-none", all.length > 0);
}

function markReturned(id) {
  BookLib.updateLoan(id, { returned: true });
  render();
  BookLib.showToast("Book marked as returned");
}

function deleteLoan(id) {
  if (!confirm("Delete this loan?")) return;
  BookLib.deleteLoan(id);
  render();
  BookLib.showToast("Loan deleted");
}

function openEdit(id) {
  const loan = BookLib.findLoan(id);
  if (!loan) return;
  document.getElementById("edit-id").value = loan.id;
  document.getElementById("edit-title").value = loan.title;
  document.getElementById("edit-author").value = loan.author;
  document.getElementById("edit-borrower").value = loan.borrower;
  document.getElementById("edit-dueDate").value = loan.dueDate;
  document.getElementById("edit-genre").value = loan.genre;
  BookLib.clearErrors(editForm);
  editModal.show();
}

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = Number(document.getElementById("edit-id").value);
  const updated = BookLib.readLoanForm(editForm);
  if (!BookLib.showErrors(editForm, BookLib.validateLoan(updated))) return;

  BookLib.updateLoan(id, updated);
  editModal.hide();
  render();
  BookLib.showToast("Loan updated");
});

document.getElementById("load-sample").addEventListener("click", () => {
  const loans = BookLib.getLoans().concat(
    SAMPLE.map((l, i) => Object.assign({ id: Date.now() + i, returned: false }, l))
  );
  BookLib.saveLoans(loans);
  render();
});

document.getElementById("clear-all").addEventListener("click", () => {
  if (!confirm("Delete all loans?")) return;
  BookLib.saveLoans([]);
  render();
  BookLib.showToast("All loans deleted");
});

searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);

render();
