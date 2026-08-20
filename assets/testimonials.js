(function () {
  let imagesSlider;
  let mainSlider;

  let isCursorInit;
  let isBtnsInit;

  let debounceTimeout;
  let timeout = 100;

  const splittedTexts = new Map();
  const tweensIn = new Map();
  const tweensOut = new Map();

  const playTweenIn = (slider) => {
    const activeSlide = slider.querySelector(".swiper-slide-active");
    if (!activeSlide || !tweensIn.has(activeSlide)) return;

    const tl = tweensIn.get(activeSlide);
    tl.restart();
  };

  const playTweenOut = (slider, onComplete) => {
    const activeSlide = slider.querySelector(".swiper-slide-active");

    if (!activeSlide || !tweensOut.has(activeSlide)) {
      if (onComplete) onComplete();
      return;
    }

    const tl = tweensOut.get(activeSlide);
    tl.eventCallback("onComplete", onComplete);
    tl.restart();
  };

  const calcOffset = () => {
    const windowWidth = window.innerWidth;
    const windowWidthWithoutScrollbar = document.documentElement.clientWidth;

    if (windowWidth >= 1440) {
      return (windowWidthWithoutScrollbar - 1280) / 2;
    } else return 0;
  };

  const initSliders = (section) => {
    if (!section || !section?.classList.contains("testimonials-section"))
      return;

    const initImagesSlider = () => {
      const imagesSliderEl = section.querySelector(
        ".testimonials-images-slider"
      );

      if (!imagesSliderEl) return;

      imagesSlider = new Swiper(imagesSliderEl, {
        autoplay: false,
        slidesPerView: 1,
        allowTouchMove: false,
        spaceBetween: 20,
        speed: 1000,
        reverseDirection: false,
      });
    };

    const initMainSlider = () => {
      const mainSliderEl = section.querySelector(".testimonials-slider");

      if (!mainSliderEl) return;

      const withoutImages = mainSliderEl.classList.contains(
        "testimonials-slider--no-images"
      );

      const splitTextLinesWithTweens = (slider) => {
        const slides = slider.querySelectorAll(".swiper-slide");

        slides.forEach((slide) => {
          const text = slide.querySelector(".testimonials-slider-slide__text");
          const bottomEl = slide.querySelector(
            ".testimonials-slider-slide__bottom"
          );

          if (text) {
            const splittedText = new SplitType(text, {
              types: "words, lines",
              lineClass: "testimonials-slider-slide__text__line",
              wordClass: "testimonials-slider-slide__text__word",
            });

            const wordsAll = slide.querySelectorAll(
              ".testimonials-slider-slide__text__word"
            );

            gsap.set(wordsAll, { y: "100%" });

            const tweenInTl = gsap.timeline({ paused: true });

            tweenInTl.set(bottomEl, { opacity: 0 });

            splittedText.lines.forEach((line, lineIndex) => {
              const lineWords = line.querySelectorAll(
                ".testimonials-slider-slide__text__word"
              );

              tweenInTl.fromTo(
                lineWords,
                { y: "100%" },
                {
                  y: "0%",
                  duration: 0.8,
                  ease: "power2.out",
                  immediateRender: false,
                },
                lineIndex * 0.1
              );
            });

            if (bottomEl) {
              tweenInTl.to(
                bottomEl,
                { opacity: 1, duration: 0.7, ease: "sine.out" },
                "-=0.4"
              );
            }

            const tweenOutTl = gsap.timeline({ paused: true });

            if (bottomEl) {
              tweenOutTl.to(
                bottomEl,
                { opacity: 0, duration: 0.4, ease: "sine.in" },
                0
              );
            }

            splittedText.lines.forEach((line) => {
              const lineWords = line.querySelectorAll(
                ".testimonials-slider-slide__text__word"
              );

              tweenOutTl.fromTo(
                lineWords,
                { y: "0%" },
                {
                  y: "-100%",
                  duration: 0.6,
                  ease: "power2.in",
                  immediateRender: false,
                },
                0
              );
            });

            splittedTexts.set(slide, splittedText);
            tweensIn.set(slide, tweenInTl);
            tweensOut.set(slide, tweenOutTl);
          }
        });
      };

      const withoutImagesSliderEvents = {
        init: () => {
          section.classList.add("testimonials--slider-isBeggining");
        },
        slideChange: () => {
          if (mainSlider.isBeginning) {
            section.classList.add("testimonials--slider-isBeggining");
          } else {
            section.classList.remove("testimonials--slider-isBeggining");
          }

          if (mainSlider.isEnd) {
            section.classList.add("testimonials--slider-isEnd");
          } else {
            section.classList.remove("testimonials--slider-isEnd");
          }
        },
      };

      const withImagesSliderDesktopEvents = {
        init: () => {
          splitTextLinesWithTweens(mainSliderEl);
          playTweenIn(mainSliderEl);
          section.classList.add("testimonials--slider-isBeggining");
        },
        slideChangeTransitionStart: () => {
          const activeSlide = mainSliderEl.querySelector(
            ".swiper-slide-active"
          );

          if (activeSlide) {
            const words = activeSlide.querySelectorAll(
              ".testimonials-slider-slide__text__word"
            );
            gsap.set(words, { y: "100%" });
          }
        },
        slideChangeTransitionEnd: () => {
          playTweenIn(mainSliderEl);
        },
        slideChange: () => {
          if (mainSlider.isBeginning) {
            section.classList.add("testimonials--slider-isBeggining");
          } else {
            section.classList.remove("testimonials--slider-isBeggining");
          }

          if (mainSlider.isEnd) {
            section.classList.add("testimonials--slider-isEnd");
          } else {
            section.classList.remove("testimonials--slider-isEnd");
          }
        },
      };

      const withImagesSliderMobileEvents = {
        init: () => {
          if (splittedTexts.size) {
            splittedTexts.forEach((splittedText) => {
              splittedText.revert();
            });

            splittedTexts.clear();
          }

          if (tweensIn.size) {
            tweensIn.forEach((tween) => {
              tween.clear();
            });

            tweensIn.clear();
          }

          if (tweensOut.size) {
            tweensOut.forEach((tween) => {
              tween.clear();
            });

            tweensOut.clear();
          }

          section.classList.add("testimonials--slider-isBeggining");
        },
        slideChange: () => {
          if (mainSlider.isBeginning) {
            section.classList.add("testimonials--slider-isBeggining");
          } else {
            section.classList.remove("testimonials--slider-isBeggining");
          }

          if (mainSlider.isEnd) {
            section.classList.add("testimonials--slider-isEnd");
          } else {
            section.classList.remove("testimonials--slider-isEnd");
          }
        },
      };

      const desktopSliderEvents = withoutImages
        ? withoutImagesSliderEvents
        : withImagesSliderDesktopEvents;

      const mobileSliderEvents = withoutImages
        ? withoutImagesSliderEvents
        : withImagesSliderMobileEvents;

      const sliderEvents =
        window.innerWidth >= 750 ? desktopSliderEvents : mobileSliderEvents;

      const mobileSliderController = withoutImages
        ? {}
        : { control: imagesSlider };

      const spaceBetweenMobile = mainSliderEl.classList.contains(
        "testimonials-slider--visible-overflow"
      )
        ? 16
        : 20;

      const slidesPerViewMobile = mainSliderEl.classList.contains(
        "testimonials-slider--visible-overflow"
      )
        ? "auto"
        : 1;

      mainSlider = new Swiper(mainSliderEl, {
        autoplay: false,
        allowTouchMove: true,
        slidesPerView: slidesPerViewMobile,
        mousewheel: withoutImages
          ? {
              forceToAxis: true,
            }
          : false,
        slidesOffsetAfter: 0,
        slidesOffsetBefore: 0,
        spaceBetween: spaceBetweenMobile,
        speed: 1000,
        controller: mobileSliderController,
        effect: "slide",
        on: sliderEvents,
        breakpoints: {
          750: {
            allowTouchMove: true,
            slidesPerView: withoutImages ? 1.5 : 1,
            slidesOffsetAfter: withoutImages ? 20 : 0,
            slidesOffsetBefore: withoutImages ? 20 : 0,
            spaceBetween: withoutImages ? 64 : 20,
            speed: withoutImages ? 1000 : 1,
            controller: {},
            effect: withoutImages ? "slide" : "fade",
            fadeEffect: withoutImages ? null : { crossFade: true },
          },
          990: {
            allowTouchMove: withoutImages ? true : false,
            slidesPerView: withoutImages ? 1.8 : 1,
            slidesOffsetAfter: withoutImages ? 20 : 0,
            slidesOffsetBefore: withoutImages ? 20 : 0,
            spaceBetween: withoutImages ? 64 : 20,
            speed: withoutImages ? 1000 : 1,
            controller: {},
            effect: withoutImages ? "slide" : "fade",
            fadeEffect: withoutImages ? null : { crossFade: true },
          },
          1200: {
            allowTouchMove: false,
            slidesPerView: withoutImages ? "auto" : 1,
            slidesOffsetAfter: withoutImages ? 80 : 0,
            slidesOffsetBefore: withoutImages ? 80 : 0,
            spaceBetween: withoutImages ? 100 : 0,
            speed: withoutImages ? 1000 : 1,
            controller: {},
            effect: withoutImages ? "slide" : "fade",
            fadeEffect: withoutImages ? null : { crossFade: true },
          },
          1440: {
            allowTouchMove: false,
            slidesPerView: withoutImages ? "auto" : 1,
            slidesOffsetAfter: withoutImages ? calcOffset() : 0,
            slidesOffsetBefore: withoutImages ? calcOffset() : 0,
            spaceBetween: withoutImages ? 100 : 0,
            speed: withoutImages ? 1000 : 1,
            controller: {},
            effect: withoutImages ? "slide" : "fade",
            fadeEffect: withoutImages ? null : { crossFade: true },
          },
        },
      });
    };

    initImagesSlider();
    initMainSlider();

    if (
      mainSlider &&
      imagesSlider &&
      !mainSlider.el.classList.contains("testimonials-slider--no-images") &&
      window.innerWidth < 750
    ) {
      mainSlider.controller.control = imagesSlider;
      imagesSlider.controller.control = mainSlider;
    }

    window.addEventListener("resize", () => {
      if (mainSlider) {
        mainSlider.destroy(true, true);
        mainSlider = null;
      }

      if (imagesSlider) {
        imagesSlider.destroy(true, true);
        imagesSlider = null;
      }

      initImagesSlider();
      initMainSlider();
    });
  };

  const initCursor = (section) => {
    if (!section || !section?.classList.contains("testimonials-section"))
      return;

    const contentSection = section.querySelector(".testimonials-content");

    if (!contentSection) return;

    const arrowCursorEl = section.querySelector(".testimonials-cursor");

    if (!arrowCursorEl) return;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const easingFactor = 0.19;
    let isAnimating = false;

    const animateCursor = () => {
      isAnimating = true;

      currentX += (targetX - currentX) * easingFactor;
      currentY += (targetY - currentY) * easingFactor;

      arrowCursorEl.style.left = `${currentX}px`;
      arrowCursorEl.style.top = `${currentY}px`;

      if (
        Math.abs(targetX - currentX) > 0.1 ||
        Math.abs(targetY - currentY) > 0.1
      ) {
        requestAnimationFrame(() => animateCursor());
      } else {
        isAnimating = false;
      }
    };

    const handleMouseMove = (e) => {
      if (!e.target.closest(".testimonials-slider-slide__button")) {
        contentSection.classList.add("cursor-active");
      } else {
        contentSection.classList.remove("cursor-active");
      }

      const contentRect = contentSection.getBoundingClientRect();
      const arrowCursorElRect = arrowCursorEl.getBoundingClientRect();
      const containerWidth = contentRect.width;
      const containerCenterX = contentRect.left + containerWidth / 2;

      if (e.clientX < containerCenterX) {
        arrowCursorEl.classList.add("prev");
        arrowCursorEl.classList.remove("next");
      } else {
        arrowCursorEl.classList.remove("prev");
        arrowCursorEl.classList.add("next");
      }

      targetX = e.clientX - contentRect.left - arrowCursorElRect.width / 2;
      targetY = e.clientY - contentRect.top - arrowCursorElRect.height / 2;

      if (!isAnimating) {
        animateCursor();
      }
    };

    const handleMouseEnter = (e) => {
      const contentRect = contentSection.getBoundingClientRect();
      const arrowCursorElRect = arrowCursorEl.getBoundingClientRect();

      targetX = currentX =
        e.clientX - contentRect.left - arrowCursorElRect.width / 2;
      targetY = currentY =
        e.clientY - contentRect.top - arrowCursorElRect.height / 2;

      arrowCursorEl.style.left = `${currentX}px`;
      arrowCursorEl.style.top = `${currentY}px`;

      contentSection.classList.add("cursor-active");
    };

    const handleMouseLeave = () => {
      contentSection.classList.remove("cursor-active");
    };

    const handleClick = (e) => {
      if (e.target.closest(".testimonials-slider-slide__button")) {
        return;
      }

      const contentRect = contentSection.getBoundingClientRect();
      const containerWidth = contentRect.width;
      const containerCenterX = contentRect.left + containerWidth / 2;

      if (e.clientX < containerCenterX && !mainSlider.isBeginning) {
        debounceSlidePrev();
      } else if (e.clientX >= containerCenterX && !mainSlider.isEnd) {
        debounceSlideNext();
      }
    };

    const debounceSlidePrev = () => {
      clearTimeout(debounceTimeout);

      debounceTimeout = setTimeout(() => {
        imagesSlider.slidePrev();

        playTweenOut(mainSlider.el, () => {
          mainSlider.slidePrev();
        });
      }, timeout);
    };

    const debounceSlideNext = () => {
      clearTimeout(debounceTimeout);

      debounceTimeout = setTimeout(() => {
        imagesSlider.slideNext();

        playTweenOut(mainSlider.el, () => {
          mainSlider.slideNext();
        });
      }, timeout);
    };

    const withoutImagesHandleClick = (e) => {
      if (e.target.closest(".testimonials-slider-slide__button")) {
        return;
      }

      const contentRect = contentSection.getBoundingClientRect();
      const containerWidth = contentRect.width;
      const containerCenterX = contentRect.left + containerWidth / 2;

      if (e.clientX < containerCenterX) {
        mainSlider.slidePrev();
      } else if (e.clientX >= containerCenterX) {
        mainSlider.slideNext();
      }
    };

    if (
      window.innerWidth >= 1200 &&
      window.matchMedia("(pointer:fine)").matches &&
      !isCursorInit
    ) {
      contentSection.addEventListener("mouseenter", handleMouseEnter);
      contentSection.addEventListener("mousemove", handleMouseMove);
      contentSection.addEventListener("mouseleave", handleMouseLeave);

      if (mainSlider.el.classList.contains("testimonials-slider--no-images")) {
        contentSection.addEventListener("click", withoutImagesHandleClick);
      } else {
        contentSection.addEventListener("click", handleClick);
      }

      isCursorInit = true;
    }

    window.addEventListener("resize", () => {
      if (
        window.innerWidth >= 1200 &&
        window.matchMedia("(pointer:fine)").matches
      ) {
        if (!isCursorInit) {
          contentSection.addEventListener("mouseenter", handleMouseEnter);
          contentSection.addEventListener("mousemove", handleMouseMove);
          contentSection.addEventListener("mouseleave", handleMouseLeave);

          if (
            mainSlider.el.classList.contains("testimonials-slider--no-images")
          ) {
            contentSection.addEventListener("click", withoutImagesHandleClick);
          } else {
            contentSection.addEventListener("click", handleClick);
          }

          isCursorInit = true;
        }
      } else {
        if (isCursorInit) {
          contentSection.removeEventListener("mouseenter", handleMouseEnter);
          contentSection.removeEventListener("mousemove", handleMouseMove);
          contentSection.removeEventListener("mouseleave", handleMouseLeave);

          if (
            mainSlider.el.classList.contains("testimonials-slider--no-images")
          ) {
            contentSection.removeEventListener(
              "click",
              withoutImagesHandleClick
            );
          } else {
            contentSection.removeEventListener("click", handleClick);
          }

          isCursorInit = false;
        }
      }
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

    const desktopSliderPrevBtnHandleClick = () => {
      if (!mainSlider.isBeginning) {
        imagesSlider.slidePrev();
        playTweenOut(mainSlider.el, () => {
          mainSlider.slidePrev();
        });
      }
    };

    const desktopSliderNextBtnHandleClick = () => {
      if (!mainSlider.isEnd) {
        imagesSlider.slideNext();
        playTweenOut(mainSlider.el, () => {
          mainSlider.slideNext();
        });
      }
    };

    const nextBtnHandleClick = () => {
      if (!mainSlider.isEnd) {
        mainSlider.slideNext();
      }
    };

    const prevBtnHandleClick = () => {
      if (!mainSlider.isBeginning) {
        mainSlider.slidePrev();
      }
    };

    const initializeButtons = () => {
      if (isBtnsInit) {
        prevButton.removeEventListener("click", prevBtnHandleClick);
        prevButton.removeEventListener(
          "click",
          desktopSliderPrevBtnHandleClick
        );
        nextButton.removeEventListener("click", nextBtnHandleClick);
        nextButton.removeEventListener(
          "click",
          desktopSliderNextBtnHandleClick
        );

        isBtnsInit = false;
      }

      if (!isBtnsInit) {
        if (
          mainSlider.el.classList.contains("testimonials-slider--no-images")
        ) {
          if (
            window.innerWidth < 1200 ||
            !window.matchMedia("(pointer:fine)").matches
          ) {
            prevButton.addEventListener("click", prevBtnHandleClick);
            nextButton.addEventListener("click", nextBtnHandleClick);

            isBtnsInit = true;
          }
        } else {
          if (
            window.innerWidth < 1200 ||
            !window.matchMedia("(pointer:fine)").matches
          ) {
            if (window.innerWidth < 750) {
              prevButton.addEventListener("click", prevBtnHandleClick);
              nextButton.addEventListener("click", nextBtnHandleClick);
            } else {
              prevButton.addEventListener(
                "click",
                desktopSliderPrevBtnHandleClick
              );
              nextButton.addEventListener(
                "click",
                desktopSliderNextBtnHandleClick
              );
            }

            isBtnsInit = true;
          }
        }
      }
    };

    initializeButtons();

    window.addEventListener("resize", initializeButtons);
  };

  document.addEventListener(
    "DOMContentLoaded",
    initSliders(document.currentScript.parentElement)
  );

  document.addEventListener(
    "DOMContentLoaded",
    initCursor(document.currentScript.parentElement)
  );

  document.addEventListener(
    "DOMContentLoaded",
    initButtons(document.currentScript.parentElement)
  );

  document.addEventListener("shopify:section:load", function (event) {
    initSliders(event.target);
    initCursor(event.target);
    initButtons(event.target);
  });
})();
