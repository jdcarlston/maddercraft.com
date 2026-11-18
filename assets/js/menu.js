// On small screens the main menu is folded behind a "Menu" button (see .nav-toggle in site.css).
// This opens and closes it, and closes it again when a link inside is chosen.
(function () {
  const button = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!button || !nav) return;
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Close" : "Menu";
  };
  button.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
})();
