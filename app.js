/* ==========================================================================
   Book Lending Tracker
   App logic built only on the MiniUI JS library (miniui.js).
   ========================================================================== */
(function (UI) {
  "use strict";

  var store = UI.createStore("book-lending-tracker");
  var loans = store.load();

  var form = UI.$("#loan-form");
  var tableBody = UI.$("#loan-table-body");
  var totalEl = UI.$("#total-loans");
  var overdueEl = UI.$("#overdue-loans");

  function getStatus(loan) {
    if (loan.returned) return "Returned";
    return UI.isPast(loan.dueDate) ? "Overdue" : "On loan";
  }

  function statusBadge(loan) {
    var status = getStatus(loan);
    var variant = status === "Returned" ? "success" : status === "Overdue" ? "danger" : "warning";
    return UI.badge(status, variant);
  }

  function actionButtons(loan) {
    var wrap = UI.el("div", { className: "ui-row" });
    if (!loan.returned) {
      wrap.appendChild(UI.button("Mark returned", "success", function () { markReturned(loan.id); }));
    }
    wrap.appendChild(UI.button("Delete", "danger", function () { removeLoan(loan.id); }));
    return wrap;
  }

  var columns = [
    { key: "title" },
    { key: "author" },
    { key: "borrower" },
    { key: "dueDate", render: function (l) { return UI.formatDate(l.dueDate); } },
    { key: "genre" },
    { key: "status", render: statusBadge },
    { key: "action", render: actionButtons }
  ];

  function updateSummary() {
    var active = loans.filter(function (l) { return !l.returned; });
    totalEl.textContent = active.length;
    overdueEl.textContent = active.filter(function (l) { return UI.isPast(l.dueDate); }).length;
  }

  function render() {
    var sorted = loans.slice().sort(function (a, b) { return a.dueDate.localeCompare(b.dueDate); });
    UI.renderTable(tableBody, sorted, columns, "No books lent yet. Add your first loan above.");
    updateSummary();
  }

  function commit() {
    store.save(loans);
    render();
  }

  function addLoan(values) {
    loans.push({
      id: UI.uid(),
      title: values.title,
      author: values.author,
      borrower: values.borrower,
      dueDate: values.dueDate,
      genre: values.genre,
      returned: false
    });
    commit();
  }

  function markReturned(id) {
    loans.forEach(function (l) { if (l.id === id) l.returned = true; });
    commit();
  }

  function removeLoan(id) {
    if (!confirm("Delete this loan?")) return;
    loans = loans.filter(function (l) { return l.id !== id; });
    commit();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var result = UI.readForm(form);
    if (!result.valid) return;
    addLoan(result.values);
    UI.resetForm(form);
  });

  form.addEventListener("reset", function () {
    UI.clearErrors(form);
  });

  render();
})(window.MiniUI);
