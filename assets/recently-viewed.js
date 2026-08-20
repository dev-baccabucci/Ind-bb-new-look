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
    const sliderContainer = section.querySelector(".recently-viewed");
    if (!sliderContainer) return;

    const swiperEl = section.querySelector(".popular-products__layout");
    const swiperWrapper = section.querySelector(".popular-products__list");
    const slides = section.querySelectorAll(".popular-products__item");

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
    if (!section.querySelector(".animate-on-scroll")) {
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

  const initSection = async (section) => {
    if (!section || !section?.classList.contains("recently-viewed-section")) {
      return;
    }

    const box = section.querySelector(".recently-viewed");
    if (!box) return;

    const STORAGE_KEY = "__sf_theme_recently";
    const EXPIRATION_DAYS = box.dataset.expirationDays
      ? Number(box.dataset.expirationDays)
      : 30;
    const dateNow = Date.now();

    const baseUrl = box.dataset.baseUrl;
    const productsLimit = Number(box.dataset.productsLimit) || 6;
    const currentPageProductId = box.dataset.currentPageProductId;

    // get recent products from local storage
    let recentProducts = [];
    try {
      recentProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      console.error(`Incorrect value in local storage for "${STORAGE_KEY}"`);
    }

    if (currentPageProductId) {
      recentProducts = recentProducts.filter(
        (item) => item.productId !== currentPageProductId
      );
    }

    if (recentProducts.length === 0) {
      box.classList.remove("recently-viewed--loading");
      box.classList.add("recently-viewed--empty");
      return;
    }

    // filter by expiration time
    const expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
    const validProducts = recentProducts.filter(
      (item) => dateNow - item.timestamp < expirationTime
    );

    // limit by section setting
    const limitedProducts = validProducts.slice(0, productsLimit);

    // get url with query
    const query = limitedProducts
      .filter((item) => item.productId)
      .map((item) => `id:${item.productId}`)
      .join("%20OR%20");
    const url = `${baseUrl}&q=${query}`;

    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const sourceBox = doc?.querySelector(".recently-viewed");
      if (!sourceBox?.classList.contains("recently-viewed--search-perfomed")) {
        box.classList.add("recently-viewed--empty");
        return;
      }
      box.innerHTML = sourceBox.innerHTML;

      initPopularProducts(section);
      animateProductCards(section);
      try {
        colorSwatches();
      } catch (err) {}
      initButtonsAnimation(section);
    } catch (error) {
      console.error("Failed to fetch recently viewed products:", error);
      box.classList.add("recently-viewed--empty");
    } finally {
      box.classList.remove("recently-viewed--loading");
    }
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSection(event.target);
  });
})();
