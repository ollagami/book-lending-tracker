/*
  BookLib - the JavaScript library of the Book Lending Tracker.
  Every page loads this file first and then uses BookLib.* in its own script.
*/
const BookLib = (function () {
  const STORAGE_KEY = "loans";

  /* ---------- localStorage ---------- */
  function getLoans() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveLoans(loans) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  }

  function addLoan(loan) {
    const loans = getLoans();
    const newLoan = Object.assign({ id: Date.now(), returned: false }, loan);
    loans.push(newLoan);
    saveLoans(loans);
    return newLoan;
  }

  function updateLoan(id, changes) {
    saveLoans(getLoans().map((l) => (l.id === id ? Object.assign({}, l, changes) : l)));
  }

  function deleteLoan(id) {
    saveLoans(getLoans().filter((l) => l.id !== id));
  }

  function findLoan(id) {
    return getLoans().find((l) => l.id === id);
  }

  /* ---------- Dates and status ---------- */
  function today() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function isOverdue(loan) {
    return !loan.returned && loan.dueDate < today();
  }

  function getStatus(loan) {
    if (loan.returned) return "Returned";
    return isOverdue(loan) ? "Overdue" : "On loan";
  }

  function statusBadgeClass(loan) {
    const status = getStatus(loan);
    if (status === "Returned") return "badge text-bg-success";
    if (status === "Overdue") return "badge text-bg-danger";
    return "badge text-bg-warning";
  }

  /* ---------- Summary ---------- */
  function getSummary() {
    const loans = getLoans();
    const active = loans.filter((l) => !l.returned);
    return {
      total: active.length,
      overdue: active.filter(isOverdue).length,
      returned: loans.length - active.length,
      all: loans.length
    };
  }

  /* ---------- Validation (Title, Author, Borrower, Due date, Genre are required) ---------- */
  function validateLoan(loan) {
    return {
      title: loan.title === "" ? "Title is required." : "",
      author: loan.author === "" ? "Author is required." : "",
      borrower: loan.borrower === "" ? "Borrower is required." : "",
      dueDate: loan.dueDate === "" ? "Due date is required." : "",
      genre: loan.genre === "" ? "Please choose a genre." : ""
    };
  }

  function readLoanForm(form) {
    return {
      title: form.elements.title.value.trim(),
      author: form.elements.author.value.trim(),
      borrower: form.elements.borrower.value.trim(),
      dueDate: form.elements.dueDate.value,
      genre: form.elements.genre.value
    };
  }

  // Shows the errors under each field. Returns true when the form is valid.
  function showErrors(form, errors) {
    let valid = true;
    for (const field in errors) {
      const input = form.elements[field];
      const box = form.querySelector('.error[data-for="' + field + '"]');
      input.classList.toggle("is-invalid", !!errors[field]);
      if (box) box.textContent = errors[field];
      if (errors[field]) valid = false;
    }
    return valid;
  }

  function clearErrors(form) {
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  }

  /* ---------- UI helpers ---------- */
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  }

  function startClock() {
    const tick = () => {
      const clock = document.getElementById("clock");
      if (clock) clock.textContent = new Date().toLocaleTimeString();
    };
    tick();
    setInterval(tick, 1000);
  }

  return {
    getLoans,
    saveLoans,
    addLoan,
    updateLoan,
    deleteLoan,
    findLoan,
    today,
    isOverdue,
    getStatus,
    statusBadgeClass,
    getSummary,
    validateLoan,
    readLoanForm,
    showErrors,
    clearErrors,
    showToast,
    startClock
  };
})();

BookLib.startClock();
