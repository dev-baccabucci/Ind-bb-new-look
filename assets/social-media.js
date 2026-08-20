(function () {
  const initAnimation = (section) => {
    if (
      !section ||
      !section.classList.contains("social-media-section") ||
      !section.querySelector(".animate-on-scroll")
    )
      return;

    const text = section.querySelector(".social-media-content__main-text");

    if (!text) return;

    ScrollTrigger.create({
      trigger: text,
      start: "50% 95%",
      end: "bottom top",
      onEnter: () => text.classList.add("animated"),
    });
  };

  const initSlider = (section) => {
    if (!section || !section?.classList.contains("social-media-section"))
      return;

    const slider = section.querySelector(".social-media-slider");

    if (!slider) return;

    const speed = +slider.dataset.speed * 1000;
    const slidesPerView = slider.dataset.slidesPerView;
    const stopAutoplaySlider =
      slider.dataset.stopOnHover === "true" ? true : false;

    const multicolumnSwiper = new Swiper(slider, {
      loop: true,
      allowTouchMove: false,
      spaceBetween: 8,
      speed: speed,
      slidesPerView: +slidesPerView,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
    });

    if (stopAutoplaySlider) {
      let duration;
      let distanceRatio;
      let startTimer;

      const stopAutoplay = () => {
        if (startTimer) clearTimeout(startTimer);

        multicolumnSwiper.setTranslate(multicolumnSwiper.getTranslate());

        const currentSlideWidth =
          multicolumnSwiper.slides[multicolumnSwiper.activeIndex].offsetWidth;
        distanceRatio = Math.abs(
          (currentSlideWidth * multicolumnSwiper.activeIndex +
            multicolumnSwiper.getTranslate()) /
            currentSlideWidth
        );

        duration = multicolumnSwiper.params.speed * distanceRatio;
        multicolumnSwiper.autoplay.stop();
      };

      const startAutoplay = (delay = duration) => {
        startTimer = setTimeout(() => {
          multicolumnSwiper.autoplay.start();
        }, delay);
      };

      startAutoplay();

      slider.addEventListener("mouseenter", function () {
        stopAutoplay();
      });

      slider.addEventListener("mouseleave", function () {
        const distance =
          multicolumnSwiper.width * multicolumnSwiper.activeIndex +
          multicolumnSwiper.getTranslate();

        duration = distance !== 0 ? duration : 0;
        multicolumnSwiper.slideTo(multicolumnSwiper.activeIndex, duration);
        startAutoplay();
      });
    }
  };

  const addRichTextLinksArrows = (section) => {
    if (!section || !section?.classList.contains("social-media-section"))
      return;

    const richTextLinks = section.querySelectorAll(
      `.social-media-content__main-text a`
    );

    if (!richTextLinks.length) {
      return;
    }

    const richTextArrow =
      '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 28.4848L28.4821 4M28.4821 4H6.49748M28.4821 4V25.9846" stroke="#7B7F84" stroke-width="2" stroke-linecap="square"/></svg>';

    richTextLinks.forEach((link) => {
      if (link.querySelector(".social-media-content__main-text-arrows")) {
        return;
      }

      const richTextLinkText = link.textContent;
      link.dataset.label = richTextLinkText;

      const arrowWrapper = document.createElement("span");
      arrowWrapper.classList.add("social-media-content__main-text-arrows");
      arrowWrapper.innerHTML =
        '<span class="social-media-content__main-text-arrows-wrapper">' +
        richTextArrow +
        richTextArrow +
        "</span>";
      link.appendChild(arrowWrapper);
    });
  };

  addRichTextLinksArrows(document.currentScript.parentElement);
  initSlider(document.currentScript.parentElement);
  initAnimation(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    addRichTextLinksArrows(event.target);
    initSlider(event.target);
    initAnimation(event.target);
  });
})();
