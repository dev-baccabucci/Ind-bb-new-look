(function () {
  const initSlider = (section) => {
    const box = section.querySelector(".multicolumn");
    const slider = section.querySelector(".swiper--multicolumn");

    if (!slider) return;

    const slides = slider.querySelectorAll(".multicolumn-card");

    slides.forEach((slide) => {
      slide.classList.add("swiper-slide");
    });

    const spaceBetween = box.getAttribute("data-space-between")
      ? Number(box.getAttribute("data-space-between")) * 10
      : 24;

    const spaceBetweenMobile = slider.classList.contains(
      "swiper--multicolumn--visible-overflow"
    )
      ? 16
      : 20;

    const nextBtn = slider.querySelector(".multicolumn-button--next");
    const prevBtn = slider.querySelector(".multicolumn-button--prev");
    const scrollbar = slider.querySelector(".swiper-scrollbar");

    new Swiper(slider, {
      loop: false,
      slidesPerView: "auto",
      spaceBetween: spaceBetweenMobile,
      speed: 800,
      mousewheel: {
        forceToAxis: true,
      },
      watchSlidesProgress: true,
      navigation: {
        nextEl: nextBtn,
        prevEl: prevBtn,
        disabledClass: "multicolumn-button--disabled",
      },
      scrollbar: {
        el: scrollbar,
        grabCursor: true,
        draggable: true,
        hide: false,
      },
      breakpoints: {
        576: {
          spaceBetween: spaceBetween,
        },
      },
    });
  };

  const destroySlider = (section) => {
    const slider = section.querySelector(".swiper--multicolumn");
    const slides = section.querySelectorAll(".multicolumn-card");

    if (slider?.swiper) slider.swiper.destroy();

    slides.forEach((slide) => {
      slide.removeAttribute("style");
      slide.classList.remove("swiper-slide");
    });
  };

  const initMulticolumn = (section) => {
    if (!section || !section?.classList.contains("multicolumn-section")) return;

    const box = section.querySelector(".multicolumn");

    if (!box) return;

    const hasMobileSlider =
      box.getAttribute("data-enable-mobile-slider") === "true";
    const hasDesktopSlider =
      box.getAttribute("data-enable-desktop-slider") === "true";

    const sectionResizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width < 576 && hasMobileSlider) {
          initSlider(section);
        } else if (entry.contentRect.width >= 576 && hasDesktopSlider) {
          initSlider(section);
        } else {
          destroySlider(section);
        }
      });
    });

    sectionResizeObserver.observe(section);
  };

  initMulticolumn(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initMulticolumn(event.target);
  });
})();
