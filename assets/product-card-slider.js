(function () {
  let swiperProductCard;

  const initSlider = (section) => {
    if (!section || !section?.classList.contains("section-product-card-slider"))
      return;
    const swiperProductCardEl = section.querySelector(
      ".product-card-slider__swiper"
    );

    const pagination = section.querySelector(
      ".product-card-slider__pagination"
    );

    const autoplaySettings = swiperProductCardEl.dataset.swiperAutoplay
      ? JSON.parse(swiperProductCardEl.dataset.swiperAutoplay)
      : false;

    if (!swiperProductCardEl) return;

    swiperProductCard = new Swiper(swiperProductCardEl, {
      autoplay:
        autoplaySettings !== 0
          ? {
              pauseOnMouseEnter: true,
              disableOnInteraction: false,
              delay: autoplaySettings,
            }
          : false,
      loop: Boolean(autoplaySettings),
      speed: 1000,
      slidesPerView: 1,
      spaceBetween: 16,
      allowTouchMove: true,
      mousewheel: {
        forceToAxis: true,
      },
      pagination: {
        el: pagination ?? null,
        clickable: true,
      },
    });
  };

  const animateSection = (section) => {
    if (
      !section ||
      !section?.classList.contains("section-product-card-slider") ||
      !section.querySelector(".animate-on-scroll")
    )
      return;

    const animateContainer = (imageContainer) => {
      ScrollTrigger.create({
        trigger: imageContainer,
        start: "50% 90%",
        end: "bottom top",
        onEnter: () => imageContainer.classList.add("animated"),
      });
    };

    const animateHeading = (heading) => {
      ScrollTrigger.create({
        trigger: heading,
        start: "bottom 95%",
        end: "bottom top",
        onEnter: () => heading.classList.add("animated"),
      });
    };

    const cardsLayoutImageContainer = section.querySelector(
      ".product-card-slider__layout[data-layout-type='cards']"
    );

    if (cardsLayoutImageContainer) {
      animateContainer(cardsLayoutImageContainer);
    }

    const overlayLayoutImageContainer = section.querySelector(
      ".product-card-slider__media-solid"
    );

    if (overlayLayoutImageContainer) {
      animateContainer(overlayLayoutImageContainer);
    }

    const heading = section.querySelector(".product-card-slider__heading");

    if (heading) {
      animateHeading(heading);
    }
  };

  document.addEventListener(
    "DOMContentLoaded",
    initSlider(document.currentScript?.parentElement)
  );

  document.addEventListener(
    "DOMContentLoaded",
    animateSection(document.currentScript?.parentElement)
  );

  document.addEventListener("shopify:section:load", function (event) {
    initSlider(event.target);
    animateSection(event.target);
  });
})();
