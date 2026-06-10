/* ============================================================================
   Tyler Roofing & Home Solutions — app.js
   Shared chrome (header/footer) + all interactivity for the static site.
   No framework. Loaded on every page after data.js.
   ========================================================================== */
(function () {
  "use strict";

  /* Path prefix — pages in /areas/ and /materials/ sit one level deep. */
  var ROOT = /\/(areas|materials)\//.test(location.pathname) ? "../" : "";
  var PHONE = "205-515-6968";
  var TEL = "tel:+12055156968";
  var EMAIL = "tylerroofingandhomesolutions@gmail.com";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var ARROW = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m-3-3 3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* Logo lockup — original Tyler wordmark, recolored to the accent green. */
  function logoHtml() {
    return '<a class="logo" href="' + ROOT + 'index.html" aria-label="Tyler Roofing & Home Solutions home">' +
      '<img src="' + ROOT + 'assets/img/tyler-logo-green.png" alt="Tyler Roofing & Home Solutions"></a>';
  }

  /* =========================================================================
     HEADER
     ========================================================================= */
  var NAV = [
    ["index.html", "Home", "home"],
    ["services.html", "Services", "services"],
    ["storm.html", "Storm", "storm"],
    ["reviews.html", "Reviews", "reviews"],
    ["faq.html", "FAQ", "faq"],
    ["contact.html", "Contact", "contact"],
  ];

  function buildHeader() {
    var page = document.body.dataset.page || "";
    var links = NAV.map(function (n) {
      return '<a href="' + ROOT + n[0] + '"' + (n[2] === page ? ' class="active"' : "") + ">" + n[1] + "</a>";
    }).join("");

    var header = el(
      '<header class="topnav">' +
        '<div class="topnav-inner">' +
          logoHtml() +
          '<nav class="navlinks" aria-label="Primary">' + links + "</nav>" +
          '<div class="nav-actions">' +
            '<a class="nav-phone mono" href="' + TEL + '">' + PHONE + "</a>" +
            '<button class="btn btn-accent" data-quote>' +
              '<span class="book-label-full">Book inspection</span>' +
              '<span class="book-label-short">Book</span>' + ARROW + "</button>" +
            '<button class="mobile-toggle" aria-label="Open menu">' +
              '<svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" stroke-width="1.5"/></svg>' +
            "</button>" +
          "</div>" +
        "</div>" +
      "</header>"
    );

    var sheet = el(
      '<div class="mobile-sheet">' +
        '<button class="mobile-close" aria-label="Close menu">&times;</button>' +
        NAV.map(function (n) { return '<a href="' + ROOT + n[0] + '">' + n[1] + "</a>"; }).join("") +
        '<button class="btn btn-accent" data-quote>Book inspection</button>' +
        '<a class="mono sheet-phone" href="' + TEL + '">' + PHONE + "</a>" +
      "</div>"
    );

    var host = $("#site-header");
    host.appendChild(header);
    document.body.appendChild(sheet);

    var open = function () { sheet.classList.add("open"); document.body.appendChild(scrim); };
    var close = function () { sheet.classList.remove("open"); if (scrim.parentNode) scrim.remove(); };
    var scrim = el('<div class="scrim"></div>');
    scrim.addEventListener("click", close);
    $(".mobile-toggle", header).addEventListener("click", open);
    $(".mobile-close", sheet).addEventListener("click", close);
    $all("a", sheet).forEach(function (a) { a.addEventListener("click", close); });
  }

  /* =========================================================================
     FOOTER
     ========================================================================= */
  var SOCIAL = [
    ["Facebook", "M13 4h-2.5C9.5 4 9 4.6 9 5.5V8H6.5v3H9v7h3v-7h2.3l.4-3H12V6c0-.5.2-1 .8-1H14V4z"],
    ["Instagram", "M7 4h6c1.6 0 3 1.4 3 3v6c0 1.6-1.4 3-3 3H7c-1.6 0-3-1.4-3-3V7c0-1.6 1.4-3 3-3zm3 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm3.7-.5a.7.7 0 110 1.4.7.7 0 010-1.4z"],
    ["Google", "M10 4.5a5.5 5.5 0 11-3.7 9.6l1.6-1.5A3.5 3.5 0 1010 6.5c.9 0 1.6.3 2.2.8L13.6 6A5.5 5.5 0 0010 4.5zM5 10h5v2h-3a3 3 0 005 1.5l1.5 1.4A5.5 5.5 0 014.5 10H5z"],
    ["YouTube", "M17 6.5c-.2-.7-.7-1.3-1.4-1.5C14 4.5 10 4.5 10 4.5s-4 0-5.6.5C3.7 5.2 3.2 5.8 3 6.5 2.5 8 2.5 10 2.5 10s0 2 .5 3.5c.2.7.7 1.3 1.4 1.5C6 15.5 10 15.5 10 15.5s4 0 5.6-.5c.7-.2 1.2-.8 1.4-1.5.5-1.5.5-3.5.5-3.5s0-2-.5-3.5zM8.5 12V8l3.5 2-3.5 2z"],
  ];

  function footerCol(title, items) {
    return '<div class="footer-col"><div class="col-title">' + title + "</div><div class=\"links\">" +
      items.map(function (i) { return '<a href="' + ROOT + i[1] + '">' + i[0] + "</a>"; }).join("") +
      "</div></div>";
  }

  function buildFooter() {
    var socials = SOCIAL.map(function (s) {
      return '<a href="#" aria-label="' + s[0] + '" title="' + s[0] + ' (coming soon)" data-soon>' +
        '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="' + s[1] + '"/></svg></a>';
    }).join("");

    var footer = el(
      '<footer class="footer">' +
        '<div class="container">' +
          '<div class="footer-grid">' +
            '<div class="footer-brand">' +
              logoHtml() +
              "<p>A family-run home services company. Based in Columbiana, AL and serving the Birmingham metro since 2023.</p>" +
              '<button class="btn btn-primary" data-quote>Book a free inspection</button>' +
              '<div class="footer-follow">' +
                '<div class="lbl">Follow along</div>' +
                '<div class="socials">' + socials + "</div>" +
                '<div class="note">Social accounts launching soon</div>' +
              "</div>" +
            "</div>" +
            footerCol("Services", [
              ["Roof replacement & repairs", "services.html#roof-replace"],
              ["Storm & insurance", "storm.html"],
              ["All materials", "materials.html"],
              ["Service areas", "areas.html"],
            ]) +
            footerCol("Company", [
              ["About us", "about.html"],
              ["Our work", "reviews.html"],
              ["Reviews", "reviews.html"],
              ["FAQ", "faq.html"],
              ["Financing", "financing.html"],
              ["Contact", "contact.html"],
            ]) +
            '<div class="footer-reach">' +
              '<div class="col-title">Reach us</div>' +
              '<div class="reach-list">' +
                '<div><div class="reach-k">Call or text</div>' +
                  '<a class="reach-phone" href="' + TEL + '">' + PHONE + "</a></div>" +
                '<div><div class="reach-k">Email</div>' +
                  '<a class="reach-email" href="mailto:' + EMAIL + '">' + EMAIL + "</a></div>" +
                '<div><div class="reach-k">Hours</div>' +
                  '<div class="reach-line">Open 24 / 7 · <span class="accent">Emergency response</span></div>' +
                  '<div class="reach-sub">Office line: Mon–Sat · Storm calls anytime</div></div>' +
                '<div><div class="reach-k">Office</div>' +
                  '<div class="reach-line">100 N Main Street, Suite 4</div>' +
                  '<div class="reach-sub mono">Columbiana, AL 35051</div></div>' +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="footer-legal">' +
            '<div class="lf">© ' + new Date().getFullYear() +
              " Tyler Roofing & Home Solutions · Licensed & insured · AL</div>" +
            '<div class="rt">' +
              '<span class="lf">AL License # pending</span>' +
              '<a class="lf" href="' + ROOT + 'privacy.html">Privacy</a>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</footer>"
    );
    $("#site-footer").appendChild(footer);
    $all("[data-soon]", footer).forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); });
    });
  }

  /* =========================================================================
     QUOTE / BOOKING MODAL
     ========================================================================= */
  // Roof flow — insurance/storm aware.
  var PROJECT_TYPES_ROOF = [
    { id: "replace", label: "Roof replacement", hint: "Full tear-off & install" },
    { id: "repair", label: "Repair or leak", hint: "Spot fix, valley, flashing" },
    { id: "storm", label: "Storm / insurance claim", hint: "We coordinate with adjuster" },
    { id: "gutter", label: "Gutters / exterior", hint: "Seamless, guards, fascia" },
    { id: "inspect", label: "Just an inspection", hint: "Free roof inspection + report" },
    { id: "other", label: "Something else", hint: "Tell us what's going on" },
  ];
  // Home-solutions flow — no insurance; homeowner just wants a job done.
  var PROJECT_TYPES_HOME = [
    { id: "paint", label: "Painting", hint: "Interior & exterior" },
    { id: "gutter", label: "Gutters & exterior", hint: "Seamless, guards, fascia, soffit" },
    { id: "drywall", label: "Drywall & interior", hint: "Drywall, trim, punch-list" },
    { id: "deck", label: "Decks & fences", hint: "Build & repair" },
    { id: "wash", label: "Pressure washing", hint: "House, drive & patios" },
    { id: "tree", label: "Tree removal", hint: "Limbs & full takedowns" },
    { id: "other", label: "Something else", hint: "Tell us what you need" },
  ];
  var PROPERTY_TYPES = [
    { id: "owner", label: "I own the home" },
    { id: "agent", label: "I'm a real-estate agent" },
    { id: "builder", label: "New construction / builder" },
    { id: "commercial", label: "Commercial property" },
  ];
  var URGENCY_ROOF = [
    { id: "active", label: "Active leak", note: "We'll prioritize" },
    { id: "month", label: "Within a month" },
    { id: "season", label: "This season" },
    { id: "explore", label: "Just exploring" },
  ];
  var URGENCY_HOME = [
    { id: "asap", label: "As soon as possible" },
    { id: "month", label: "Within a month" },
    { id: "season", label: "This season" },
    { id: "explore", label: "Just exploring" },
  ];
  var INSURANCE_CARRIERS = [
    { id: "alfa", label: "Alfa" },
    { id: "statefarm", label: "State Farm" },
    { id: "allstate", label: "Allstate" },
    { id: "usaa", label: "USAA" },
    { id: "farmers", label: "Farmers" },
    { id: "nationwide", label: "Nationwide" },
    { id: "liberty", label: "Liberty Mutual" },
    { id: "travelers", label: "Travelers" },
    { id: "other", label: "Other / not listed" },
    { id: "none", label: "Not filing a claim" },
  ];
  var QUOTE_CITIES = ["Hoover", "Pelham", "Helena", "Alabaster", "Birmingham"];
  var SLOTS = ["7:30 – 9:30a", "9:30 – 11:30a", "12:30 – 2:30p", "2:30 – 4:30p", "4:30 – 6:30p"];

  function openQuote(mode) {
    var isHome = mode === "home";
    var PROJECT_TYPES = isHome ? PROJECT_TYPES_HOME : PROJECT_TYPES_ROOF;
    var URGENCY = isHome ? URGENCY_HOME : URGENCY_ROOF;
    var FLOW = isHome
      ? ["project", "place", "contact", "time", "confirm"]
      : ["project", "insurance", "place", "contact", "time", "confirm"];
    var TOTAL_STEPS = FLOW.length;
    var step = 0;
    var data = { project: "", property: "", urgency: "", carrier: "", claim: "",
                 city: "", address: "", name: "", email: "", phone: "",
                 date: null, slot: "", notes: "" };
    var errors = {};
    var today = new Date();
    var view = new Date(today.getFullYear(), today.getMonth(), 1);

    var overlay = el('<div class="modal-overlay"><div class="modal" role="dialog" aria-modal="true"></div></div>');
    var modal = $(".modal", overlay);

    function close() {
      overlay.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }

    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    function choice(opt, active, compact) {
      return '<button type="button" class="choice' + (compact ? " compact" : "") +
        (active ? " active" : "") + '" data-val="' + opt.id + '">' +
        '<div class="c-label">' + opt.label + "</div>" +
        (opt.hint ? '<div class="c-hint">' + opt.hint + "</div>" : "") +
        (opt.note ? '<div class="c-note">' + opt.note + "</div>" : "") +
        '<div class="c-check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none">' +
        '<path d="M2 5 L4 7 L8 3" stroke="var(--accent-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
        "</button>";
    }
    function choiceGroup(label, opts, key, cols, compact, err) {
      return '<div class="field-group"><div class="fg-label">' + label + "</div>" +
        '<div class="choice-grid c' + cols + '" data-key="' + key + '">' +
        opts.map(function (o) { return choice(o, data[key] === o.id, compact); }).join("") +
        "</div>" + (err ? '<div class="fg-err">' + err + "</div>" : "") + "</div>";
    }

    function calendar() {
      var first = view.getDay();
      var daysIn = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      var monthName = view.toLocaleString("en-US", { month: "long", year: "numeric" });
      var isCurMonth = view.getMonth() === today.getMonth() && view.getFullYear() === today.getFullYear();
      var midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var cells = "";
      var i;
      for (i = 0; i < first; i++) cells += "<div></div>";
      for (i = 1; i <= daysIn; i++) {
        var dt = new Date(view.getFullYear(), view.getMonth(), i);
        var disabled = dt < midnight || dt.getDay() === 0;
        var sel = data.date && new Date(data.date).toDateString() === dt.toDateString();
        var isToday = dt.toDateString() === today.toDateString();
        cells += '<button type="button" class="cal-d' + (sel ? " sel" : "") + (isToday ? " today" : "") +
          '" data-day="' + i + '"' + (disabled ? " disabled" : "") + ">" + i + "</button>";
      }
      return '<div class="cal-grid">' +
        "<div><div class=\"cal-head\">" +
          '<button type="button" class="cal-nav" data-cal="prev"' + (isCurMonth ? " disabled" : "") + ">‹</button>" +
          '<div class="mn h-display">' + monthName + "</div>" +
          '<button type="button" class="cal-nav" data-cal="next">›</button>' +
        "</div>" +
        '<div class="cal">' +
          ["S", "M", "T", "W", "T", "F", "S"].map(function (d) { return '<div class="cal-h">' + d + "</div>"; }).join("") +
          cells +
        "</div>" +
        (errors.date ? '<div class="fg-err">' + errors.date + "</div>" : "") +
        '<div class="cal-note">Sundays off · Closed for family</div>' +
        "</div>" +
        '<div class="slots"><div class="lbl">Time window</div><div class="list">' +
          SLOTS.map(function (s) {
            return '<button type="button" class="slot' + (data.slot === s ? " active" : "") +
              '" data-slot="' + s + '">' + s + "</button>";
          }).join("") +
        "</div>" + (errors.slot ? '<div class="fg-err">' + errors.slot + "</div>" : "") + "</div>" +
        "</div>";
    }

    function stepBody() {
      var key = FLOW[step];
      if (key === "project") {
        return '<div class="quote-steps">' +
          choiceGroup(isHome ? "What can we help with?" : "What kind of project?", PROJECT_TYPES, "project", 2, false, errors.project) +
          choiceGroup("Who are you?", PROPERTY_TYPES, "property", 2, true, errors.property) +
          choiceGroup("How soon?", URGENCY, "urgency", 4, true, errors.urgency) +
          "</div>";
      }
      if (key === "insurance") {
        return '<div class="quote-steps">' +
          choiceGroup("Who's your insurance carrier?", INSURANCE_CARRIERS, "carrier", 2, true, errors.carrier) +
          '<div class="field"><label>Claim number (optional)</label>' +
            '<input type="text" data-field="claim" value="' + escAttr(data.claim) +
            '" placeholder="If you\'ve already filed a claim"></div>' +
          "</div>";
      }
      if (key === "place") {
        return '<div class="quote-steps">' +
          '<div class="field-group"><div class="fg-label">Which city?</div>' +
            '<div class="choice-grid c4" data-key="city" style="grid-template-columns:repeat(5,1fr)">' +
            QUOTE_CITIES.map(function (c) {
              return '<button type="button" class="slot' + (data.city === c ? " active" : "") +
                '" data-val="' + c + '" style="text-align:center">' + c + "</button>";
            }).join("") + "</div>" +
            (errors.city ? '<div class="fg-err">' + errors.city + "</div>" : "") + "</div>" +
          '<div class="field"><label>Address or cross streets</label>' +
            '<input type="text" data-field="address" value="' + escAttr(data.address) +
            '" placeholder="e.g. 1234 Riverchase Pkwy or Helena/Hwy 261">' +
            (errors.address ? '<div class="err">' + errors.address + "</div>" : "") + "</div>" +
          '<div class="field"><label>Anything we should know? (optional)</label>' +
            '<textarea rows="3" data-field="notes" placeholder="' + (isHome ? "What you'd like done, gate code, big trees, parking, etc." : "Steep pitch, big trees, gate code, insurance claim number, etc.") + '">' +
            escHtml(data.notes) + "</textarea></div>" +
          "</div>";
      }
      if (key === "contact") {
        return '<div class="quote-fields">' +
          '<div class="field"><label>Full name</label>' +
            '<input type="text" data-field="name" value="' + escAttr(data.name) + '" placeholder="First & last">' +
            (errors.name ? '<div class="err">' + errors.name + "</div>" : "") + "</div>" +
          '<div class="two">' +
            '<div class="field"><label>Email</label>' +
              '<input type="email" data-field="email" value="' + escAttr(data.email) + '" placeholder="you@example.com">' +
              (errors.email ? '<div class="err">' + errors.email + "</div>" : "") + "</div>" +
            '<div class="field"><label>Phone</label>' +
              '<input type="tel" data-field="phone" value="' + escAttr(data.phone) + '" placeholder="(205) 555-0123">' +
              (errors.phone ? '<div class="err">' + errors.phone + "</div>" : "") + "</div>" +
          "</div>" +
          '<div class="privacy-note">' +
            '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="var(--accent)" stroke-width="1.4"/><path d="M10 6v4m0 3v.5" stroke="var(--accent)" stroke-width="1.4" stroke-linecap="round"/></svg>' +
            '<div class="t">We don\'t share your info, don\'t sell leads, and don\'t send a single newsletter. You get a confirmation, a calendar invite, and a follow-up the day before.</div>' +
          "</div></div>";
      }
      if (key === "time") return calendar();
      // Confirm
      var d = data.date ? new Date(data.date) : null;
      var dateStr = d ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "";
      var proj = (PROJECT_TYPES.filter(function (p) { return p.id === data.project; })[0] || {}).label || "";
      var carrierLbl = (INSURANCE_CARRIERS.filter(function (c) { return c.id === data.carrier; })[0] || {}).label || "";
      function row(k, v) { return v ? '<div class="confirm-row"><div class="k">' + k + '</div><div class="v">' + escHtml(v) + "</div></div>" : ""; }
      return '<div class="confirm">' +
        '<div class="check"><svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 17 L14 23 L25 11" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
        '<h2 class="h-display">We\'ll see you ' + (dateStr.split(",")[0] || "soon") + ".</h2>" +
        "<p>We'll text you a confirmation in the next few minutes, and call the morning of to nail down a tighter ETA.</p>" +
        '<div class="confirm-box">' +
          row("Project", proj) +
          (isHome ? "" : row("Insurance", carrierLbl + (data.claim ? " · Claim #" + data.claim : ""))) +
          row("Property", data.city ? data.city + ", AL" : "") +
          row("Address", data.address) +
          row("Visit", dateStr + " · " + data.slot) +
          row("Contact", data.name + " · " + data.phone) +
        "</div>" +
        '<div class="confirm-actions">' +
          '<button class="btn btn-primary" data-close>Back to site</button>' +
          '<a class="btn btn-ghost" href="' + TEL + '">Call ' + PHONE + "</a>" +
        "</div></div>";
    }

    function render() {
      var TITLES = { project: "About the project", insurance: "Your insurance carrier",
        place: "Where's the property?", contact: "How do we reach you?",
        time: "Pick a time", confirm: "You're on the calendar" };
      var key = FLOW[step];
      var lastForm = TOTAL_STEPS - 1;
      var isConfirm = key === "confirm";
      var pct = ((step + 1) / lastForm) * 100;
      modal.innerHTML =
        '<div class="modal-head"><div>' +
          '<div class="step-lbl">' + (!isConfirm ? "Step " + (step + 1) + " of " + lastForm : "Booked") + "</div>" +
          '<div class="step-title h-display">' + TITLES[key] + "</div></div>" +
          '<button class="modal-close" data-close aria-label="Close">&times;</button></div>' +
        (!isConfirm ? '<div class="modal-progress"><div class="bar" style="width:' + pct + '%"></div></div>' : "") +
        '<div class="modal-body">' + stepBody() + "</div>" +
        (!isConfirm ?
          '<div class="modal-foot">' +
            "<div>" + (step > 0 ? '<button class="btn btn-ghost" data-back>← Back</button>' : "") + "</div>" +
            '<div class="right"><div class="free-note">Free · No obligation</div>' +
            '<button class="btn btn-primary" data-next>' + (key === "time" ? "Confirm booking" : "Continue") + ARROW + "</button></div>" +
          "</div>" : "");
      wire();
    }

    function wire() {
      $all("[data-close]", modal).forEach(function (b) { b.addEventListener("click", close); });
      var back = $("[data-back]", modal); if (back) back.addEventListener("click", function () { step--; errors = {}; render(); });
      var next = $("[data-next]", modal); if (next) next.addEventListener("click", advance);

      $all(".choice-grid[data-key] .choice, .choice-grid[data-key] .slot", modal).forEach(function (b) {
        b.addEventListener("click", function () {
          var grid = b.closest(".choice-grid");
          data[grid.dataset.key] = b.dataset.val;
          render();
        });
      });
      $all("[data-field]", modal).forEach(function (inp) {
        inp.addEventListener("input", function () { data[inp.dataset.field] = inp.value; });
      });
      $all(".cal-nav", modal).forEach(function (b) {
        b.addEventListener("click", function () {
          view = new Date(view.getFullYear(), view.getMonth() + (b.dataset.cal === "next" ? 1 : -1), 1);
          render();
        });
      });
      $all(".cal-d", modal).forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.disabled) return;
          data.date = new Date(view.getFullYear(), view.getMonth(), +b.dataset.day).toISOString();
          render();
        });
      });
      $all(".slot[data-slot]", modal).forEach(function (b) {
        b.addEventListener("click", function () { data.slot = b.dataset.slot; render(); });
      });
    }

    function advance() {
      errors = {};
      var key = FLOW[step];
      if (key === "project") {
        if (!data.project) errors.project = "Pick one";
        if (!data.property) errors.property = "Pick one";
        if (!data.urgency) errors.urgency = "Pick one";
      } else if (key === "insurance") {
        if (!data.carrier) errors.carrier = "Pick one";
      } else if (key === "place") {
        if (!data.city) errors.city = "Pick a city";
        if (!data.address.trim()) errors.address = "Address or cross streets";
      } else if (key === "contact") {
        if (!data.name.trim()) errors.name = "Required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Valid email please";
        if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ""))) errors.phone = "10 digits";
      } else if (key === "time") {
        if (!data.date) errors.date = "Pick a date";
        if (!data.slot) errors.slot = "Pick a window";
      }
      if (Object.keys(errors).length === 0) { step++; errors = {}; }
      render();
    }

    render();
    document.body.appendChild(overlay);
  }

  /* =========================================================================
     BEFORE / AFTER SLIDER
     ========================================================================= */
  function initBeforeAfter() {
    $all("[data-ba]").forEach(function (box) {
      var before = box.dataset.before, after = box.dataset.after, cat = box.dataset.cat || "";
      box.classList.add("ba");
      box.innerHTML =
        '<img class="ba-img ba-after" src="' + after + '" alt="After">' +
        '<img class="ba-img ba-before" src="' + before + '" alt="Before" style="filter:grayscale(.4) brightness(.85)">' +
        '<div class="ba-handle"><div class="knob"><svg width="22" height="14" viewBox="0 0 22 14" fill="none">' +
          '<path d="M7 2 L2 7 L7 12 M15 2 L20 7 L15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>' +
        '<span class="ba-tag before">Before</span><span class="ba-tag after">After</span>';
      var beforeImg = $(".ba-before", box), handle = $(".ba-handle", box);
      var pos = 50;
      function set(p) {
        pos = Math.max(0, Math.min(100, p));
        beforeImg.style.clipPath = "inset(0 " + (100 - pos) + "% 0 0)";
        handle.style.left = pos + "%";
      }
      set(50);
      function fromX(clientX) {
        var r = box.getBoundingClientRect();
        set(((clientX - r.left) / r.width) * 100);
      }
      function down(e) {
        e.preventDefault();
        fromX(e.clientX != null ? e.clientX : e.touches[0].clientX);
        function move(ev) { fromX(ev.clientX != null ? ev.clientX : ev.touches[0].clientX); }
        function up() {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          window.removeEventListener("touchmove", move);
          window.removeEventListener("touchend", up);
        }
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", up);
      }
      box.addEventListener("pointerdown", down);
    });
  }

  /* =========================================================================
     FAQ ACCORDION + CATEGORY FILTER
     ========================================================================= */
  function initFaq() {
    // Generic accordion — any .faq-item with a .faq-q button.
    $all(".faq-q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var wasOpen = item.classList.contains("open");
        if (item.dataset.exclusive === "1") {
          $all('.faq-item[data-exclusive="1"]').forEach(function (i) { i.classList.remove("open"); });
        }
        item.classList.toggle("open", !wasOpen);
      });
    });

    // Number the visible items (recomputed when the filter changes).
    function renumber() {
      var n = 0;
      $all(".faq-item").forEach(function (item) {
        var id = $(".faq-q .id", item);
        if (!id || item.style.display === "none") return;
        n++;
        id.textContent = pad(n);
      });
    }
    renumber();

    // FAQ-page category filter.
    var cats = $(".faq-cats");
    if (cats) {
      $all("button", cats).forEach(function (b) {
        b.addEventListener("click", function () {
          var cat = b.dataset.cat;
          $all("button", cats).forEach(function (x) { x.classList.toggle("active", x === b); });
          $all(".faq-item").forEach(function (item) {
            item.style.display = (cat === "all" || item.dataset.cat === cat) ? "" : "none";
            item.classList.remove("open");
          });
          renumber();
        });
      });
    }
  }

  /* =========================================================================
     LIGHTBOX (recent work)
     ========================================================================= */
  function initLightbox() {
    $all("[data-lightbox]").forEach(function (card) {
      card.addEventListener("click", function () {
        var src = card.dataset.lightbox;
        var title = card.dataset.title || "";
        var cat = card.dataset.cat || "";
        var detail = card.dataset.detail || "";
        var overlay = el(
          '<div class="modal-overlay"><div class="modal" style="max-width:960px">' +
            '<div style="position:relative">' +
              '<div class="photo r169" style="border:0;border-radius:0"><img src="' + src + '" alt="' + escAttr(title) + '">' +
                '<span class="photo-label">' + cat + "</span></div>" +
              '<button class="modal-close" data-close aria-label="Close" style="position:absolute;top:16px;right:16px">&times;</button>' +
            "</div>" +
            '<div style="padding:32px 36px 36px">' +
              '<div class="mono" style="font-size:11px;letter-spacing:.03em;color:var(--accent);">' + cat + "</div>" +
              '<h3 class="h-display" style="font-size:32px;margin:10px 0 14px;color:var(--fg)">' + escHtml(title) + "</h3>" +
              '<p style="color:var(--muted);margin:0">' + escHtml(detail) + "</p>" +
              '<div style="margin-top:24px"><button class="btn btn-primary" data-quote data-close>Get a quote like this ' + "→</button></div>" +
            "</div>" +
          "</div></div>"
        );
        function close() { overlay.remove(); document.body.style.overflow = ""; }
        overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
        $all("[data-close]", overlay).forEach(function (b) {
          b.addEventListener("click", function () { if (!b.hasAttribute("data-quote")) close(); else { close(); } });
        });
        document.body.style.overflow = "hidden";
        document.body.appendChild(overlay);
      });
    });
  }

  /* =========================================================================
     REVIEW MARQUEE
     ========================================================================= */
  function initMarquee() {
    var host = $("[data-marquee]");
    if (!host || !window.MARQUEE_REVIEWS) return;
    var stars = '<div class="stars">' + star().repeat(5) + "</div>";
    function card(r) {
      var initials = r.name.split(" ").map(function (s) { return s[0]; }).slice(0, 2).join("");
      var avatarInner = r.photo
        ? '<img src="' + r.photo + '" alt="' + r.name + '">'
        : initials;
      return '<article class="mrev-card">' +
        '<div class="mrev-head">' +
          '<div class="mrev-avatar" style="background:' + r.color + '">' + avatarInner + "</div>" +
          '<div style="flex:1;min-width:0"><div class="mrev-name">' + r.name + "</div>" +
            '<div class="mrev-where">' + r.town + " · " + r.date + "</div></div>" +
          '<svg width="16" height="16" viewBox="0 0 18 18" style="flex-shrink:0">' +
            '<path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62z"/>' +
            '<path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A8.997 8.997 0 0 0 9 18z"/>' +
            '<path fill="#FBBC05" d="M3.95 10.7A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.96H.96A8.996 8.996 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.99-2.34z"/>' +
            '<path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.96L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"/></svg>' +
        "</div>" +
        '<div style="display:flex;align-items:center;gap:10px">' + stars +
          '<span class="mrev-verified"><svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">' +
          '<path d="M5 0a5 5 0 100 10A5 5 0 005 0zm2.3 3.7L4.5 6.5 2.7 4.7l-.7.7 2.5 2.5 3.5-3.5-.7-.7z"/></svg>Verified</span></div>' +
        '<p class="mrev-body">"' + r.body + '"</p>' +
        '<div class="mrev-foot">' +
          '<div class="mrev-tag">' + r.project + "</div>" +
          (r.workPhoto ?
            '<a class="mrev-thumb" href="' + r.workPhoto + '" target="_blank" rel="noopener" aria-label="Photo from ' + r.name + '\'s review">' +
              '<img src="' + r.workPhoto + '" alt="">' +
            "</a>" : "") +
        "</div>" +
        "</article>";
    }
    var cards = window.MARQUEE_REVIEWS.concat(window.MARQUEE_REVIEWS).map(card).join("");
    host.innerHTML =
      '<div class="rev-marquee-head">' +
        '<div class="left">' +
          '<span style="width:28px;height:1px;background:var(--accent)"></span>' +
          '<div class="mono" style="font-size:11px;letter-spacing:.03em;color:var(--fg);opacity:.85">What neighbors are saying</div>' +
          '<div style="display:flex;align-items:center;gap:6px">' + stars +
            '<span class="mono" style="font-size:11px;color:var(--accent);letter-spacing:.06em;font-weight:600">5.0 · Google</span></div>' +
        "</div>" +
        '<a class="read-all" href="' + ROOT + 'reviews.html">Read all reviews →</a>' +
      "</div>" +
      '<div class="rev-marquee-track">' + cards + "</div>";
  }

  function star() {
    return '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1l1.8 4 4.2.5-3.2 2.9 1 4.4L7 10.7 3.2 12.8l1-4.4L1 5.5 5.2 5z"/></svg>';
  }

  /* Fill any empty <div class="stars" data-stars></div> with five stars. */
  function initStars() {
    $all(".stars[data-stars]").forEach(function (s) { s.innerHTML = star().repeat(5); });
  }

  /* =========================================================================
     REVIEW CAROUSEL (reviews page) — three cards visible, arrows shift the row
     one card at a time, viewport edges fade. Driven by the marquee review pool
     (Mike Thompson is excluded; he's the featured quote above).
     ========================================================================= */
  function reviewCardHtml(r) {
    var initials = r.name.split(" ").map(function (s) { return s[0]; }).slice(0, 2).join("");
    return '<article class="review-card">' +
      '<div class="rev-head"><span class="rev-avatar" style="background:' + r.color + '">' + initials + "</span>" +
        '<span class="rev-name">' + r.name + "</span></div>" +
      '<div class="stars" data-stars></div>' +
      "<p>" + r.body + "</p>" +
      '<div class="review-meta"><div class="where">' + r.project + " · " + r.town + "</div></div>" +
    "</article>";
  }

  function initReviewCarousel() {
    var root = $("[data-rev-carousel]");
    if (!root || !window.MARQUEE_REVIEWS) return;
    var viewport = $(".rev-viewport", root);
    var track = $(".rev-track", root);
    var prev = $(".rev-prev", root);
    var next = $(".rev-next", root);
    var reviews = window.MARQUEE_REVIEWS.filter(function (r) { return r.name !== "Mike Thompson"; });
    var n = reviews.length, gap = 20, vc, index, animating = false;
    function visibleCount() {
      var w = window.innerWidth;
      return w < 700 ? 1 : w < 1040 ? 2 : 3;
    }
    function cardStep() {
      var cw = (viewport.clientWidth - gap * (vc - 1)) / vc;
      $all(".review-card", track).forEach(function (c) { c.style.flex = "0 0 " + cw + "px"; });
      return cw + gap;
    }
    function position(animate) {
      track.style.transition = animate ? "" : "none";
      track.style.transform = "translateX(" + (-index * cardStep()) + "px)";
      if (!animate) { void track.offsetWidth; track.style.transition = ""; }
    }
    function build() {
      vc = Math.min(visibleCount(), n);
      // Clone last vc cards onto the front and first vc onto the end for a seamless loop.
      var loop = reviews.slice(n - vc).concat(reviews, reviews.slice(0, vc));
      track.innerHTML = loop.map(reviewCardHtml).join("");
      index = vc;
      position(false);
    }
    track.addEventListener("transitionend", function () {
      animating = false;
      if (index >= n + vc) { index -= n; position(false); }
      else if (index < vc) { index += n; position(false); }
    });
    function go(dir) {
      if (animating) return;
      animating = true;
      index += dir;
      position(true);
    }
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 120); });
    build();
  }

  /* =========================================================================
     REVIEW POPUP
     ========================================================================= */
  function initReviewPopup() {
    if (sessionStorage.getItem("tr_review_popup_closed") === "1") return;
    var fired = false;
    function show() {
      if (fired) return;
      fired = true;
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      var pop = el(
        '<div class="review-popup">' +
          '<button class="pop-close" aria-label="Close">&times;</button>' +
          '<div class="lbl">Worked with us before?</div>' +
          '<h3 class="h-display">Drop a quick review.</h3>' +
          "<p>Tyler Roofing is small — every review is the kind of word-of-mouth that keeps us going.</p>" +
          '<div class="actions">' +
            '<a class="btn btn-primary" style="font-size:13px;padding:10px 16px" href="https://www.google.com/search?q=Tyler+Roofing+and+Home+Solutions+Columbiana+AL" target="_blank" rel="noopener">Leave a Google review →</a>' +
            '<button class="later">Maybe later</button>' +
          "</div></div>"
      );
      function dismiss() {
        pop.remove();
        sessionStorage.setItem("tr_review_popup_closed", "1");
      }
      $(".pop-close", pop).addEventListener("click", dismiss);
      $(".later", pop).addEventListener("click", dismiss);
      $(".btn", pop).addEventListener("click", dismiss);
      document.body.appendChild(pop);
    }
    function onScroll() {
      var pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (pct > 0.5) show();
    }
    var timer = setTimeout(show, 28000);
    window.addEventListener("scroll", onScroll);
  }

  /* =========================================================================
     SERVICE-AREA MAP (Leaflet)
     ========================================================================= */
  function cityIcon(L, name, opts) {
    var size = opts.active ? 16 : opts.primary ? 14 : 10;
    var weight = opts.primary ? 700 : 500;
    var fontSize = opts.primary ? 13 : 11.5;
    var ring = opts.active ? "box-shadow:0 0 0 6px color-mix(in oklab,var(--accent) 25%,transparent);" : "";
    var hq = opts.hq ? '<span style="font-family:JetBrains Mono,monospace;font-size:8.5px;letter-spacing:.03em;background:var(--accent);color:#fff;padding:1px 5px;border-radius:999px;margin-left:6px;font-weight:600">HQ</span>' : "";
    var label = opts.showLabel === false ? "" :
      '<span style="font-family:Manrope,sans-serif;font-size:' + fontSize + "px;font-weight:" + weight + ';color:var(--fg);background:color-mix(in oklab,var(--bg) 88%,transparent);padding:1px 6px;border-radius:6px;text-shadow:0 0 6px var(--bg)">' + name + hq + "</span>";
    var html =
      '<div style="display:flex;align-items:center;gap:6px;white-space:nowrap;transform:translate(-' + (size / 2) + "px,-" + (size / 2) + 'px)">' +
        '<span style="width:' + size + "px;height:" + size + 'px;border-radius:50%;background:var(--accent);border:2px solid var(--bg);' + ring + 'flex-shrink:0;display:inline-block"></span>' +
        label +
      "</div>";
    return L.divIcon({ className: "tr-city-marker", html: html, iconSize: [1, 1], iconAnchor: [0, 0] });
  }

  function initMaps() {
    if (!window.L || !window.CITY_COORDS) return;
    var L = window.L;
    $all("[data-map]").forEach(function (canvas) {
      if (canvas.dataset.map === "contact") { buildCoverageMap(L, canvas); return; }
      var interactive = canvas.dataset.map === "area";
      var showLabel = canvas.dataset.map !== "static";
      var activeId = "birmingham";
      var map = L.map(canvas, {
        center: [33.38, -86.78], zoom: 10, zoomControl: false,
        scrollWheelZoom: false, attributionControl: false,
      });
      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
        maxZoom: 19, subdomains: "abcd",
      }).addTo(map);
      L.control.attribution({ position: "bottomleft", prefix: false })
        .addAttribution("© OpenStreetMap, © CartoDB").addTo(map);
      L.circle([33.5186, -86.8104], {
        radius: 40000, color: "#014520", fillColor: "#014520",
        fillOpacity: 0.04, weight: 1, dashArray: "4 4",
      }).addTo(map);

      var markers = {};
      Object.keys(window.CITY_COORDS).forEach(function (id) {
        var c = window.CITY_COORDS[id];
        var m = L.marker([c.lat, c.lng], {
          icon: cityIcon(L, c.name, { primary: c.primary || c.hq, hq: c.hq, active: id === activeId, showLabel: showLabel }),
        }).addTo(map);
        if (interactive) m.on("click", function () { selectPin(id); });
        markers[id] = m;
      });
      var bounds = L.latLngBounds(Object.keys(window.CITY_COORDS).map(function (id) {
        var c = window.CITY_COORDS[id]; return [c.lat, c.lng];
      }));
      map.fitBounds(bounds, { padding: [40, 40] });

      function selectPin(id) {
        activeId = id;
        Object.keys(window.CITY_COORDS).forEach(function (k) {
          var c = window.CITY_COORDS[k];
          markers[k].setIcon(cityIcon(L, c.name, { primary: c.primary || c.hq, hq: c.hq, active: k === id, showLabel: showLabel }));
        });
        var c = window.CITY_COORDS[id];
        map.panTo([c.lat, c.lng], { animate: true, duration: 0.5 });
        updateAreaDetail(id);
      }
    });
  }

  /* Contact-page coverage map: a normal slippy map that names the counties we
     serve when zoomed out, then hands off to the base map's own city labels as
     you zoom in. Only counties we actually work are labelled — that's the
     "areas we cover" signal. Approximate county centroids; tier matches
     AL_SERVICE (core = Jefferson + Shelby). */
  function buildCoverageMap(L, canvas) {
    var COUNTIES = [
      { n: "Jefferson",  lat: 33.55, lng: -86.90, tier: "core" },
      { n: "Shelby",     lat: 33.26, lng: -86.66, tier: "core" },
      { n: "Tuscaloosa", lat: 33.29, lng: -87.52, tier: "edge" },
      { n: "St. Clair",  lat: 33.71, lng: -86.32, tier: "edge" },
      { n: "Bibb",       lat: 32.99, lng: -87.13, tier: "edge" },
      { n: "Talladega",  lat: 33.40, lng: -86.17, tier: "edge" },
      { n: "Blount",     lat: 33.98, lng: -86.57, tier: "edge" },
      { n: "Walker",     lat: 33.80, lng: -87.30, tier: "edge" },
      { n: "Cullman",    lat: 34.13, lng: -86.87, tier: "edge" },
      { n: "Chilton",    lat: 32.85, lng: -86.72, tier: "edge" },
      { n: "Coosa",      lat: 32.94, lng: -86.25, tier: "edge" },
      { n: "Montgomery", lat: 32.33, lng: -86.27, tier: "edge" }
    ];
    var map = L.map(canvas, {
      center: [33.3, -86.8], zoom: 8, zoomControl: false,
      scrollWheelZoom: false, attributionControl: false,
      minZoom: 6, maxZoom: 14,
    });
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd",
    }).addTo(map);
    L.control.attribution({ position: "bottomleft", prefix: false })
      .addAttribution("© OpenStreetMap, © CartoDB").addTo(map);

    var countyLayer = L.layerGroup();
    COUNTIES.forEach(function (c) {
      L.marker([c.lat, c.lng], {
        interactive: false, keyboard: false,
        icon: L.divIcon({
          className: "county-label county-" + c.tier,
          html: c.n + " County", iconSize: [150, 18], iconAnchor: [75, 9],
        }),
      }).addTo(countyLayer);
    });

    // Dashed coverage ring around the service area, then frame the map to it on
    // load. Montgomery is a far-south outlier — including it in the ring would
    // force an unreadable zoom-out, so the ring is sized to the main cluster;
    // Montgomery is still labelled when it's in frame.
    var ringPts = COUNTIES
      .filter(function (c) { return c.n !== "Montgomery"; })
      .map(function (c) { return L.latLng(c.lat, c.lng); });
    var center = L.latLngBounds(ringPts).getCenter();
    var radius = 0;
    ringPts.forEach(function (p) { radius = Math.max(radius, center.distanceTo(p)); });
    radius *= 1.2;
    L.circle(center, {
      radius: radius, color: "#014520", weight: 1.5,
      dashArray: "5 5", fillColor: "#014520", fillOpacity: 0.05,
    }).addTo(map);
    map.fitBounds(L.latLngBounds(COUNTIES.map(function (c) { return [c.lat, c.lng]; })), { padding: [24, 24] });

    // County names show when zoomed out; once you zoom in the base map's own
    // city labels take over (normal-map behaviour).
    function toggleCounties() {
      if (map.getZoom() <= 9) {
        if (!map.hasLayer(countyLayer)) countyLayer.addTo(map);
      } else if (map.hasLayer(countyLayer)) {
        map.removeLayer(countyLayer);
      }
    }
    toggleCounties();
    map.on("zoomend", toggleCounties);
  }

  /* =========================================================================
     ALABAMA COUNTY MAP (home page)
     Fetches the static SVG, tags service counties with tier + clickable,
     opens a popover with city links on click. No external dependencies.
     ========================================================================= */
  var AL_SERVICE = {
    "Jefferson":  { tier: "core", cities: ["birmingham","hoover","vestavia","mountainbrook","homewood","leeds","mccalla"] },
    "Shelby":     { tier: "core", cities: ["columbiana","hoover","pelham","helena","alabaster","chelsea","calera","leeds"] },
    "Tuscaloosa": { tier: "edge", cities: ["mccalla", {name:"Tuscaloosa", href:"areas/tuscaloosa.html"}, {name:"Northport", href:"areas/northport.html"}] },
    "St. Clair":  { tier: "edge", cities: ["leeds", {name:"Pell City", href:"areas/pell-city.html"}, {name:"Moody", href:"areas/moody.html"}, {name:"Springville", href:"areas/springville.html"}, {name:"Odenville", href:"areas/odenville.html"}] },
    "Bibb":       { tier: "edge", cities: [{name:"Centreville", href:"areas/centreville.html"}, {name:"Brent", href:"areas/brent.html"}, {name:"West Blocton", href:"areas/west-blocton.html"}] },
    "Talladega":  { tier: "edge", cities: [{name:"Talladega", href:"areas/talladega.html"}, {name:"Sylacauga", href:"areas/sylacauga.html"}, {name:"Childersburg", href:"areas/childersburg.html"}, {name:"Lincoln", href:"areas/lincoln.html"}] },
    "Blount":     { tier: "edge", cities: [{name:"Oneonta", href:"areas/oneonta.html"}, {name:"Cleveland", href:"areas/cleveland.html"}, {name:"Locust Fork", href:"areas/locust-fork.html"}] },
    "Walker":     { tier: "edge", cities: [{name:"Jasper", href:"areas/jasper.html"}, {name:"Sumiton", href:"areas/sumiton.html"}, {name:"Cordova", href:"areas/cordova.html"}] },
    "Cullman":    { tier: "edge", cities: [{name:"Cullman", href:"areas/cullman.html"}, {name:"Hanceville", href:"areas/hanceville.html"}, {name:"Good Hope", href:"areas/good-hope.html"}] },
    "Montgomery": { tier: "edge", cities: [{name:"Montgomery", href:"areas/montgomery.html"}, {name:"Pike Road", href:"areas/pike-road.html"}] },
    "Chilton":    { tier: "edge", cities: [{name:"Clanton", href:"areas/clanton.html"}, {name:"Jemison", href:"areas/jemison.html"}, {name:"Thorsby", href:"areas/thorsby.html"}] },
    "Coosa":      { tier: "edge", cities: [{name:"Rockford", href:"areas/rockford.html"}, {name:"Goodwater", href:"areas/goodwater.html"}] }
  };
  var CITY_PAGE = {
    columbiana:"areas/columbiana.html", birmingham:"areas/birmingham.html",
    hoover:"areas/hoover.html", vestavia:"areas/vestavia.html",
    mountainbrook:"areas/mountainbrook.html", homewood:"areas/homewood.html",
    pelham:"areas/pelham.html", helena:"areas/helena.html",
    alabaster:"areas/alabaster.html", chelsea:"areas/chelsea.html",
    calera:"areas/calera.html", mccalla:"areas/mccalla.html",
    leeds:"areas/leeds.html"
  };

  function initAlabamaMap() {
    var host = $("[data-al-map]");
    if (!host) return;
    var pillsWrap = $("[data-cov-pills]");
    var detail = $("[data-cov-detail]");

    // County selector pills: core counties first, then edge alphabetically.
    var order = Object.keys(AL_SERVICE).sort(function (a, b) {
      var ra = AL_SERVICE[a].tier === "core" ? 0 : 1;
      var rb = AL_SERVICE[b].tier === "core" ? 0 : 1;
      return ra - rb || a.localeCompare(b);
    });
    if (pillsWrap) {
      pillsWrap.innerHTML = order.map(function (c) {
        return '<button class="cov-pill" type="button" data-tier="' +
          AL_SERVICE[c].tier + '" data-county="' + c + '">' + c + "</button>";
      }).join("");
      pillsWrap.addEventListener("click", function (e) {
        var b = e.target.closest(".cov-pill");
        if (b) selectCounty(b.getAttribute("data-county"), host, pillsWrap, detail);
      });
    }
    resetCountyDetail(detail);

    fetch("assets/img/alabama-counties.svg")
      .then(function (r) { return r.text(); })
      .then(function (svg) {
        host.innerHTML = svg;
        Object.keys(AL_SERVICE).forEach(function (county) {
          var path = host.querySelector('path[id="' + county + '"]');
          if (!path) return;
          path.setAttribute("data-tier", AL_SERVICE[county].tier);
          path.setAttribute("data-clickable", "1");
          path.addEventListener("click", function () {
            selectCounty(county, host, pillsWrap, detail);
          });
        });
      })
      .catch(function () { host.innerHTML = '<div style="padding:24px;text-align:center;color:var(--muted)">Map unavailable.</div>'; });
  }

  function resetCountyDetail(detail) {
    if (!detail) return;
    detail.classList.remove("is-filled");
    detail.innerHTML = "";
  }

  function countyCityLinks(info) {
    var names = (window.CITY_COORDS || {});
    return info.cities.map(function (c) {
      // Metro cities are slug strings with a dedicated page; fringe cities are
      // {name} objects with no page, so they render as plain labels.
      if (typeof c === "string") {
        var label = (names[c] && names[c].name) || c;
        var href = CITY_PAGE[c] || "areas.html";
        return '<a class="cov-city" href="' + href + '">' + label + "</a>";
      }
      return c.href
        ? '<a class="cov-city" href="' + c.href + '">' + c.name + "</a>"
        : '<span class="cov-city np">' + c.name + "</span>";
    }).join("");
  }

  function selectCounty(county, host, pillsWrap, detail) {
    var info = AL_SERVICE[county];
    if (!info) return;
    if (pillsWrap) {
      $all(".cov-pill", pillsWrap).forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-county") === county);
      });
    }
    if (host) {
      $all('path[data-active="1"]', host).forEach(function (p) {
        p.removeAttribute("data-active");
      });
      var path = host.querySelector('path[id="' + county + '"]');
      if (path) {
        path.setAttribute("data-active", "1");
        // Draw last so its accent outline isn't clipped by neighbouring counties.
        path.parentNode.appendChild(path);
      }
    }
    if (detail) {
      detail.classList.add("is-filled");
      detail.innerHTML =
        '<div class="cov-detail-head">' +
          '<span class="cov-detail-county">' + county + " County</span>" +
          (info.tier === "core" ? '<span class="cov-badge">Core area</span>' : "") +
        "</div>" +
        '<div class="cov-cities">' + countyCityLinks(info) + "</div>";
    }
  }

  function updateAreaDetail(id) {
    var box = $(".area-detail");
    if (!box) return;
    var name = (window.CITY_COORDS[id] || {}).name || id;
    var txt = (window.AREA_DETAIL && window.AREA_DETAIL[id]) ||
      "Inside our regular Birmingham-metro service area.";
    $(".city", box).textContent = name;
    $(".txt", box).textContent = txt;
    var btn = $("[data-schedule-city]");
    if (btn) btn.textContent = "Schedule in " + name;
  }

  /* =========================================================================
     CONTACT FORM
     ========================================================================= */
  function initHeroForm() {
    var form = $("#hero-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      $all(".err", form).forEach(function (x) { x.remove(); });
      function fv(n) { return form.querySelector('[name="' + n + '"]').value; }
      var f = { name: fv("name"), phone: fv("phone"), zip: fv("zip"), need: fv("need") };
      var errs = {};
      if (!f.name.trim()) errs.name = "Required";
      if (!/^\d{10}$/.test(f.phone.replace(/\D/g, ""))) errs.phone = "10 digits";
      if (!/^\d{5}$/.test(f.zip.trim())) errs.zip = "5 digits";
      if (!f.need) errs.need = "Pick one";
      Object.keys(errs).forEach(function (k) {
        var field = form.querySelector('[name="' + k + '"]').closest(".field");
        field.appendChild(el('<div class="err">' + errs[k] + "</div>"));
      });
      if (Object.keys(errs).length) return;
      form.parentNode.replaceChild(el(
        '<div class="hero-form hero-form-sent">' +
          '<div class="lbl">✓ Request received</div>' +
          '<h3 class="h-display">We\'ll call to set up your free inspection.</h3>' +
          '<p>We\'ll reach out at the number you gave us, usually the same day. Need us sooner? Call <a href="' + TEL + '">' + PHONE + "</a>.</p>" +
        "</div>"
      ), form);
    });
  }

  function initContactForm() {
    var form = $("#contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      $all(".err", form).forEach(function (x) { x.remove(); });
      function fv(n) { return form.querySelector('[name="' + n + '"]').value; }
      var f = { name: fv("name"), email: fv("email"), phone: fv("phone"), msg: fv("msg") };
      var errs = {};
      if (!f.name.trim()) errs.name = "Required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = "Valid email please";
      if (f.phone && !/^\d{10}$/.test(f.phone.replace(/\D/g, ""))) errs.phone = "10 digits";
      if (!f.msg.trim()) errs.msg = "Tell us a bit about the job";
      Object.keys(errs).forEach(function (k) {
        var field = form.querySelector('[name="' + k + '"]').closest(".field");
        field.appendChild(el('<div class="err">' + errs[k] + "</div>"));
      });
      if (Object.keys(errs).length) return;
      var wrap = form.parentNode;
      form.remove();
      wrap.appendChild(el(
        '<div class="form-sent">' +
          '<div class="lbl">✓ Message sent</div>' +
          '<h3 class="h-display">We\'ll be in touch within the day.</h3>' +
          '<p>We\'ll text or call you at the number you provided. If it\'s urgent, go ahead and call <a href="' + TEL + '">' + PHONE + "</a>.</p>" +
        "</div>"
      ));
    });
  }

  /* =========================================================================
     CHECKLIST MODAL
     ========================================================================= */
  function initChecklist() {
    var CL = [
      { t: "From the ground", items: [
        "Walk the perimeter — look for shingle pieces in the yard",
        "Check downspouts for piled-up granules (looks like coarse black sand)",
        "Look at gutters, downspouts, and AC fins for dents",
        "Photograph anything visible from the ground"] },
      { t: "Inside the house", items: [
        "Check ceilings for water stains or new discoloration",
        "Open the attic, look for daylight or wet spots on rafters",
        "Smell — musty or damp = leak in progress",
        "Check around skylights, vents, chimneys"] },
      { t: "Document for insurance", items: [
        "Note the storm date (or storm event the damage is tied to)",
        "Save weather reports — news, NWS alerts, neighborhood posts",
        "Take dated photos of all visible damage",
        "Don't file a claim before getting an honest inspection"] },
      { t: "Then call us", items: [
        "Free drone or boots-on inspection",
        "Written quote within a couple days",
        "We'll tell you if it's repair, replace, or wait-and-see"] },
    ];
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-checklist]");
      if (!trigger) return;
      e.preventDefault();
      var secs = CL.map(function (s, i) {
        return '<div class="cl-sec"><div class="cl-head">' + pad(i + 1) + " · " + s.t + "</div><ul>" +
          s.items.map(function (it) { return '<li><span class="box"></span>' + it + "</li>"; }).join("") +
          "</ul></div>";
      }).join("");
      var overlay = el(
        '<div class="modal-overlay"><div class="modal checklist-modal" style="max-width:720px">' +
          '<div class="modal-head"><div>' +
            '<div class="step-lbl">Free · printable · no email required</div>' +
            '<div class="step-title h-display">The roof-check checklist</div></div>' +
            '<button class="modal-close" data-close aria-label="Close">&times;</button></div>' +
          '<div class="modal-body">' + secs + "</div>" +
          '<div class="modal-foot"><button class="btn btn-ghost" data-print>Print this</button>' +
            '<a class="btn btn-primary" href="' + TEL + '">Or call ' + PHONE + "</a></div>" +
        "</div></div>"
      );
      function close() { overlay.remove(); document.body.style.overflow = ""; }
      overlay.addEventListener("click", function (ev) { if (ev.target === overlay) close(); });
      $("[data-close]", overlay).addEventListener("click", close);
      $("[data-print]", overlay).addEventListener("click", function () { window.print(); });
      document.body.style.overflow = "hidden";
      document.body.appendChild(overlay);
    });
  }

  /* =========================================================================
     SERVICES PAGE — smooth-scroll to a service from #hash
     ========================================================================= */
  function initServiceAnchors() {
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) {
        setTimeout(function () {
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
        }, 120);
      }
    }
    $all('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      a.addEventListener("click", function (e) {
        var t = document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
      });
    });
  }

  // Filters the recent-work gallery by ?work=Cat1,Cat2 (used by the home-page
  // "More than roofing" links). Scroll to #work is handled by initServiceAnchors.
  function initWorkFilter() {
    var grid = $(".work-grid");
    if (!grid) return;
    var raw = new URLSearchParams(location.search).get("work");
    if (!raw) return;
    var wanted = raw.split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    if (!wanted.length) return;

    var shown = 0;
    $all(".work-card", grid).forEach(function (card) {
      var match = wanted.indexOf((card.dataset.cat || "").toLowerCase()) !== -1;
      card.style.display = match ? "" : "none";
      if (match) shown++;
    });
    if (!shown) {
      $all(".work-card", grid).forEach(function (card) { card.style.display = ""; });
      return;
    }

    var label = raw.split(",").map(function (s) { return s.trim(); }).join(" · ");
    var notice = document.createElement("div");
    notice.className = "work-filter-notice";
    var span = document.createElement("span");
    span.textContent = "Showing " + label + " work";
    var reset = document.createElement("a");
    reset.href = "reviews.html#work";
    reset.textContent = "Show all";
    notice.appendChild(span);
    notice.appendChild(document.createTextNode(" · "));
    notice.appendChild(reset);
    grid.parentNode.insertBefore(notice, grid);
  }

  /* =========================================================================
     HELPERS
     ========================================================================= */
  function pad(n) { return String(n).padStart(2, "0"); }
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }
  function escAttr(s) { return escHtml(s).replace(/"/g, "&quot;"); }

  /* =========================================================================
     BOOT
     ========================================================================= */
  function init() {
    buildHeader();
    buildFooter();
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-quote]");
      if (t) { e.preventDefault(); openQuote(t.getAttribute("data-quote") === "home" ? "home" : "roof"); }
    });
    initBeforeAfter();
    initFaq();
    initLightbox();
    initMarquee();
    initMaps();
    initAlabamaMap();
    initHeroForm();
    initContactForm();
    initChecklist();
    initServiceAnchors();
    initWorkFilter();
    initReviewCarousel();
    initStars();
    initReviewPopup();
    if ($(".area-detail")) updateAreaDetail("birmingham");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
