(function () {
  const animateOnScroll = (section) => {
    if (
      !section ||
      !section?.classList.contains("collections-list-section") ||
      !section.querySelector(".animate-on-scroll")
    )
      return;

    const animateTitles = () => {
      const titles = section.querySelector(".collections-list-titles");

      if (!titles) return;

      ScrollTrigger.create({
        trigger: titles,
        start: "top 80%",
        end: "bottom top",
        onEnter: () => {
          titles.classList.add("animated");
        },
      });
    };

    const animateImages = () => {
      const images = section.querySelectorAll(".collections-list-image");

      if (!images.length) return;

      images.forEach((image) => {
        ScrollTrigger.create({
          trigger: image,
          start: "50% 90%",
          end: "bottom top",
          onEnter: () => {
            image.classList.add("animated");
          },
        });
      });
    };

    animateImages();
    animateTitles();
  };

  const hoverToggle = (section) => {
    const titles = section.querySelectorAll(".collections-list-titles-item");
    const images = section.querySelectorAll(".collections-list-image-wrapper");

    if (!titles.length || !images.length) return;

    const toggleActive = (title) => {
      for (const el of titles) el.classList.remove("active");
      for (const el of images) el.classList.remove("active");

      title.classList.add("active");

      const index = +title.dataset.collectionsListIndex;

      if (isNaN(index) || index < 0 || index >= images.length) return;

      images.forEach((image) => {
        const imageIndex = +image.dataset.collectionsListIndex;

        if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= images.length)
          return;

        if (imageIndex === index) image.classList.add("active");
      });
    };

    for (const title of titles) {
      const handleMouseOver = () => toggleActive(title);
      let isInit = false;

      if (window.innerWidth >= 750) {
        title.addEventListener("mouseover", handleMouseOver);
        isInit = true;
      } else {
        title.removeEventListener("mouseover", handleMouseOver);
        isInit = false;
      }

      window.addEventListener("resize", () => {
        if (window.innerWidth >= 750 && !isInit) {
          title.addEventListener("mouseover", handleMouseOver);
          isInit = true;
        } else if (window.innerWidth < 750 && isInit) {
          title.removeEventListener("mouseover", handleMouseOver);
          isInit = false;
        }
      });
    }
  };

  hoverToggle(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (e) {
    hoverToggle(e.target);
  });

  (function () {
    let imagesSlider;
    let titlesSlider;

    const initSliders = (section) => {
      const initImagesSlider = () => {
        const imagesSliderEl = section.querySelector(
          ".collections-list-images-container--1"
        );

        if (!imagesSliderEl) return;

        const imagesSliderElWrapper = imagesSliderEl.querySelector(
          ".collections-list-images"
        );
        const imagesSliderElSlides = imagesSliderEl.querySelectorAll(
          ".collections-list-image-wrapper"
        );

        imagesSliderEl.classList.add("swiper");
        imagesSliderElWrapper.classList.add("swiper-wrapper");

        imagesSliderElSlides.forEach((slide) => {
          slide.classList.add("swiper-slide");
        });

        const spaceBetween = imagesSliderEl.classList.contains(
          "collections-list-images-container--visible-overflow"
        )
          ? 16
          : 20;

        const slidesPerView = imagesSliderEl.classList.contains(
          "collections-list-images-container--visible-overflow"
        )
          ? "auto"
          : 1;

        imagesSlider = new Swiper(imagesSliderEl, {
          loop: false,
          autoplay: false,
          slidesPerView: slidesPerView,
          allowTouchMove: true,
          spaceBetween: spaceBetween,
          speed: 1000,
        });
      };

      const initTitlesSlider = () => {
        const titlesSliderEl = section.querySelector(
          ".collections-list-titles-container"
        );
        const titlesSliderElWrapper = titlesSliderEl.querySelector(
          ".collections-list-titles"
        );
        const titlesSliderElSlides = titlesSliderEl.querySelectorAll(
          ".collections-list-titles-item"
        );

        if (!titlesSliderEl || !titlesSliderElWrapper || !titlesSliderElSlides)
          return;

        titlesSliderEl.classList.add("swiper");
        titlesSliderElWrapper.classList.add("swiper-wrapper");

        titlesSliderElSlides.forEach((slide) => {
          slide.classList.add("swiper-slide");
        });

        const nextBtnEl = section.querySelector(
          ".collections-list-button--next"
        );
        const prevBtnEl = section.querySelector(
          ".collections-list-button--prev"
        );

        const spaceBetween = titlesSliderEl.classList.contains(
          "collections-list-titles-container--visible-overflow"
        )
          ? 16
          : 20;

        const slidesPerView = titlesSliderEl.classList.contains(
          "collections-list-titles-container--visible-overflow"
        )
          ? "auto"
          : 1;

        titlesSlider = new Swiper(titlesSliderEl, {
          loop: false,
          autoplay: false,
          slidesPerView: slidesPerView,
          spaceBetween: spaceBetween,
          speed: 1000,
          allowTouchMove: true,
          controller: {
            control: imagesSlider,
          },
          navigation: {
            nextEl: nextBtnEl,
            prevEl: prevBtnEl,
            disabledClass: "collections-list-button--disabled",
          },
        });
      };

      initImagesSlider();
      initTitlesSlider();

      if (titlesSlider && imagesSlider) {
        titlesSlider.controller.control = imagesSlider;
        imagesSlider.controller.control = titlesSlider;
      }
    };

    const destroySliders = (section) => {
      titlesSlider.destroy(true, true);
      titlesSlider = null;

      imagesSlider.destroy(true, true);
      imagesSlider = null;

      const swipers = section.querySelectorAll(".swiper");
      const swiperWrappers = section.querySelectorAll(".swiper-wrapper");
      const slides = section.querySelectorAll(".swiper-slide");

      swipers.forEach((el) => {
        el.classList.remove("swiper");
        el.removeAttribute("style");
      });

      swiperWrappers.forEach((el) => {
        el.classList.remove("swiper-wrapper");
        el.removeAttribute("style");
      });

      slides.forEach((el) => {
        el.classList.remove("swiper-slide");
        el.removeAttribute("style");
      });
    };

    const initButtons = (section) => {
      if (!section || !section?.classList.contains("testimonials-section"))
        return;

      const prevButton = section.querySelector(
        ".testimonials-slider-button--prev"
      );
      const nextButton = section.querySelector(
        ".testimonials-slider-button--next"
      );

      if (!prevButton || !nextButton) return;

      let isBtnsInit = false;

      if (
        window.innerWidth < 1200 ||
        !window.matchMedia("(pointer:fine)").matches
      ) {
        prevButton.addEventListener("click", () => {
          mainSlider.slidePrev();
        });

        nextButton.addEventListener("click", () => {
          mainSlider.slideNext();
        });

        isBtnsInit = true;
      }

      window.addEventListener("resize", () => {
        if (
          window.innerWidth < 1200 ||
          !window.matchMedia("(pointer:fine)").matches
        ) {
          if (!isBtnsInit) {
            prevButton.addEventListener("click", () => {
              mainSlider.slidePrev();
            });

            nextButton.addEventListener("click", () => {
              mainSlider.slideNext();
            });

            isBtnsInit = true;
          }
        } else {
          if (isBtnsInit) {
            prevButton.removeEventListener("click", () => {
              mainSlider.slidePrev();
            });

            nextButton.removeEventListener("click", () => {
              mainSlider.slideNext();
            });

            isBtnsInit = false;
          }
        }
      });
    };

    const initCollectionsListSliders = (section) => {
      if (!section || !section?.classList.contains("collections-list-section"))
        return;

      if (window.innerWidth < 750) {
        initSliders(section);
      } else if (imagesSlider || titlesSlider) {
        destroySliders(section);
      }

      let lastWidth = section.getBoundingClientRect().width;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const currentWidth = entry.contentRect.width;
          if (currentWidth !== lastWidth) {
            lastWidth = currentWidth;
            if (currentWidth < 750) {
              initSliders(section);
            } else if (imagesSlider || titlesSlider) {
              destroySliders(section);
            }
          }
        }
      });

      resizeObserver.observe(section);
    };

    initCollectionsListSliders(document.currentScript.parentElement);
    initButtons(document.currentScript.parentElement);
    animateOnScroll(document.currentScript.parentElement);

    document.addEventListener("shopify:section:load", function (event) {
      initCollectionsListSliders(event.target);
      initButtons(event.target);
      animateOnScroll(event.target);
    });
  })();
})();
