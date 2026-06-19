// AVARA Investments — lead capture handler
// Posts name + email to the submit-lead Edge Function, then redirects to the PDF.
(function () {
  var ENDPOINT = "https://zqmskivzktreotmtfeqz.supabase.co/functions/v1/submit-lead";

  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? (el.value || "").trim() : "";
  }

  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    var msg = form.querySelector(".form-msg");
    var btn = form.querySelector('button[type="submit"]');
    var defaultLabel = btn ? btn.textContent : "Get it";
    var download = form.getAttribute("data-download");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (msg) { msg.textContent = ""; msg.classList.remove("error"); }

      // Honeypot: real users leave this empty. Bots fill it.
      if (val(form, "company")) { window.location.href = download; return; }

      var email = val(form, "email");
      if (!email || email.indexOf("@") === -1) {
        if (msg) { msg.textContent = "Please enter a valid email."; msg.classList.add("error"); }
        return;
      }

      var payload = {
        name: val(form, "name") || null,
        email: email,
        magnet: form.getAttribute("data-magnet"),
        source_page: window.location.pathname,
        utm: Object.fromEntries(new URLSearchParams(window.location.search))
      };

      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("submit failed");
          // Success — send them to the download.
          window.location.href = download;
        })
        .catch(function () {
          if (msg) { msg.textContent = "Something went wrong. Please try again."; msg.classList.add("error"); }
          if (btn) { btn.disabled = false; btn.textContent = defaultLabel; }
        });
    });
  });
})();
