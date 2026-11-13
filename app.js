/*
  Book Lending Tracker
  Written with the jQuery JavaScript library.
*/
$(function () {
  "use strict";

  var STORAGE_KEY = "book-lending-tracker";
  var loans = loadLoans();

  /* ---------- Storage ---------- */
  function loadLoans() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveLoans() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
    } catch (e) { /* storage not available */ }
  }

  /* ---------- Dates ---------- */
  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function isOverdue(loan) {
    return !loan.returned && loan.dueDate < todayISO();
  }

  function formatDate(iso) {
    var p = iso.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  /* ---------- Rendering ---------- */
  function statusBadge(loan) {
    if (loan.returned) return $("<span>").addClass("badge text-bg-success").text("Returned");
    if (isOverdue(loan)) return $("<span>").addClass("badge text-bg-danger").text("Overdue");
    return $("<span>").addClass("badge text-bg-warning").text("On loan");
  }

  function actionButtons(loan) {
    var $wrap = $("<div>").addClass("d-flex gap-2");
    if (!loan.returned) {
      $("<button>")
        .attr("type", "button")
        .addClass("btn btn-sm btn-success js-return")
        .attr("data-id", loan.id)
        .text("Mark returned")
        .appendTo($wrap);
    }
    $("<button>")
      .attr("type", "button")
      .addClass("btn btn-sm btn-outline-danger js-delete")
      .attr("data-id", loan.id)
      .text("Delete")
      .appendTo($wrap);
    return $wrap;
  }

  function renderTable() {
    var $body = $("#loan-table-body").empty();
    var sorted = loans.slice().sort(function (a, b) {
      return a.dueDate.localeCompare(b.dueDate);
    });

    if (!sorted.length) {
      $body.append(
        $("<tr>").append(
          $("<td>").attr("colspan", 7).addClass("text-center text-secondary py-4")
            .text("No books lent yet. Add one in the \"Lend a book\" tab.")
        )
      );
      return;
    }

    $.each(sorted, function (_, loan) {
      $("<tr>")
        .append($("<td>").text(loan.title))
        .append($("<td>").text(loan.author))
        .append($("<td>").text(loan.borrower))
        .append($("<td>").text(formatDate(loan.dueDate)))
        .append($("<td>").text(loan.genre))
        .append($("<td>").append(statusBadge(loan)))
        .append($("<td>").append(actionButtons(loan)))
        .appendTo($body);
    });
  }

  function renderSummary() {
    var active = $.grep(loans, function (l) { return !l.returned; });
    var overdue = $.grep(active, function (l) { return isOverdue(l); });
    $("#total-loans").text(active.length);
    $("#overdue-loans").text(overdue.length);
  }

  function render() {
    renderTable();
    renderSummary();
  }

  function update() {
    saveLoans();
    render();
  }

  /* ---------- Form ---------- */
  $("#loan-form").on("submit", function (event) {
    event.preventDefault();
    var $form = $(this);
    var valid = true;
    var values = {};

    $form.find("input, select").each(function () {
      var $field = $(this);
      var value = $.trim($field.val());
      var missing = $field.prop("required") && !value;
      $field.toggleClass("is-invalid", missing);
      if (missing) valid = false;
      values[$field.attr("name")] = value;
    });

    if (!valid) return;

    loans.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: values.title,
      author: values.author,
      borrower: values.borrower,
      dueDate: values.dueDate,
      genre: values.genre,
      returned: false
    });
    update();

    this.reset();
    $form.find(".is-invalid").removeClass("is-invalid");
    bootstrap.Tab.getOrCreateInstance(document.getElementById("books-tab")).show();
  });

  $("#loan-form").on("reset", function () {
    $(this).find(".is-invalid").removeClass("is-invalid");
  });

  $("#loan-form").on("input change", ".is-invalid", function () {
    if ($.trim($(this).val())) $(this).removeClass("is-invalid");
  });

  /* ---------- Table actions ---------- */
  $("#loan-table-body").on("click", ".js-return", function () {
    var id = $(this).attr("data-id");
    $.each(loans, function (_, l) { if (l.id === id) l.returned = true; });
    update();
  });

  $("#loan-table-body").on("click", ".js-delete", function () {
    var id = $(this).attr("data-id");
    if (!confirm("Delete this loan?")) return;
    loans = $.grep(loans, function (l) { return l.id !== id; });
    update();
  });

  render();
});
