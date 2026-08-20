(() => {
  const initCursor = (section) => {
    if (!section || !section?.classList.contains("image-gallery-section")) {
      return;
    }

    const box = section.querySelector(".image-gallery__wrapper");
    const cursorEl = section.querySelector(".image-gallery__cursor");
    const sliderEl = box.querySelector(".image-gallery__slider");

    if (!box || !cursorEl) return;

    const slidesCounts = Number(box.getAttribute("data-slides-count"));
    if (slidesCounts <= 1) return;

    const handleMouseMove = (event) => {
      cursorEl.classList.add("active");
      cursorEl.classList.remove("disabled");

      const sectionRect = box.getBoundingClientRect();
      const sectionWidth = sectionRect.width;
      const sectionCenterX = sectionRect.left + sectionWidth / 2;

      if (!sliderEl?.swiper) return;
      const slider = sliderEl.swiper;

      const x = event.clientX - sectionRect.left - 18;
      const y = event.clientY - sectionRect.top - 18;

      if (event.clientX < sectionCenterX) {
        cursorEl.classList.add("prev");
        cursorEl.classList.remove("next");

        if (box.getAttribute("data-loop") !== "true" && slider.isBeginning) {
          cursorEl.classList.add("disabled");
        }
      } else {
        cursorEl.classList.remove("prev");
        cursorEl.classList.add("next");

        if (box.getAttribute("data-loop") !== "true" && slider.isEnd) {
          cursorEl.classList.add("disabled");
        }
      }

      cursorEl.style.left = `${x}px`;
      cursorEl.style.top = `${y}px`;
    };

    const handleMouseLeave = () => {
      cursorEl.classList.remove("active");
      cursorEl.classList.remove("disabled");
    };

    const handleClick = (event) => {
      if (event.target.classList.contains("swiper-pagination")) return;
      const sectionRect = box.getBoundingClientRect();
      const sectionWidth = sectionRect.width;
      const sectionCenterX = sectionRect.left + sectionWidth / 2;

      const sliderEl = box.querySelector(".image-gallery__slider");
      if (!sliderEl?.swiper) return;
      const slider = sliderEl.swiper;

      const hasNextSlide =
        box.getAttribute("data-loop") === "true" ? true : !slider.isEnd;
      const hasPrevSlide =
        box.getAttribute("data-loop") === "true" ? true : !slider.isBeginning;

      if (event.clientX < sectionCenterX && hasPrevSlide) {
        slider.slidePrev();
      } else if (event.clientX >= sectionCenterX && hasNextSlide) {
        slider.slideNext();
      }
    };

    let isCursorInit = false;

    if (
      window.innerWidth >= 990 &&
      window.matchMedia("(pointer:fine)").matches
    ) {
      sliderEl.addEventListener("mousemove", handleMouseMove);
      sliderEl.addEventListener("mouseleave", handleMouseLeave);
      sliderEl.addEventListener("click", handleClick);

      isCursorInit = true;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width >= 990) {
          if (!isCursorInit) {
            sliderEl.addEventListener("mousemove", handleMouseMove);
            sliderEl.addEventListener("mouseleave", handleMouseLeave);
            sliderEl.addEventListener("click", handleClick);

            isCursorInit = true;
          }
        } else {
          if (isCursorInit) {
            sliderEl.removeEventListener("mousemove", handleMouseMove);
            sliderEl.removeEventListener("mouseleave", handleMouseLeave);
            sliderEl.removeEventListener("click", handleClick);

            isCursorInit = false;
          }
        }
      });
    });

    resizeObserver.observe(section);
  };

  const initSlider = (section) => {
    if (!section || !section?.classList.contains("image-gallery-section")) {
      return;
    }

    const box = section.querySelector(".image-gallery__wrapper");
    const sliderEl = box.querySelector(".image-gallery__slider");

    if (!box || !sliderEl) return;

    const slidesCounts = Number(box.getAttribute("data-slides-count"));
    if (slidesCounts <= 1) return;

    const swiperParams = {
      speed: 1000,
      centeredSlides: true,
      slidesPerView: "auto",
      allowTouchMove: true,
      mousewheel: {
        forceToAxis: true,
      },
      spaceBetween: 8,
      breakpoints: {
        990: {
          spaceBetween: 16,
          grabCursor:
            box.getAttribute("data-navigation") === "true" ? false : true,
          allowTouchMove:
            box.getAttribute("data-navigation") === "true" ? false : true,
        },
      },
    };

    if (box.getAttribute("data-autoplay") === "true") {
      swiperParams.autoplay = {
        disableOnInteraction: true,
      };
    }

    if (box.getAttribute("data-loop") === "true") {
      swiperParams.loop = true;
      swiperParams.loopPreventsSliding = false;
    }

    if (box.getAttribute("data-pagination") === "true") {
      const paginationEl = box.querySelector(".swiper-pagination");
      if (paginationEl) {
        swiperParams.pagination = {
          el: paginationEl,
          type: "bullets",
          clickable: true,
        };
      }
    }

    new Swiper(sliderEl, swiperParams);
  };

  initSlider(document.currentScript.parentElement);
  initCursor(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSlider(event.target);
    initCursor(event.target);
  });
})();
