(() => {
  const playVideo = (slider) => {
    if (!slider.swiper) return;

    const swiper = slider.swiper;

    swiper.slides.forEach((slide) => {
      const video = slide.querySelector(".slideshow__video video");
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    const activeSlide = swiper.slides[swiper.activeIndex];
    if (activeSlide) {
      const videoActive = activeSlide.querySelector(".slideshow__video video");
      if (videoActive) {
        videoActive.play().catch(() => {});
      }
    }
  };

  const stopVideo = (slider) => {
    if (!slider.swiper) return;

    const swiper = slider.swiper;

    const activeSlide = swiper.slides[swiper.activeIndex];
    if (activeSlide) {
      const videoActive = activeSlide.querySelector(".slideshow__video video");
      if (videoActive) {
        videoActive.pause();
      }
    }
  };

  const initSlider = (section) => {
    if (!section || !section.classList.contains("section-slideshow")) return;

    const box = section.querySelector(".slideshow");

    if (box) {
      const swiperParams = {
        speed: 800,
        autoHeight: false,
        allowTouchMove: true,
        watchSlidesProgress: true,
        preventInteractionOnTransition: true,
        mousewheel: {
          forceToAxis: true,
        },
      };

      const changeColorScheme = (swiper) => {
        const activeIndex = swiper.activeIndex;
        const activeSlide = swiper.slides[activeIndex];
        const colorScheme = activeSlide.dataset.colorScheme;
        const exploreBtn = box.querySelector(".slideshow__explore-btn");

        const changeItems = [
          swiper.navigation?.nextEl,
          swiper.navigation?.prevEl,
          swiper.pagination?.el,
          ...(exploreBtn ? [exploreBtn] : []),
        ].filter(Boolean);

        changeItems.forEach((item) => {
          let classNames = item.getAttribute("class") || "";
          classNames = classNames.replace(/color-background-\d+/g, "");
          item.setAttribute("class", classNames);
          item.classList.add(colorScheme);
        });
      };

      if (box.getAttribute("data-autoplay") === "true") {
        swiperParams.autoplay = {
          disableOnInteraction: true,
          //pauseOnMouseEnter: true,
        };
      }

      if (box.getAttribute("data-loop") === "true") {
        swiperParams.loop = true;
        swiperParams.loopPreventsSliding = false;
      }

      if (box.getAttribute("data-pagination") === "true") {
        const paginationEl = box.querySelector(".swiper-pagination");

        swiperParams.pagination = {
          el: paginationEl,
          type: "bullets",
          clickable: true,
        };
      }

      // Uncomment if you want navigation buttons
      /*
      if (box.getAttribute("data-navigation") === "true") {
        const prevBtn = box.querySelector(".swiper-button-prev");
        const nextBtn = box.querySelector(".swiper-button-next");

        swiperParams.navigation = {
          nextEl: nextBtn,
          prevEl: prevBtn,
        };
      }
      */

      if (box.getAttribute("data-parallax") === "true") {
        swiperParams.parallax = true;
      }

      if (box.getAttribute("data-animation-type") === "fade") {
        swiperParams.effect = "fade";
      } else {
        swiperParams.effect = "slide";
      }

      if (box.getAttribute("data-full-width") === "false") {
        swiperParams.breakpoints = {
          990: {
            spaceBetween: 16,
          },
        };
      }

      if (box.getAttribute("data-layout") === "overlay") {
        const sliderOverlay = box.querySelector(".slideshow__swiper--overlay");

        if (sliderOverlay) {
          const swiperOverlay = new Swiper(sliderOverlay, swiperParams);

          changeColorScheme(swiperOverlay);

          swiperOverlay.on("slideChange", () => {
            changeColorScheme(swiperOverlay);
            playVideo(sliderOverlay);
          });

          swiperOverlay.on("init", () => {
            playVideo(sliderOverlay);
          });

          swiperOverlay.init();
        }
      } else if (box.getAttribute("data-layout") === "split_screen") {
        const sliderText = box.querySelector(".slideshow__swiper--text");
        const sliderMedia = box.querySelector(".slideshow__swiper--media");

        if (box.getAttribute("data-full-width") === "false") {
          swiperParams.spaceBetween = 8;
          swiperParams.breakpoints = {
            990: {
              spaceBetween: 16,
            },
          };
        }

        if (sliderText && sliderMedia) {
          const swiperText = new Swiper(sliderText, swiperParams);

          const swiperMedia = new Swiper(sliderMedia, {
            ...swiperParams,
            autoplay: false,
            pagination: false,
            navigation: false,
            parallax: false,
          });

          swiperText.controller.control = swiperMedia;
          swiperMedia.controller.control = swiperText;

          changeColorScheme(swiperText);

          swiperText.on("slideChange", () => {
            changeColorScheme(swiperText);
          });

          swiperMedia.on("slideChange", () => {
            playVideo(sliderMedia);
          });

          swiperText.on("init", () => {
            playVideo(sliderMedia);
          });

          swiperText.init();
          swiperMedia.init();
        }
      }
    }
  };

  const initSection = (section) => {
    if (!section || !section.classList.contains("section-slideshow")) return;

    const box = section.querySelector(".slideshow");

    let slider;
    if (box && box.getAttribute("data-layout") === "overlay") {
      slider = section.querySelector(".slideshow__swiper");
    } else if (box && box.getAttribute("data-layout") === "split_screen") {
      slider = section.querySelector(".slideshow__swiper--media");
    }

    if (!slider) return;

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (slider) {
            playVideo(slider);
            if (
              slider.swiper &&
              slider.getAttribute("data-autoplay") === "true"
            ) {
              slider.swiper.autoplay.resume();
            }
          }
        } else {
          if (slider) {
            stopVideo(slider);
            if (
              slider.swiper &&
              slider.getAttribute("data-autoplay") === "true"
            ) {
              slider.swiper.autoplay.pause();
            }
          }
        }
      });
    });

    sectionObserver.observe(section);
  };

  const initScrollToExplore = (section) => {
    if (!section || !section.classList.contains("section-slideshow")) return;

    const scrollBtn = section.querySelector(".slideshow__explore-btn");
    if (!scrollBtn) return;

    const nextSection = section.nextElementSibling;

    scrollBtn.addEventListener("click", () => {
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth" });
        return;
      }

      section.scrollIntoView({ behavior: "smooth" });
    });

    scrollBtn.addEventListener("keydown", (event) => {
      if (nextSection && event.key === "Enter") {
        nextSection.scrollIntoView({ behavior: "smooth" });
        return;
      }

      section.scrollIntoView({ behavior: "smooth" });
    });
  };

  initSlider(document.currentScript.parentElement);
  initSection(document.currentScript.parentElement);
  initScrollToExplore(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", (event) => {
    initSlider(event.target);
    initSection(event.target);
    initScrollToExplore(event.target);
  });
})();
