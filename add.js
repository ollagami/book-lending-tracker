// Lend a book page: validates the form and saves the loan with BookLib.
const form = document.getElementById("loan-form");
const recentCard = document.getElementById("recent");
const recentList = document.getElementById("recent-list");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const loan = BookLib.readLoanForm(form);
  if (!BookLib.showErrors(form, BookLib.validateLoan(loan))) return;

  const saved = BookLib.addLoan(loan);

  const li = document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between";
  li.textContent = saved.title + " by " + saved.author + " - lent to " + saved.borrower;
  const due = document.createElement("strong");
  due.textContent = "due " + saved.dueDate;
  li.appendChild(due);
  recentList.prepend(li);
  recentCard.classList.remove("d-none");

  form.reset();
  BookLib.clearErrors(form);
  BookLib.showToast("Loan added");
});

form.addEventListener("reset", () => BookLib.clearErrors(form));
