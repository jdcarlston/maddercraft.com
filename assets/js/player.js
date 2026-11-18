// Plays the songs on the Music page. Each song is a `.track` (see _includes/tracks.njk)
// with `data-src`, the address of its MP3. One song plays at a time; clicking the bar under
// a playing song jumps to that point. The file only starts downloading when you press play.
(function () {
  const tracks = document.querySelectorAll(".track[data-src]");
  if (!tracks.length) return;

  const audio = new Audio();
  audio.preload = "none";
  let current = null; // the .track that is loaded

  const clock = (s) => (isFinite(s) ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "");

  function showState(track, playing) {
    track.classList.toggle("is-playing", playing);
    const button = track.querySelector(".track__play");
    button.setAttribute("aria-label", (playing ? "Pause " : "Play ") + track.dataset.title);
    button.firstElementChild.textContent = playing ? "\u275A\u275A" : "\u25B6";
  }

  tracks.forEach((track) => {
    // The title also works as a link to the file; with the player running, it plays instead.
    track.querySelector(".track__title").addEventListener("click", (e) => {
      e.preventDefault();
      track.querySelector(".track__play").click();
    });

    track.querySelector(".track__play").addEventListener("click", () => {
      if (current === track) {
        audio.paused ? audio.play() : audio.pause();
        return;
      }
      if (current) {
        showState(current, false);
        current.querySelector(".track__fill").style.width = "0";
      }
      current = track;
      audio.src = track.dataset.src;
      audio.play();
    });

    track.querySelector(".track__bar").addEventListener("click", (e) => {
      if (current !== track || !audio.duration) return;
      const box = e.currentTarget.getBoundingClientRect();
      audio.currentTime = ((e.clientX - box.left) / box.width) * audio.duration;
    });
  });

  audio.addEventListener("play", () => current && showState(current, true));
  audio.addEventListener("pause", () => current && showState(current, false));
  audio.addEventListener("ended", () => current && showState(current, false));
  audio.addEventListener("timeupdate", () => {
    if (!current || !audio.duration) return;
    current.querySelector(".track__fill").style.width = (audio.currentTime / audio.duration) * 100 + "%";
    current.querySelector(".track__time").textContent = clock(audio.currentTime) + " / " + clock(audio.duration);
  });
})();
