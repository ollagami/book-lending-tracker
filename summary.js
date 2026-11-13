// Summary page: total loans, overdue loans and the list of overdue books.
function renderSummary() {
  const summary = BookLib.getSummary();
  document.getElementById("stat-total").textContent = summary.total;
  document.getElementById("stat-overdue").textContent = summary.overdue;
  document.getElementById("stat-returned").textContent = summary.returned;

  const active = BookLib.getLoans()
    .filter((l) => !l.returned)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const next = active[0];
  document.getElementById("stat-next").textContent = next
    ? next.title + " (" + next.dueDate + ")"
    : "none";

  const list = document.getElementById("overdue-list");
  list.innerHTML = "";
  active.filter(BookLib.isOverdue).forEach((l) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between px-0";
    li.textContent = l.title + " - " + l.borrower;
    const due = document.createElement("span");
    due.className = "text-danger";
    due.textContent = "was due " + l.dueDate;
    li.appendChild(due);
    list.appendChild(li);
  });
  document.getElementById("no-overdue").classList.toggle("d-none", summary.overdue > 0);
}

renderSummary();
