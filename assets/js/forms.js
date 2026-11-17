// Shared by every form that books a call (the contact form, event requests, ...).
// Mark a form with data-then-url="<Calendly link>". When it's submitted, this sends it to Netlify
// in the background, then takes the visitor to that link with their name and email filled in.
// If the background send fails, the form submits the normal way and its thank-you page takes over.
document.querySelectorAll("form[data-then-url]").forEach(function (form) {
  var status = form.querySelector("[role=status]");
  var say = function (text) { if (status) status.textContent = text; };

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    form.querySelector("button[type=submit]").disabled = true;
    say("Sending…");
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    })
      .then(function (response) {
        if (!response.ok) throw new Error(response.status);
        say("Thank you. Taking you to my calendar…");
        var prefill = new URLSearchParams({ name: form.elements.name.value, email: form.elements.email.value });
        location.href = form.dataset.thenUrl + "?" + prefill.toString();
      })
      .catch(function () { form.submit(); });
  });
});
