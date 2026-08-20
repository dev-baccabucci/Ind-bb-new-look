(function () {
  let scrollbarSettings = {
    slidesPerView: 2,
    spaceBetween: 16,
    speed: 400,
    allowTouchMove: true,
    mousewheel: {
      forceToAxis: true,
    },
    watchSlidesProgress: true,
    breakpoints: {
      990: {
        slidesPerView: 3,
      },
      1440: {
        slidesPerView: 4,
      },
    },
  };

  let sliderSettings = {
    slidesPerView: 1,
    spaceBetween: 16,
    speed: 500,
    allowTouchMove: true,
  };

  const initSliders = (section, settings) => {
    const swiperEls = section.querySelectorAll(".products-tabs__layout");

    swiperEls.forEach((swiperEl) => {
      const swiperWrapper = swiperEl.querySelector(".products-tabs__list");
      const slides = swiperEl.querySelectorAll(".products-tabs__item");

      if (!swiperWrapper || !slides || !slides.length) return;

      const mobSlidesPreView = swiperEl.classList.contains(
        "products-tabs__layout--visible-overflow"
      )
        ? "auto"
        : 1;

      swiperEl.classList.add("swiper");
      swiperWrapper.classList.add("swiper-wrapper");
      slides.forEach((slide, index) => {
        slide.classList.add("swiper-slide");
        let coeff = slides.length > 12 ? 0.05 : 0.1;

        if (slides.length > 24) {
          coeff = 0.02;
        }

        const delay = index * coeff;
        slide.style.setProperty("--prod-tabs-item-delay", `${delay}s`);
      });

      const progressBar = swiperEl.querySelector(".swiper-scrollbar");
      const nextBtn = swiperEl.querySelector(
        ".products-tabs__navigation-button-next"
      );
      const prevBtn = swiperEl.querySelector(
        ".products-tabs__navigation-button-prev"
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

      new Swiper(
        swiperEl,
        settings === "bar" ? scrollbarSettings : sliderSettings
      );
    });
  };

  const destroySliders = (section) => {
    const swiperEls = section.querySelectorAll(".products-tabs__layout");

    swiperEls.forEach((swiperEl) => {
      const swiperWrapper = section.querySelector(".products-tabs__list");
      const slides = section.querySelectorAll(".products-tabs__item");

      if (!swiperEl?.swiper || !slides.length || !swiperWrapper) return;

      swiperEl.swiper.destroy();

      swiperEl.classList.remove("swiper");
      swiperWrapper.classList.remove("swiper-wrapper");
      slides.forEach((slide) => slide.classList.remove("swiper-slide"));
    });
  };

  const toggleTab = (section) => {
    const tabsEls = section.querySelectorAll(".products-tabs__tab");
    const productsEls = section.querySelectorAll(".products-tabs__layout");

    const onToggleTab = (event, tab) => {
      event.preventDefault();
      if (tab.classList.contains("active")) return;
      const tabId = tab.dataset.productsTabId;

      tabsEls.forEach((el) => {
        el.classList.remove("active");
      });

      productsEls.forEach((el) => {
        el.classList.remove("active");

        if (el.swiper) {
          el.swiper.slideTo(0, 0);
        }
      });

      const productsActiveEl = section.querySelector(
        `.products-tabs__layout[data-products-tab-id="${tabId}"]`
      );
      tab.classList.add("active");
      productsActiveEl.classList.add("active");
    };

    tabsEls.forEach((tab) => {
      tab.addEventListener("click", (event) => onToggleTab(event, tab));

      tab.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          onToggleTab(event, tab);
        }
      });
    });
  };

  const initProductsTabs = (section) => {
    if (!section || !section?.classList.contains("products-tabs-section")) {
      return;
    }

    const sliderContainer = section.querySelector(".products-tabs");
    const cardsLayout = sliderContainer.dataset.layout || "grid";
    const cardsMobileLayout = sliderContainer.dataset.layoutMobile || "column";

    let currentLayout = null;

    const sectionResizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        let newLayout;

        if (entry.contentRect.width < 576) {
          newLayout = cardsMobileLayout === "slider" ? "slider" : "column";
        } else {
          newLayout = cardsLayout === "bar" ? "bar" : "grid";
        }

        if (newLayout !== currentLayout) {
          currentLayout = newLayout;

          destroySliders(section);

          if (newLayout === "slider" || newLayout === "bar") {
            initSliders(section, newLayout);
          }
        }
      });
    });

    sectionResizeObserver.observe(section);

    toggleTab(section);
  };

  const animateProductCards = (section) => {
    if (
      !section ||
      !section?.classList.contains("products-tabs-section") ||
      !section.querySelector(".animate-on-scroll")
    ) {
      return;
    }

    const productsTabsInner = section.querySelector(".products-tabs__inner");

    if (!productsTabsInner) return;

    ScrollTrigger.create({
      trigger: productsTabsInner,
      start: "20% bottom",
      end: "bottom top",
      onEnter: () => productsTabsInner.classList.add("animated"),
    });
  };

  initProductsTabs(document.currentScript.parentElement);

  animateProductCards(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initProductsTabs(event.target);
    animateProductCards(event.target);
  });
})();
