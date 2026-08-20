(function () {
  let swiperPopularProducts,
    scrollbarSettings = {
      slidesPerView: 2,
      spaceBetween: 16,
      mousewheel: {
        forceToAxis: true,
      },
      speed: 400,
      allowTouchMove: true,
      breakpoints: {
        990: {
          slidesPerView: 3,
        },
        1440: {
          slidesPerView: 4,
        },
      },
    },
    sliderSettings = {
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 800,
      allowTouchMove: true,
    };

  const initSlider = (section, settings) => {
    if (!section || !section?.classList.contains("popular-products-section"))
      return;

    const sliderContainer = section.querySelector(".popular-products");
    if (!sliderContainer) return;

    const swiperEl = section.querySelector(".popular-products__layout");
    const swiperWrapper = section.querySelector(".popular-products__list");
    const slides = section.querySelectorAll(".popular-products__item");
    const freemode = JSON.parse(sliderContainer.dataset.freeMode.toLowerCase());

    if (!swiperEl || !swiperWrapper || !slides || !slides.length) return;

    const mobSlidesPreView = swiperEl.classList.contains(
      "popular-products__layout--visible-overflow"
    )
      ? "auto"
      : 1;
    swiperEl.classList.add("swiper");
    swiperWrapper.classList.add("swiper-wrapper");

    slides.forEach((slide) => slide.classList.add("swiper-slide"));

    const progressBar = section.querySelector(".swiper-scrollbar");
    const nextBtn = section.querySelector(
      ".popular-products__navigation-button-next"
    );
    const prevBtn = section.querySelector(
      ".popular-products__navigation-button-prev"
    );

    scrollbarSettings = {
      ...scrollbarSettings,
      scrollbar: {
        el: progressBar,
        grabCursor: true,
        draggable: true,
        hide: false,
      },
    };

    sliderSettings = {
      ...sliderSettings,
      freeMode: freemode,
      slidesPerView: mobSlidesPreView,
      navigation:
        nextBtn && prevBtn
          ? {
              nextEl: nextBtn,
              prevEl: prevBtn,
              disabledClass: "swiper-button-disabled",
            }
          : false,
    };

    swiperPopularProducts = new Swiper(
      swiperEl,
      settings === "bar" ? scrollbarSettings : sliderSettings
    );
  };

  const destroySlider = (section) => {
    if (!swiperPopularProducts || !section) return;

    const slides = section.querySelectorAll(".popular-products__item");
    const swiperEl = section.querySelector(".popular-products__layout");
    const swiperWrapper = section.querySelector(".popular-products__list");

    if (!swiperEl || !slides || !slides.length || !swiperWrapper) return;

    swiperPopularProducts.destroy(true, true);
    swiperPopularProducts = null;

    swiperEl.classList.remove("swiper");
    swiperWrapper.classList.remove("swiper-wrapper");
    slides.forEach((slide) => slide.classList.remove("swiper-slide"));
  };

  const initPopularProducts = (section) => {
    if (!section || !section?.classList.contains("popular-products-section"))
      return;

    const sliderContainer = section.querySelector(".popular-products");
    const cardsLayout = sliderContainer.dataset.layout || "grid";
    const cardsMobileLayout = sliderContainer.dataset.layoutMobile || "column";

    let currentLayout = null;

    const sectionResizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries;
      let newLayout;

      if (entry.contentRect.width < 576) {
        newLayout = cardsMobileLayout === "slider" ? "slider" : "column";
      } else {
        newLayout = cardsLayout === "bar" ? "bar" : "grid";
      }

      if (newLayout !== currentLayout) {
        currentLayout = newLayout;

        if (swiperPopularProducts) {
          destroySlider(section);
        }

        if (newLayout === "slider" || newLayout === "bar") {
          initSlider(section, newLayout);
        }
      }
    });

    sectionResizeObserver.observe(section);
  };

  const animateProductCards = (section) => {
    if (
      !section ||
      !section?.classList.contains("popular-products-section") ||
      !section.querySelector(".animate-on-scroll")
    ) {
      return;
    }

    const popularProductsLayout = section.querySelector(
      ".popular-products__layout"
    );

    if (!popularProductsLayout) return;

    ScrollTrigger.create({
      trigger: popularProductsLayout,
      start: "20% bottom",
      end: "bottom top",
      onEnter: () => popularProductsLayout.classList.add("animated"),
    });
  };

  initPopularProducts(document.currentScript.parentElement);
  animateProductCards(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initPopularProducts(event.target);
    animateProductCards(event.target);
  });
})();
