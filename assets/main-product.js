(function () {
  const initProductAccordion = () => {
    const toggles = document.querySelectorAll(".about__accordion-toggle");

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        const description = toggle.nextElementSibling?.classList.contains(
          "about__accordion-description"
        )
          ? toggle.nextElementSibling
          : toggle.previousElementSibling?.classList.contains(
              "about__accordion-description"
            )
          ? toggle.previousElementSibling
          : null;

        if (description) {
          if (!toggle.classList.contains("active")) {
            slideDown(toggle, description, 300); // func in global.js
          } else {
            slideUp(toggle, description, 300); // func in global.js
          }
        }
      });
    });
  };

  let countdownInterval;

  const initProductCountdown = () => {
    const countDownWrapper = document.querySelector(".product-countdown");
    if (!countDownWrapper) return;

    const userDate = countDownWrapper.getAttribute("data-date");
    const userTime = countDownWrapper.getAttribute("data-time");

    if (!userDate || !userTime) return;

    removeProductCountdown();

    countdownInterval = setInterval(
      () => updateTimer(countDownWrapper, userDate, userTime),
      1000
    );

    updateTimer(countDownWrapper, userDate, userTime);
  };

  const removeProductCountdown = () => {
    clearInterval(countdownInterval);
  };

  const updateTimer = (wrapper, userDate, userTime) => {
    const completedCountdown = wrapper.getAttribute("data-completed");
    const countdown = wrapper.querySelector(".product-countdown__main");
    const countdownHeading =
      wrapper.querySelector(".product-countdown__end-info") || null;
    const countdownPromo =
      wrapper.querySelector(".product-countdown__promo") || null;

    const countdownDate = new Date(`${userDate}T${userTime}`);
    const now = new Date();
    const distance = countdownDate - now;

    if (distance < 0) {
      removeProductCountdown();
      handleCountdownEnd(
        wrapper,
        countdown,
        countdownHeading,
        completedCountdown,
        countdownPromo
      );
    } else {
      displayTime(wrapper, distance);
    }
  };

  const handleCountdownEnd = (
    wrapper,
    countdown,
    countdownHeading,
    completedCountdown,
    countdownPromo
  ) => {
    if (completedCountdown === "hide_section") {
      wrapper.style.display = "none";
    } else if (completedCountdown === "show_text") {
      countdown.style.display = "none";
      if (countdownPromo) countdownPromo.style.display = "none";
      if (countdownHeading) countdownHeading.style.display = "flex";
    }
  };

  const displayTime = (wrapper, distance) => {
    const daysEl = wrapper.querySelector(".product-countdown_block_days");
    const hoursEl = wrapper.querySelector(".product-countdown_block_hours");
    const minutesEl = wrapper.querySelector(".product-countdown_block_minutes");
    const secondsEl = wrapper.querySelector(".product-countdown_block_seconds");

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = formatTime(days);
    hoursEl.textContent = formatTime(hours);
    minutesEl.textContent = formatTime(minutes);
    secondsEl.textContent = formatTime(seconds);
  };

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  const revealPopup = (section) => {
    if (!section || !section.classList.contains("product-section")) return;
    const buyButtons = section.querySelector(
      ".product__buy-buttons > product-form"
    );
    const stickyBar = document.querySelector(".product-countdown");
    const footerBottom = document.querySelector(
      ".shopify-section-group-footer-group .footer-bottom"
    );

    if (!stickyBar) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.01,
    };

    const isElementBelowScroll = (element) => {
      return element ? element.getBoundingClientRect().top > 0 : false;
    };

    const toggleStickyBar = (isVisible) => {
      if (isVisible || isElementBelowScroll(buyButtons)) {
        stickyBar.classList.remove("active");
        removeProductCountdown();
      } else {
        stickyBar.classList.add("active");
        initProductCountdown();
      }
    };

    const handleIntersect = (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      toggleStickyBar(isVisible);
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    if (buyButtons) observer.observe(buyButtons);
    if (footerBottom) observer.observe(footerBottom);
  };

  document.addEventListener("shopify:section:load", (event) => {
    initProductAccordion();
    revealPopup(event.target);
  });

  initProductAccordion();
  revealPopup(document.currentScript.parentElement);
})();
