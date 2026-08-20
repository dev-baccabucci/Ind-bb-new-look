(() => {
  const initSlider = (section) => {
    if (!section) return;

    const slider = section.querySelector(".js-slider-logos");
    const sliderWrapper = slider.querySelector(".js-slider-logos-wrapper");
    const logoSlides = section.querySelectorAll(".swiper-slide");
    if (!slider || !sliderWrapper || !logoSlides) return;

    const speed = slider.dataset.duration;
    const gap = slider.dataset.gap;
    const stopAutoplaySlider =
      slider.dataset.stopOnHover === "true" ? true : false;
    const logoSwiper = new Swiper(slider, {
      slidesPerView: "auto",
      spaceBetween: +gap,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
      loop: true,
      speed: +speed,
      shortSwipes: false,
      longSwipes: false,
      allowTouchMove: false,
    });

    if (stopAutoplaySlider) {
      let duration;
      let distanceRatio;
      let startTimer;

      const stopAutoplay = () => {
        if (startTimer) clearTimeout(startTimer);

        logoSwiper.setTranslate(logoSwiper.getTranslate());

        const currentSlideWidth =
          logoSwiper.slides[logoSwiper.activeIndex].offsetWidth;

        distanceRatio = Math.abs(
          (currentSlideWidth * logoSwiper.activeIndex +
            logoSwiper.getTranslate()) /
            currentSlideWidth
        );

        duration = logoSwiper.params.speed * distanceRatio;
        logoSwiper.autoplay.stop();
      };

      const startAutoplay = (delay = duration) => {
        startTimer = setTimeout(() => {
          logoSwiper.autoplay.start();
        }, delay);
      };

      startAutoplay();

      slider.addEventListener("mouseenter", function () {
        stopAutoplay();
      });

      slider.addEventListener("mouseleave", function () {
        const distance =
          logoSwiper.width * logoSwiper.activeIndex + logoSwiper.getTranslate();

        duration = distance !== 0 ? duration : 0;

        logoSwiper.slideTo(logoSwiper.activeIndex, duration);
        startAutoplay();
      });
    }
  };

  initSlider(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (section) {
    initSlider(section.target);
  });
})();
