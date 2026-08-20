if (!customElements.get("countdown-timer")) {
  class Countdown extends HTMLElement {
    constructor() {
      super();
      this.userDate = this.getAttribute("data-date");
      this.userTime = this.getAttribute("data-time");
      this.mockTimer = this.getAttribute("data-mock-timer");

      if (this.mockTimer === "true") {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        const year = d.getFullYear();
        const m = d.getMonth() + 1;
        const month = m < 10 ? "0" + m : m;
        const day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
        const h = d.getHours() < 15 ? d.getHours() + 3 : d.getHours() - 3;
        const hourss = h < 10 ? "0" + h : h;
        const minutess =
          d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
        this.userDate = year + "-" + month + "-" + day;
        this.userTime = hourss + ":" + minutess;
      }

      this.interval;
      this.setInterval(this.userDate, this.userTime);
    }

    onInit(userDate, userTime) {
      this.completedCountdown = this.getAttribute("data-completed");
      this.countdown = this.querySelector(".countdown__main");
      this.countdownHeading = this.querySelector(".countdown__end-info");
      this.daysEl = this.querySelector(".countdown_block_days");
      this.hoursEl = this.querySelector(".countdown_block_hours");
      this.minutesEl = this.querySelector(".countdown_block_minutes");
      this.secondsEl = this.querySelector(".countdown_block_seconds");
      this.section = this.closest(".countdown-section");
      // ----------------------------------------------------------------
      const countdownDate = new Date(`${userDate}T${userTime}`);
      const now = new Date();
      const distance = countdownDate.getTime() - now.getTime();
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      // ----------------------------------------------------------------
      if (distance < 0 && this.completedCountdown === "hide_section") {
        clearInterval(this.interval);
        this.section.style.display = "none";
      } else if (distance < 0 && this.completedCountdown === "show_text") {
        this.countdown.style.display = "none";
        this.countdownHeading.style.display = "flex";
      } else {
        if (String(days).length === 1) this.daysEl.textContent = "0" + days;
        else this.daysEl.textContent = days;

        if (String(hours).length === 1) this.hoursEl.textContent = "0" + hours;
        else this.hoursEl.textContent = hours;

        if (String(minutes).length === 1)
          this.minutesEl.textContent = "0" + minutes;
        else this.minutesEl.textContent = minutes;

        if (String(seconds).length === 1)
          this.secondsEl.textContent = "0" + seconds;
        else this.secondsEl.textContent = seconds;
      }
    }

    setInterval(userDate, userTime) {
      clearInterval(this.interval);
      this.interval = setInterval(
        this.onInit.bind(this, userDate, userTime),
        1000
      );
    }
  }

  customElements.define("countdown-timer", Countdown);
}

(function () {
  const initAnimations = (section) => {
    if (
      !section ||
      !section.classList.contains("countdown-section") ||
      !section.querySelector(".animate-on-scroll")
    )
      return;

    const textAnim = (text) => {
      ScrollTrigger.create({
        trigger: text,
        start: "bottom 95%",
        end: "bottom top",
        onEnter: () => text.classList.add("animated"),
      });
    };

    const imageAnim = (image) => {
      ScrollTrigger.create({
        trigger: image,
        start: "50% 90%",
        end: "bottom top",
        onEnter: () => image.classList.add("animated"),
      });
    };

    const text = section.querySelector(".countdown__heading");

    if (text) {
      textAnim(text);
    }

    const image = section.querySelector(".countdown__image");

    if (image) {
      imageAnim(image);
    }
  };

  initAnimations(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initAnimations(event.target);
  });
})();
