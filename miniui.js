/* ==========================================================================
   MiniUI JS Library v1.0
   A small, reusable, dependency-free JavaScript library.
   Include it with <script src="miniui.js"></script> and use window.MiniUI.
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---------- DOM helpers ---------- */
  function $(selector, root) {
    return (root || document).querySelector(selector);
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

  /* ---------- Storage (localStorage with safe fallback) ---------- */
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

  /* ---------- IDs ---------- */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Dates ---------- */
  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function isPast(isoDate) {
    return isoDate < todayISO();
  }

  function formatDate(isoDate) {
    var parts = isoDate.split("-");
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  /* ---------- Forms ---------- */
  // Validates every [required] field, marks invalid ones and returns the values.
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

  function clearErrors(form) {
    Array.prototype.forEach.call(form.querySelectorAll(".ui-invalid"), function (f) {
      f.classList.remove("ui-invalid");
    });
    Array.prototype.forEach.call(form.querySelectorAll("[data-error-for]"), function (e) {
      e.textContent = "";
    });
  }

  function resetForm(form) {
    form.reset();
    clearErrors(form);
  }

  /* ---------- Tables ---------- */
  // columns: [{ key, render(row) }]; render may return a string or a DOM node.
  function renderTable(tbody, rows, columns, emptyText) {
    tbody.innerHTML = "";
    if (!rows.length) {
      tbody.appendChild(el("tr", {}, [
        el("td", { className: "ui-empty", colspan: String(columns.length), text: emptyText || "No data yet." })
      ]));
      return;
    }
    rows.forEach(function (row) {
      tbody.appendChild(el("tr", {}, columns.map(function (col) {
        var content = col.render ? col.render(row) : row[col.key];
        return el("td", {}, [content instanceof Node ? content : String(content)]);
      })));
    });
  }

  /* ---------- Small components ---------- */
  function badge(text, variant) {
    return el("span", { className: "ui-badge ui-badge-" + (variant || "success"), text: text });
  }

  function button(text, variant, onClick) {
    return el("button", { type: "button", className: "ui-btn ui-btn-sm ui-btn-" + variant, text: text, onclick: onClick });
  }

  global.MiniUI = {
    $: $,
    el: el,
    createStore: createStore,
    uid: uid,
    todayISO: todayISO,
    isPast: isPast,
    formatDate: formatDate,
    readForm: readForm,
    clearErrors: clearErrors,
    resetForm: resetForm,
    renderTable: renderTable,
    badge: badge,
    button: button
  };
})(window);
