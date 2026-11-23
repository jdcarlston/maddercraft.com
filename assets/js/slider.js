// The one-photo-at-a-time slider (_includes/slider.njk).
// The arrow buttons and arrow keys step one photo (looping round at the ends); the counter follows swipes too.
document.querySelectorAll("[data-slider]").forEach((slider) => {
  const track = slider.querySelector(".slider__track");
  const current = slider.querySelector("[data-current]");
  const count = track.children.length;

  const index = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (i) => track.scrollTo({ left: ((i + count) % count) * track.clientWidth, behavior: "smooth" });

  slider.querySelector("[data-prev]").addEventListener("click", () => go(index() - 1));
  slider.querySelector("[data-next]").addEventListener("click", () => go(index() + 1));
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); go(index() - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); go(index() + 1); }
  });
  // Remember which photo is showing, so turning a phone or resizing the window keeps it in place.
  let showing = 0;
  track.addEventListener("scroll", () => { showing = index(); current.textContent = showing + 1; }, { passive: true });
  window.addEventListener("resize", () => { track.scrollLeft = showing * track.clientWidth; });
});
