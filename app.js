/* ==========================================================================
   BookLending JS Library v2.0
   A reusable, dependency-free JavaScript library for tracking lent items.

   Usage (in any project):
     <script src="app.js"></script>
     <script>
       BookLending.init({
         form: "#loan-form",
         tableBody: "#loan-table-body",
         totalEl: "#total-loans",
         overdueEl: "#overdue-loans",
         tabs: "#tabs"            // optional
       });
     </script>

   Public API:
     BookLending.init(options)        -> starts a tracker, returns the API
     BookLending.getLoans()           -> array of loans
     BookLending.addLoan(loan)        -> adds { title, author, borrower, dueDate, genre }
     BookLending.markReturned(id)
     BookLending.removeLoan(id)
     BookLending.getSummary()         -> { total, overdue }
     BookLending.tabs(selector)       -> turns a .ui-tabs element into working tabs
     BookLending.utils                -> small helpers (el, formatDate, isPast, ...)
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---------------------------------------------------------------------
     Utils
     --------------------------------------------------------------------- */
  function $(selector) {
    return typeof selector === "string" ? document.querySelector(selector) : selector;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else if (key === "className") node.className = attrs[key];
      else if (key.indexOf("on") === 0) node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
      else node.setAttribute(key, attrs[key]);
    });
    [].concat(children || []).forEach(function (child) {
      if (child == null) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function isPast(isoDate) {
    return isoDate < todayISO();
  }

  function formatDate(isoDate) {
    var p = isoDate.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  function createStore(key) {
    var memory = [];
    return {
      load: function () {
        try {
          var raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : [];
        } catch (e) {
          return memory.slice();
        }
      },
      save: function (items) {
        memory = items.slice();
        try { localStorage.setItem(key, JSON.stringify(items)); } catch (e) { /* ignore */ }
      }
    };
  }

  /* ---------------------------------------------------------------------
     Form validation
     --------------------------------------------------------------------- */
  function clearErrors(form) {
    Array.prototype.forEach.call(form.querySelectorAll(".ui-invalid"), function (f) {
      f.classList.remove("ui-invalid");
    });
    Array.prototype.forEach.call(form.querySelectorAll("[data-error-for]"), function (e) {
      e.textContent = "";
    });
  }

  function readForm(form) {
    var values = {};
    var valid = true;
    Array.prototype.forEach.call(form.elements, function (field) {
      if (!field.name) return;
      var value = field.value.trim();
      var error = form.querySelector('[data-error-for="' + field.name + '"]');
      var message = field.required && !value ? "This field is required." : "";
      field.classList.toggle("ui-invalid", !!message);
      if (error) error.textContent = message;
      if (message) valid = false;
      values[field.name] = value;
    });
    return { valid: valid, values: values };
  }

  /* ---------------------------------------------------------------------
     Tabs
     Markup: <div class="ui-tabs" id="tabs">
               <button class="ui-tab" data-tab="panel-id">Label</button> ...
             </div>
             <section class="ui-tab-panel" id="panel-id">...</section>
     --------------------------------------------------------------------- */
  function tabs(selector) {
    var bar = $(selector);
    if (!bar) return null;
    var buttons = Array.prototype.slice.call(bar.querySelectorAll("[data-tab]"));

    function show(id) {
      buttons.forEach(function (btn) {
        var active = btn.getAttribute("data-tab") === id;
        btn.classList.toggle("ui-tab-active", active);
        btn.setAttribute("aria-selected", String(active));
        var panel = document.getElementById(btn.getAttribute("data-tab"));
        if (panel) panel.hidden = !active;
      });
    }

    bar.setAttribute("role", "tablist");
    buttons.forEach(function (btn) {
      btn.setAttribute("role", "tab");
      btn.addEventListener("click", function () { show(btn.getAttribute("data-tab")); });
    });
    if (buttons.length) show(buttons[0].getAttribute("data-tab"));
    return { show: show };
  }

  /* ---------------------------------------------------------------------
     Tracker
     --------------------------------------------------------------------- */
  var state = { loans: [], store: null, opts: null, tabs: null };

  function getStatus(loan) {
    if (loan.returned) return "Returned";
    return isPast(loan.dueDate) ? "Overdue" : "On loan";
  }

  function getSummary() {
    var active = state.loans.filter(function (l) { return !l.returned; });
    return {
      total: active.length,
      overdue: active.filter(function (l) { return isPast(l.dueDate); }).length
    };
  }

  function statusBadge(loan) {
    var status = getStatus(loan);
    var variant = status === "Returned" ? "success" : status === "Overdue" ? "danger" : "warning";
    return el("span", { className: "ui-badge ui-badge-" + variant, text: status });
  }

  function actionButtons(loan) {
    var wrap = el("div", { className: "ui-row" });
    if (!loan.returned) {
      wrap.appendChild(el("button", {
        type: "button", className: "ui-btn ui-btn-sm ui-btn-success", text: "Mark returned",
        onclick: function () { markReturned(loan.id); }
      }));
    }
    wrap.appendChild(el("button", {
      type: "button", className: "ui-btn ui-btn-sm ui-btn-danger", text: "Delete",
      onclick: function () { if (confirm("Delete this loan?")) removeLoan(loan.id); }
    }));
    return wrap;
  }

  function render() {
    var o = state.opts;
    var tbody = $(o.tableBody);
    var rows = state.loans.slice().sort(function (a, b) { return a.dueDate.localeCompare(b.dueDate); });

    tbody.innerHTML = "";
    if (!rows.length) {
      tbody.appendChild(el("tr", {}, [
        el("td", { className: "ui-empty", colspan: "7", text: o.emptyText })
      ]));
    }
    rows.forEach(function (loan) {
      tbody.appendChild(el("tr", {}, [
        el("td", { text: loan.title }),
        el("td", { text: loan.author }),
        el("td", { text: loan.borrower }),
        el("td", { text: formatDate(loan.dueDate) }),
        el("td", { text: loan.genre }),
        el("td", {}, [statusBadge(loan)]),
        el("td", {}, [actionButtons(loan)])
      ]));
    });

    var summary = getSummary();
    if (o.totalEl) $(o.totalEl).textContent = summary.total;
    if (o.overdueEl) $(o.overdueEl).textContent = summary.overdue;
  }

  function commit() {
    state.store.save(state.loans);
    render();
  }

  function addLoan(loan) {
    state.loans.push({
      id: uid(),
      title: loan.title,
      author: loan.author,
      borrower: loan.borrower,
      dueDate: loan.dueDate,
      genre: loan.genre,
      returned: false
    });
    commit();
  }

  function markReturned(id) {
    state.loans.forEach(function (l) { if (l.id === id) l.returned = true; });
    commit();
  }

  function removeLoan(id) {
    state.loans = state.loans.filter(function (l) { return l.id !== id; });
    commit();
  }

  function init(options) {
    var o = state.opts = {
      form: options.form,
      tableBody: options.tableBody,
      totalEl: options.totalEl,
      overdueEl: options.overdueEl,
      tabs: options.tabs,
      listTab: options.listTab,
      storageKey: options.storageKey || "book-lending-tracker",
      emptyText: options.emptyText || "No books lent yet."
    };

    state.store = createStore(o.storageKey);
    state.loans = state.store.load();
    if (o.tabs) state.tabs = tabs(o.tabs);

    var form = $(o.form);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var result = readForm(form);
      if (!result.valid) return;
      addLoan(result.values);
      form.reset();
      clearErrors(form);
      if (state.tabs && o.listTab) state.tabs.show(o.listTab);
    });
    form.addEventListener("reset", function () { clearErrors(form); });

    render();
    return api;
  }

  var api = {
    version: "2.0.0",
    init: init,
    getLoans: function () { return state.loans.slice(); },
    addLoan: addLoan,
    markReturned: markReturned,
    removeLoan: removeLoan,
    getSummary: getSummary,
    tabs: tabs,
    utils: {
      el: el, uid: uid, todayISO: todayISO, isPast: isPast,
      formatDate: formatDate, createStore: createStore,
      readForm: readForm, clearErrors: clearErrors
    }
  };

  global.BookLending = api;
})(window);
