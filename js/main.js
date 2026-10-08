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

  /* Keep every existing WhatsApp link on the configured number while
     opening a ready-to-send website enquiry on mobile and WhatsApp Web. */
  var whatsappMessage = "Hello EliEmma Health, I found you through your website and would like to learn more about your healthcare services. Please could you provide more information? Thank you.";
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (link) {
    var href = link.getAttribute("href") || "";
    if (href.indexOf("text=") === -1) {
      link.setAttribute("href", href + (href.indexOf("?") === -1 ? "?" : "&") + "text=" + encodeURIComponent(whatsappMessage));
    }
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

  /* Start the care animation quietly at half speed; muted autoplay is required
     by browser playback policies, while controls still let visitors opt in to sound. */
  document.querySelectorAll(".video-player").forEach(function (video) {
    var setHalfSpeed = function () {
      video.defaultPlaybackRate = 0.5;
      video.playbackRate = 0.5;
    };
    setHalfSpeed();
    video.addEventListener("loadedmetadata", setHalfSpeed);
  });

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
      if (!root.classList.contains("hero-background-carousel")) {
        track.style.transform = "translate3d(-" + index * 100 + "%,0,0)";
      }
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
        var inquiry = form.querySelector("#inquiry");
        var inquiryLabel = inquiry && inquiry.value ? inquiry.value : "Website";
        payload.set("_subject", "New " + inquiryLabel + " enquiry — EliEmma Health");
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

  /* Get Started menu shared by every page. */
  document.querySelectorAll(".nav-cta > a").forEach(function (trigger) {
    var item = trigger.parentElement;
    if (!item || item.dataset.dropdownReady === "true") return;
    item.dataset.dropdownReady = "true";
    item.classList.add("nav-dropdown");
    trigger.classList.add("nav-dropdown-toggle");
    trigger.setAttribute("href", "#");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = "Get Started <span class=\"nav-caret\" aria-hidden=\"true\">&#9662;</span>";

    var prefix = window.location.pathname.toLowerCase().indexOf("/pages/") !== -1 ? "" : "pages/";
    var menu = document.createElement("div");
    menu.className = "nav-dropdown-menu";
    menu.innerHTML = "<a href=\"" + prefix + "enroll.html\"><span class=\"dropdown-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 3 4 7v5c0 4.7 3.2 7.7 8 9 4.8-1.3 8-4.3 8-9V7l-8-4Z\"/><path d=\"M9 12h6M12 9v6\"/></svg></span><span class=\"dropdown-copy\">Home Health Service<small>Enroll Now</small></span><span class=\"dropdown-arrow\" aria-hidden=\"true\">→</span></a>" +
      "<a href=\"" + prefix + "careers.html\"><span class=\"dropdown-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M5 7h14v12H5z\"/><path d=\"M8 7V5h8v2M8 12h8M10 16h4\"/></svg></span><span class=\"dropdown-copy\">Career Application<small>Apply for a position</small></span><span class=\"dropdown-arrow\" aria-hidden=\"true\">→</span></a>";
    item.appendChild(menu);

    function closeDropdown() {
      item.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    }
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var open = item.classList.toggle("open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeDropdown);
    });
    document.addEventListener("click", function (e) {
      if (!item.contains(e.target)) closeDropdown();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDropdown();
    });
  });

  /* Nigerian state and city selector for the Home Health enrollment form. */
  var nigeriaLocations = [
    { name: "Lagos", cities: ["Ikeja", "Lekki", "Ajah", "Sangotedo", "Lagos Island", "Surulere", "Yaba", "Ikorodu", "Badagry"] },
    { name: "Ogun", cities: ["Abeokuta", "Sagamu", "Ijebu-Ode", "Ota", "Ilaro", "Ayetoro"] },
    { name: "Oyo", cities: ["Ibadan", "Ogbomosho", "Oyo", "Iseyin", "Eruwa"] },
    { name: "Kwara", cities: ["Ilorin", "Offa", "Jebba", "Lafiagi", "Pategi"] },
    { name: "Abuja (FCT)", value: "Federal Capital Territory", cities: ["Abuja Municipal", "Gwagwalada", "Kuje", "Bwari", "Kwali", "Abaji"] },
    { name: "Ekiti", cities: ["Ado-Ekiti", "Ikere", "Oye", "Ijero", "Ilawe"] },
    { name: "Ondo", cities: ["Akure", "Ondo Town", "Owo", "Ikare-Akoko", "Ore"] },
    { name: "Osun", cities: ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Ikirun"] },
    { name: "Abia", cities: ["Umuahia", "Aba", "Ohafia", "Arochukwu"] },
    { name: "Adamawa", cities: ["Yola", "Mubi", "Jimeta", "Numan"] },
    { name: "Akwa Ibom", cities: ["Uyo", "Eket", "Ikot Ekpene", "Oron"] },
    { name: "Anambra", cities: ["Awka", "Onitsha", "Nnewi", "Ekwulobia"] },
    { name: "Bauchi", cities: ["Bauchi", "Azare", "Misau", "Jama'are"] },
    { name: "Bayelsa", cities: ["Yenagoa", "Brass", "Sagbama", "Ogbia"] },
    { name: "Benue", cities: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala"] },
    { name: "Borno", cities: ["Maiduguri", "Bama", "Biu", "Dikwa"] },
    { name: "Cross River", cities: ["Calabar", "Ugep", "Ikom", "Ogoja"] },
    { name: "Delta", cities: ["Asaba", "Warri", "Sapele", "Ughelli", "Agbor"] },
    { name: "Ebonyi", cities: ["Abakaliki", "Afikpo", "Onueke", "Ezza"] },
    { name: "Edo", cities: ["Benin City", "Auchi", "Ekpoma", "Uromi"] },
    { name: "Enugu", cities: ["Enugu", "Nsukka", "Oji River", "Udi"] },
    { name: "Gombe", cities: ["Gombe", "Kaltungo", "Billiri", "Dukku"] },
    { name: "Imo", cities: ["Owerri", "Orlu", "Okigwe", "Oguta"] },
    { name: "Jigawa", cities: ["Dutse", "Hadejia", "Gumel", "Birnin Kudu"] },
    { name: "Kaduna", cities: ["Kaduna", "Zaria", "Kafanchan", "Saminaka"] },
    { name: "Kano", cities: ["Kano", "Wudil", "Gwarzo", "Bichi"] },
    { name: "Katsina", cities: ["Katsina", "Daura", "Funtua", "Malumfashi"] },
    { name: "Kebbi", cities: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru"] },
    { name: "Kogi", cities: ["Lokoja", "Okene", "Idah", "Anyigba"] },
    { name: "Nasarawa", cities: ["Lafia", "Keffi", "Akwanga", "Karu"] },
    { name: "Niger", cities: ["Minna", "Suleja", "Bida", "Kontagora"] },
    { name: "Plateau", cities: ["Jos", "Bukuru", "Pankshin", "Shendam"] },
    { name: "Rivers", cities: ["Port Harcourt", "Obio-Akpor", "Bonny", "Okrika", "Eleme"] },
    { name: "Sokoto", cities: ["Sokoto", "Tambuwal", "Wurno", "Gwadabawa"] },
    { name: "Taraba", cities: ["Jalingo", "Wukari", "Bali", "Gembu"] },
    { name: "Yobe", cities: ["Damaturu", "Potiskum", "Gashua", "Nguru"] },
    { name: "Zamfara", cities: ["Gusau", "Kaura Namoda", "Talata Mafara", "Katsina Maradi"] }
  ];
  var stateField = document.getElementById("state");
  var cityField = document.getElementById("city");
  if (stateField && cityField) {
    nigeriaLocations.forEach(function (state) {
      stateField.appendChild(new Option(state.name, state.value || state.name));
    });
    stateField.addEventListener("change", function () {
      var selected = nigeriaLocations.find(function (state) { return (state.value || state.name) === stateField.value; });
      cityField.innerHTML = "<option value=\"\">Select city or town</option>";
      cityField.disabled = !selected;
      if (selected) selected.cities.forEach(function (city) { cityField.appendChild(new Option(city, city)); });
    });
  }

  /* Reveal the schedule choice only when care will be provided at home. */
  var careSetting = document.getElementById("care_setting");
  var careSchedule = document.getElementById("care_schedule_wrap");
  if (careSetting && careSchedule) {
    var toggleCareSchedule = function () {
      var isHome = careSetting.value === "My own Home";
      careSchedule.hidden = !isHome;
      var schedule = careSchedule.querySelector("select");
      if (schedule) schedule.required = isHome;
    };
    careSetting.addEventListener("change", toggleCareSchedule);
    toggleCareSchedule();
  }

  /* Add/remove repeatable employment, education and document fields. */
  document.querySelectorAll("[data-add-repeatable]").forEach(function (button) {
    button.addEventListener("click", function () {
      var list = document.getElementById(button.getAttribute("data-add-repeatable"));
      var first = list && list.querySelector(".repeatable-item");
      if (!first) return;
      var clone = first.cloneNode(true);
      clone.querySelectorAll("input,select,textarea").forEach(function (input) { input.value = ""; input.removeAttribute("id"); });
      clone.querySelectorAll("label").forEach(function (label) { label.removeAttribute("for"); });
      var remove = clone.querySelector(".remove-repeatable");
      if (remove) remove.hidden = false;
      list.appendChild(clone);
    });
  });
  document.querySelectorAll("[data-add-file]").forEach(function (button) {
    button.addEventListener("click", function () {
      var list = document.getElementById(button.getAttribute("data-add-file"));
      var first = list && list.querySelector(".upload-row");
      if (!first) return;
      var clone = first.cloneNode(true);
      var input = clone.querySelector("input");
      if (input) { input.value = ""; input.removeAttribute("id"); input.removeAttribute("required"); }
      clone.querySelectorAll("label").forEach(function (label) { label.removeAttribute("for"); });
      var remove = clone.querySelector(".remove-file");
      if (remove) remove.hidden = false;
      list.appendChild(clone);
    });
  });
  document.addEventListener("click", function (e) {
    var remove = e.target.closest(".remove-repeatable, .remove-file");
    if (remove) {
      var row = remove.closest(".repeatable-item, .upload-row");
      if (row && row.parentElement.querySelectorAll(".repeatable-item, .upload-row").length > 1) row.remove();
    }
  });

  /* AJAX handling for the enrollment and career Formspree forms. */
  document.querySelectorAll("form[data-formspree-form]").forEach(function (applicationForm) {
    var applicationStatus = applicationForm.querySelector(".form-status");
    applicationForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      applicationForm.querySelectorAll("[required]").forEach(function (field) {
        var valid = field.checkValidity();
        var wrapper = field.closest(".field");
        if (wrapper) wrapper.classList.toggle("invalid", !valid);
        if (!valid && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }
      var submit = applicationForm.querySelector("button[type=submit]");
      var defaultSubmitText = submit ? submit.textContent : "Submit application";
      if (submit) { submit.disabled = true; submit.textContent = "Submitting…"; }
      var payload = new FormData(applicationForm);
      var emailField = applicationForm.querySelector("input[type=email]");
      if (emailField && emailField.value) payload.set("_replyto", emailField.value);
      payload.set("_subject", applicationForm.getAttribute("data-subject") || "New EliEmma Health application");
      payload.set("_autoresponse", applicationForm.getAttribute("data-autoresponse") || "Thank you. EliEmma Health has received your submission and will contact you as soon as possible.");
      fetch(applicationForm.getAttribute("action"), { method: "POST", body: payload, headers: { Accept: "application/json" } })
        .then(function (response) { if (!response.ok) throw new Error("Submission failed"); return response; })
        .then(function () {
          applicationForm.reset();
          if (cityField) { cityField.innerHTML = "<option value=\"\">Select city or town</option>"; cityField.disabled = true; }
          if (careSchedule) careSchedule.hidden = true;
          if (applicationStatus) { applicationStatus.className = "form-status success"; applicationStatus.textContent = applicationForm.getAttribute("data-success") || "Your submission has been received successfully. EliEmma Health will contact you as soon as possible."; applicationStatus.setAttribute("tabindex", "-1"); applicationStatus.focus(); }
          if (submit) { submit.disabled = false; submit.textContent = defaultSubmitText; }
        })
        .catch(function () {
          if (applicationStatus) { applicationStatus.className = "form-status warn"; applicationStatus.textContent = "We could not submit your information right now. Please check your connection and try again, or contact EliEmma Health directly."; applicationStatus.setAttribute("tabindex", "-1"); applicationStatus.focus(); }
          if (submit) { submit.disabled = false; submit.textContent = defaultSubmitText; }
        });
    });
    applicationForm.addEventListener("input", function (e) {
      var wrapper = e.target.closest(".field");
      if (wrapper) wrapper.classList.remove("invalid");
    });
  });
})();
