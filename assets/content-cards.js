(function () {
  const calcOffset = () => {
    const windowWidth = window.innerWidth;
    const windowWidthWithoutScrollbar = document.documentElement.clientWidth;

    if (windowWidth >= 1440) {
      return (windowWidthWithoutScrollbar - 1280) / 2;
    } else return 0;
  };

  const initButtonCursor = (section) => {
    if (
      !section ||
      !section?.classList.contains("section-content-cards") ||
      !section.querySelector(".content-cards-with-custom-cursor")
    ) {
      return;
    }

    let isBtnCursorInit = false;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const easingFactor = 0.175;
    let isAnimating = false;

    const button = section.querySelector(".content-cards-drag-button");
    const slider = section.querySelector(".content-cards__bar");
    const container = section.querySelector(".content-cards-list__wrapper");

    if (!container || !button || !slider) return;

    const animateButton = () => {
      isAnimating = true;

      currentX += (targetX - currentX) * easingFactor;
      currentY += (targetY - currentY) * easingFactor;

      button.style.left = `${currentX}px`;
      button.style.top = `${currentY}px`;

      if (
        Math.abs(targetX - currentX) > 0.1 ||
        Math.abs(targetY - currentY) > 0.1
      ) {
        requestAnimationFrame(() => animateButton());
      } else {
        isAnimating = false;
      }
    };

    const throttle = (callback, delay) => {
      let timerFlag = null;

      return (...args) => {
        if (timerFlag === null) {
          callback(...args);
          timerFlag = setTimeout(() => {
            timerFlag = null;
          }, delay);
        }
      };
    };

    const changeButtonColorScheme = throttle((block) => {
      const colorScheme = block.getAttribute("data-c-card-color-scheme");

      if (!colorScheme) return;

      const classesToRemove = Array.from(button.classList).filter((className) =>
        className.startsWith("color-background-")
      );

      button.classList.remove(...classesToRemove);
      button.classList.add(colorScheme);
    }, 100);

    const handleMouseMove = (e) => {
      if (
        !e.target.closest(".content-card__button") &&
        !e.target.closest(".content-card__content-bottom .description")
      ) {
        slider.classList.add("cursor-active");
      } else {
        slider.classList.remove("cursor-active");
      }

      const buttonRect = button.getBoundingClientRect();

      targetX = e.clientX - buttonRect.width / 2;
      targetY = e.clientY - buttonRect.height / 2;

      if (!isAnimating) {
        animateButton();
      }

      const block = e.target.closest(".content-card__wrapper");

      if (block) {
        changeButtonColorScheme(block);
      }
    };

    const handleMouseEnter = (e) => {
      const buttonRect = button.getBoundingClientRect();

      targetX = currentX = e.clientX - buttonRect.width / 2;
      targetY = currentY = e.clientY - buttonRect.height / 2;

      button.style.left = `${currentX}px`;
      button.style.top = `${currentY}px`;

      slider.classList.add("cursor-active");
    };

    const handlePointerDown = () => {
      button.classList.add("drag-active");
    };

    const handlePointerUp = () => {
      button.classList.remove("drag-active");
    };

    const handleMouseLeave = () => {
      slider.classList.remove("cursor-active");
    };

    if (
      window.innerWidth >= 1200 &&
      window.matchMedia("(pointer:fine)").matches &&
      !isBtnCursorInit
    ) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("pointermove", handleMouseMove);
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
      container.addEventListener("pointerdown", handlePointerDown);
      container.addEventListener("pointerup", handlePointerUp);

      isBtnCursorInit = true;
    }

    window.addEventListener("resize", () => {
      if (
        window.innerWidth >= 1200 &&
        window.matchMedia("(pointer:fine)").matches &&
        !isBtnCursorInit
      ) {
        container.addEventListener("mouseenter", handleMouseEnter);
        container.addEventListener("pointermove", handleMouseMove);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("pointerdown", handlePointerDown);
        container.addEventListener("pointerup", handlePointerUp);

        isBtnCursorInit = true;
      }

      if (
        window.innerWidth < 1200 ||
        !window.matchMedia("(pointer:fine)").matches
      ) {
        if (isBtnCursorInit) {
          container.removeEventListener("mouseenter", handleMouseEnter);
          container.removeEventListener("pointermove", handleMouseMove);
          container.removeEventListener("mousemove", handleMouseMove);
          container.removeEventListener("mouseleave", handleMouseLeave);
          container.removeEventListener("pointerdown", handlePointerDown);
          container.removeEventListener("pointerup", handlePointerUp);

          slider.classList.remove("cursor-active");
          button.classList.remove("drag-active");
          button.style = "";

          isBtnCursorInit = false;
        }
      }
    });
  };

  const initSlider = (section, isScrollbar) => {
    const swiperEl = section.querySelector(".content-cards-swiper");
    if (!swiperEl) return;
    const mobSlidesPerView = swiperEl.classList.contains(
      "content-cards-swiper--visible-overflow"
    )
      ? "auto"
      : 1;
    const slides = swiperEl.querySelectorAll(".content-card");

    const progressBar = section.querySelector(".swiper-scrollbar");
    const navigation = section.querySelector(".content-cards__navigation");
    const pagination = section.querySelector(".content-cards__pagination");

    if (!slides || !slides.length) return;

    slides.forEach((slide) => {
      slide.classList.add("swiper-slide");
    });

    const scrollbarSettings = {
      speed: 1000,
      allowTouchMove: true,
      scrollbar: {
        el: progressBar ?? null,
        draggable: true,
      },
      mousewheel: {
        forceToAxis: true,
      },
      slidesPerView: 1,
      spaceBetween: 0,
      watchSlidesProgress: true,
      slidesOffsetAfter: 0,
      slidesOffsetBefore: 0,
      breakpoints: {
        750: {
          slidesPerView: "auto",
          spaceBetween: 16,
          slidesOffsetAfter: 20,
          slidesOffsetBefore: 20,
        },
        1200: {
          slidesPerView: "auto",
          spaceBetween: 16,
          slidesOffsetAfter: 80,
          slidesOffsetBefore: 80,
        },
        1440: {
          slidesPerView: "auto",
          spaceBetween: 16,
          slidesOffsetAfter: calcOffset(),
          slidesOffsetBefore: calcOffset(),
        },
      },
    };

    const sliderSettings = {
      slidesPerView: mobSlidesPerView,
      spaceBetween: 16,
      speed: 800,
      allowTouchMove: true,
      navigation: {
        nextEl: navigation
          ? navigation.querySelector(".swiper-button-next")
          : null,
        prevEl: navigation
          ? navigation.querySelector(".swiper-button-prev")
          : null,
        disabledClass: "swiper-button-disabled",
      },
      pagination: pagination
        ? {
            el: pagination,
            type: "bullets",
            clickable: true,
          }
        : false,
      breakpoints: {
        750: {
          spaceBetween: 16,
        },
      },
    };

    new Swiper(swiperEl, isScrollbar ? scrollbarSettings : sliderSettings);
  };

  const destroySlider = (section) => {
    const swiperEl = section.querySelector(".content-cards-swiper");

    if (!swiperEl?.swiper) return;

    swiperEl.swiper.destroy();

    swiperEl.querySelectorAll(".content-card").forEach((slide) => {
      slide.removeAttribute("style");
      slide.classList.remove("swiper-slide");
    });
  };

  const initContentCards = (section) => {
    if (!section || !section?.classList.contains("section-content-cards")) {
      return;
    }

    const sliderContainer = section.querySelector(".content-cards");

    if (!sliderContainer) return;

    const cardsLayout = sliderContainer.dataset.layout;

    if (cardsLayout !== "bar" && cardsLayout !== "slider") return;

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        let isScrollbar = false;

        if (entry.contentRect.width >= 750 && cardsLayout === "bar") {
          isScrollbar = true;
        }

        destroySlider(section);
        initSlider(section, isScrollbar);
      });
    });

    resizeObserver.observe(section);
  };

  initContentCards(document.currentScript.parentElement);
  initButtonCursor(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initContentCards(event.target);
    initButtonCursor(event.target);
  });
})();
