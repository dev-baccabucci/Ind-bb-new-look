(function () {
  let imageMulticolumnSwiper;

  const initSlider = (slider) => {
    slider.classList.add("swiper");

    const wrapper = slider.querySelector(".swiper-wrapper--image-multicolumn");

    if (!wrapper) return;

    wrapper.classList.add("swiper-wrapper");

    const slides = slider.querySelectorAll(".image-multicolumn-block");

    if (!slides || !slides.length) return;

    slides.forEach((slide) => {
      slide.classList.add("swiper-slide");
    });

    const nextBtn = slider.querySelector(
      ".image-multicolumn__navigation-button-next"
    );

    const prevBtn = slider.querySelector(
      ".image-multicolumn__navigation-button-prev"
    );

    const spaceBetween = slider.classList.contains(
      "swiper--image-multicolumn--visible-overflow"
    )
      ? 16
      : 20;

    const slidesPerView = slider.classList.contains(
      "swiper--image-multicolumn--visible-overflow"
    )
      ? "auto"
      : 1;

    imageMulticolumnSwiper = new Swiper(slider, {
      loop: false,
      slidesPerView: slidesPerView,
      spaceBetween: spaceBetween,
      speed: 1000,
      navigation: {
        nextEl: nextBtn,
        prevEl: prevBtn,
        disabledClass: "image-multicolumn__navigation-button-disabled",
      },
    });
  };

  const destroySlider = (section) => {
    if (!section || !section?.classList.contains("section-image-multicolumn"))
      return;

    const slider = section.querySelector(".swiper--image-multicolumn");
    const slides = section.querySelectorAll(".image-multicolumn-block");
    const wrapper = section.querySelector(".swiper-wrapper--image-multicolumn");

    if (!slider || !slides || !slides.length || !wrapper) return;

    slider.classList.remove("swiper");

    slides.forEach((slide) => {
      slide.removeAttribute("style");
      slide.classList.remove("swiper-slide");
    });

    wrapper.classList.remove("swiper-wrapper");

    imageMulticolumnSwiper.destroy(true, true);
    imageMulticolumnSwiper = null;
  };

  const initImageMulticolumn = (section) => {
    if (!section || !section?.classList.contains("section-image-multicolumn"))
      return;

    const slider = section.querySelector(".swiper--image-multicolumn");

    if (!slider) return;

    const sectionResizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width < 750 && slider) {
          initSlider(slider);
        } else if (imageMulticolumnSwiper) {
          destroySlider(section);
        }
      });
    });

    sectionResizeObserver.observe(section);
  };

  const initButtonCursors = (section) => {
    if (!section || !section?.classList.contains("section-image-multicolumn"))
      return;

    const imageBlocks = section.querySelectorAll(
      ".image-multicolumn-card--button-as-cursor"
    );

    if (!imageBlocks || !imageBlocks.length) return;

    imageBlocks.forEach((imageBlock) => {
      let isBtnCursorInit = false;
      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;
      const easingFactor = 0.15;
      let isAnimating = false;

      const button = imageBlock.querySelector(
        ".image-multicolumn-card__button"
      );

      if (!button) return;

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

      const handleMouseMove = (e) => {
        const contentRect = imageBlock.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        targetX = e.clientX - contentRect.left - buttonRect.width / 2;
        targetY = e.clientY - contentRect.top - buttonRect.height / 2;

        if (!isAnimating) {
          animateButton(button);
        }
      };

      const handleMouseEnter = (e) => {
        const contentRect = imageBlock.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        targetX = currentX =
          e.clientX - contentRect.left - buttonRect.width / 2;
        targetY = currentY =
          e.clientY - contentRect.top - buttonRect.height / 2;

        button.style.left = `${currentX}px`;
        button.style.top = `${currentY}px`;

        imageBlock.classList.add("cursor-active");
      };

      const handleMouseLeave = () => {
        imageBlock.classList.remove("cursor-active");
      };

      if (
        window.innerWidth >= 1200 &&
        window.matchMedia("(pointer:fine)").matches &&
        !isBtnCursorInit
      ) {
        imageBlock.addEventListener("mouseenter", handleMouseEnter);
        imageBlock.addEventListener("mousemove", handleMouseMove);
        imageBlock.addEventListener("mouseleave", handleMouseLeave);

        isBtnCursorInit = true;
      }

      window.addEventListener("resize", () => {
        if (
          window.innerWidth >= 1200 &&
          window.matchMedia("(pointer:fine)").matches &&
          !isBtnCursorInit
        ) {
          imageBlock.addEventListener("mouseenter", handleMouseEnter);
          imageBlock.addEventListener("mousemove", handleMouseMove);
          imageBlock.addEventListener("mouseleave", handleMouseLeave);

          isBtnCursorInit = true;
        }

        if (
          window.innerWidth < 1200 ||
          !window.matchMedia("(pointer:fine)").matches
        ) {
          if (isBtnCursorInit) {
            imageBlock.removeEventListener("mouseenter", handleMouseEnter);
            imageBlock.removeEventListener("mousemove", handleMouseMove);
            imageBlock.removeEventListener("mouseleave", handleMouseLeave);
            imageBlock.classList.remove("cursor-active");
            button.style = "";

            isBtnCursorInit = false;
          }
        }
      });
    });
  };

  if (imageMulticolumnSwiper) {
    destroySlider(document.currentScript.parentElement);
  }

  initImageMulticolumn(document.currentScript.parentElement);
  initButtonCursors(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (e) {
    if (imageMulticolumnSwiper) {
      destroySlider(e.target);
    }

    initImageMulticolumn(e.target);
    initButtonCursors(e.target);
  });
})();
