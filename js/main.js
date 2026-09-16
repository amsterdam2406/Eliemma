/* EliEmma Health — shared interactions */
(function () {
  "use strict";

  var body = document.body;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  document.querySelectorAll('.socials a[href="#"]').forEach(function (link) {
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("title", "Social profile coming soon");
    link.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* Responsive navigation drawer */
  var ham = document.querySelector(".hamburger");
  var links = document.querySelector(".nav-links");
  var header = document.querySelector(".site-header");
  var overlay = document.querySelector(".nav-overlay");
  var firstNavLink = links && links.querySelector("a");

  if (ham && links) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "nav-overlay";
      overlay.setAttribute("aria-hidden", "true");
      body.appendChild(overlay);
    }

    function closeMenu() {
      var focusInside = document.activeElement && links.contains(document.activeElement);
      links.classList.remove("open");
      ham.setAttribute("aria-expanded", "false");
      ham.setAttribute("aria-label", "Open menu");
      overlay.classList.remove("visible");
      body.classList.remove("menu-open");
      if (focusInside) ham.focus();
    }

    function openMenu() {
      links.classList.add("open");
      ham.setAttribute("aria-expanded", "true");
      ham.setAttribute("aria-label", "Close menu");
      overlay.classList.add("visible");
      body.classList.add("menu-open");
      if (firstNavLink) firstNavLink.focus();
    }

    ham.addEventListener("click", function () {
      links.classList.contains("open") ? closeMenu() : openMenu();
    });
    document.addEventListener("click", function (e) {
      if (links.classList.contains("open") && !links.contains(e.target) && !ham.contains(e.target)) {
        closeMenu();
      }
    });
    overlay.addEventListener("click", closeMenu);
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  /* Sticky header shadow */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* Animated counters */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    var start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / 1400, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* Accessible, touch-friendly carousels with gentle autoplay */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel-track");
    var slides = Array.prototype.slice.call(root.querySelectorAll(".carousel-slide"));
    var prev = root.querySelector(".carousel-btn.prev");
    var next = root.querySelector(".carousel-btn.next");
    var dotsWrap = root.querySelector(".carousel-dots");
    if (!track || !slides.length) return;

    var index = 0;
    var timer = null;
    var dots = [];
    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carousel");

    if (dotsWrap) {
      slides.forEach(function (_, n) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to slide " + (n + 1));
        dot.addEventListener("click", function () { go(n); });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function go(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = "translate3d(-" + index * 100 + "%,0,0)";
      slides.forEach(function (slide, n) {
        slide.setAttribute("aria-hidden", n === index ? "false" : "true");
      });
      dots.forEach(function (dot, n) {
        dot.setAttribute("aria-current", n === index ? "true" : "false");
      });
    }

    function stopAutoplay() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function startAutoplay() {
      stopAutoplay();
      if (reduceMotion || slides.length < 2) return;
      timer = window.setInterval(function () { go(index + 1); }, 6000);
    }

    if (prev) {
      prev.disabled = slides.length < 2;
      prev.addEventListener("click", function () { go(index - 1); startAutoplay(); });
    }
    if (next) {
      next.disabled = slides.length < 2;
      next.addEventListener("click", function () { go(index + 1); startAutoplay(); });
    }
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); startAutoplay(); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); startAutoplay(); }
    });
    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", startAutoplay);

    var touchStart = null;
    track.addEventListener("touchstart", function (e) {
      touchStart = e.touches[0].clientX;
      stopAutoplay();
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (touchStart === null) return;
      var distance = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 45) go(distance < 0 ? index + 1 : index - 1);
      touchStart = null;
      startAutoplay();
    }, { passive: true });

    go(0);
    startAutoplay();
  });

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-q");
    var answer = item.querySelector(".faq-a");
    if (!question || !answer) return;
    question.setAttribute("aria-expanded", "false");
    question.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      question.setAttribute("aria-expanded", open ? "true" : "false");
      answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0";
    });
  });

  /* Contact form validation without pretending an unconfigured form was sent */
  var form = document.getElementById("contactForm");
  if (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      var valid = true;
      var firstInvalid = null;
      form.querySelectorAll("[required]").forEach(function (field) {
        var fieldValid = field.checkValidity();
        var wrapper = field.closest(".field");
        if (wrapper) wrapper.classList.toggle("invalid", !fieldValid);
        if (!fieldValid && !firstInvalid) firstInvalid = field;
        valid = fieldValid && valid;
      });
      if (!valid) {
        e.preventDefault();
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        if (status) {
          status.className = "form-status warn";
          status.textContent = "The enquiry form is ready, but its delivery endpoint still needs to be configured.";
          status.setAttribute("tabindex", "-1");
          status.focus();
        }
      } else {
        var submit = form.querySelector("button[type=submit]");
        if (submit) {
          submit.disabled = true;
          submit.textContent = "Sending…";
        }
        e.preventDefault();
        var payload = new FormData(form);
        var email = form.querySelector("#email");
        if (email && email.value) payload.set("_replyto", email.value);
        payload.set("_subject", "EliEmma Health enquiry received");
        payload.set("_autoresponse", "Thank you for contacting EliEmma Health. We have received your enquiry and our support team will reach out to you as soon as possible.");
        fetch(action, { method: "POST", body: payload, headers: { Accept: "application/json" } })
          .then(function (response) {
            if (!response.ok) throw new Error("Unable to submit enquiry");
            return response;
          })
          .then(function () {
            form.reset();
            if (status) {
              status.className = "form-status success";
              status.textContent = "Your enquiry has been submitted successfully. Our support team will reach out to you as soon as possible. A confirmation email has been requested for the email address you provided.";
              status.setAttribute("tabindex", "-1");
              status.focus();
            }
            if (submit) {
              submit.disabled = false;
              submit.textContent = "Submit";
            }
          })
          .catch(function () {
            if (status) {
              status.className = "form-status warn";
              status.textContent = "We could not send your enquiry right now. Please try again or contact our support team directly.";
              status.setAttribute("tabindex", "-1");
              status.focus();
            }
            if (submit) {
              submit.disabled = false;
              submit.textContent = "Submit";
            }
          });
      }
    });
    form.addEventListener("input", function (e) {
      var wrapper = e.target.closest(".field");
      if (wrapper) wrapper.classList.remove("invalid");
    });
  }
})();
