// Shared page behavior: mobile nav, gallery lightbox, inquiry form.
(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-shot]"));
  var dialog = document.querySelector("[data-lightbox]");
  var frame = dialog ? dialog.querySelector("[data-lightbox-img]") : null;
  var caption = dialog ? dialog.querySelector("[data-lightbox-caption]") : null;
  var index = 0;

  function show(next) {
    if (!dialog || !frame || !shots.length) return;
    index = (next + shots.length) % shots.length;
    var source = shots[index].querySelector("img");
    if (!source) return;
    frame.src = source.currentSrc || source.src;
    frame.alt = source.alt || "";
    if (caption) caption.textContent = source.alt || "";
    if (!dialog.open && typeof dialog.showModal === "function") dialog.showModal();
  }

  shots.forEach(function (shot, shotIndex) {
    shot.addEventListener("click", function () {
      show(shotIndex);
    });
  });

  if (dialog) {
    var prev = dialog.querySelector("[data-prev]");
    var next = dialog.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { show(index - 1); });
    if (next) next.addEventListener("click", function () { show(index + 1); });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    });
    dialog.addEventListener("close", function () {
      if (frame) frame.removeAttribute("src");
    });
  }

  var strip = document.querySelector("[data-filmstrip]");
  if (strip) {
    var filmPrev = document.querySelector("[data-film-prev]");
    var filmNext = document.querySelector("[data-film-next]");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function scrollFilm(direction) {
      strip.scrollBy({
        left: Math.round(strip.clientWidth * 0.8) * direction,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }
    if (filmPrev) filmPrev.addEventListener("click", function () { scrollFilm(-1); });
    if (filmNext) filmNext.addEventListener("click", function () { scrollFilm(1); });
    function updateFilmCue() {
      var wrap = strip.parentElement;
      if (!wrap) return;
      var atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 8;
      wrap.classList.toggle("is-scrolled-end", atEnd);
    }
    strip.addEventListener("scroll", updateFilmCue, { passive: true });
    updateFilmCue();
  }

  var tour = document.querySelector(".video-tour");
  if (tour) {
    var tourVideo = tour.querySelector("video");
    var tourButton = tour.querySelector(".video-tour-control");
    var tourLabel = tourButton && tourButton.querySelector(".sr-only");
    var playIcon = tour.querySelector(".video-tour-icon-play");
    var stopIcon = tour.querySelector(".video-tour-icon-stop");
    if (tourVideo && tourButton && tourLabel && playIcon && stopIcon) {
      var tourToken = 0;

      function setTourPlaying(on) {
        tourButton.setAttribute("aria-pressed", on ? "true" : "false");
        tourLabel.textContent = on ? "Stop video tour" : "Play video tour";
        playIcon.hidden = on;
        stopIcon.hidden = !on;
      }

      function showTourPoster() {
        tourVideo.pause();
        try { tourVideo.currentTime = 0; } catch (err) {}
        tour.classList.remove("is-playing");
        setTourPlaying(false);
      }

      function startTour() {
        var mine = ++tourToken;
        tourVideo.muted = false;
        setTourPlaying(true);
        var pending = tourVideo.play();
        if (pending && pending.then) {
          pending.then(function () {
            if (mine !== tourToken) showTourPoster();
          }).catch(function () {
            if (mine === tourToken) showTourPoster();
          });
        }
      }

      tourButton.addEventListener("click", function () {
        if (tourVideo.paused || tourVideo.ended) startTour();
        else {
          tourToken += 1;
          showTourPoster();
        }
      });
      tourVideo.addEventListener("playing", function () {
        if (!tourVideo.paused && !tourVideo.ended) tour.classList.add("is-playing");
      });
      tourVideo.addEventListener("ended", function () {
        tourToken += 1;
        showTourPoster();
      });
      tourVideo.removeAttribute("controls");
      tour.classList.add("is-ready");
      tourButton.hidden = false;
      setTourPlaying(false);
    }
  }

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var status = form.querySelector("[data-form-status]");
    var button = form.querySelector("button[type=submit]");
    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = value;
    });
    if (button) button.disabled = true;
    if (status) {
      status.hidden = false;
      status.classList.remove("is-error");
      status.textContent = "Sending…";
    }
    fetch("/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify(data)
    }).then(function (response) {
      return response.json().then(function (body) {
        return { ok: response.ok, body: body };
      }).catch(function () {
        return { ok: response.ok, body: {} };
      });
    }).then(function (result) {
      if (result.ok && result.body && result.body.ok) {
        form.reset();
        if (status) status.textContent = "We will get back to you ASAP.";
      } else if (status) {
        status.classList.add("is-error");
        status.textContent = (result.body && result.body.error) || "Could not send that inquiry. Please try again.";
      }
    }).catch(function () {
      if (status) {
        status.classList.add("is-error");
        status.textContent = "Could not send that inquiry. Please try again.";
      }
    }).finally(function () {
      if (button) button.disabled = false;
    });
  });
})();
