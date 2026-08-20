(function () {
  const setImageClasses = (section, activeId) => {
    const images = section.querySelectorAll(".image-tabs__image");

    images.forEach((image) => {
      image.classList.remove("image-tabs__image--active");
    });

    const activeImage = section.querySelector(
      `[data-image-tabs="${activeId}"].image-tabs__image`
    );

    activeImage.classList.add("image-tabs__image--active");
  };

  const initClassesDesktop = (section) => {
    const blocks = section.querySelectorAll(".image-tabs__block");
    blocks[0].classList.add("image-tabs__block--active");
    blocks[0].classList.add("active");

    setImageClasses(section, "#image-tabs-1");
  };

  const initClassesMobile = (section) => {
    const images = section.querySelectorAll(".image-tabs__image");
    const tabsWrapper = section.querySelector(
      ".image-tabs__content-blocks-wrapper"
    );
    const tabs = section.querySelectorAll(".image-tabs__block");

    tabsWrapper?.classList.add("swiper-wrapper");
    images.forEach((image) => {
      image.classList.remove("image-tabs__image--active");
      image.classList.add("swiper-slide");
    });
    tabs.forEach((tab) => {
      tab.classList.remove("image-tabs__block--active");
      tab.classList.remove("active");
      tab.classList.add("swiper-slide");
    });
  };

  const blockToggleDesktop = (section) => {
    const blocks = section.querySelectorAll(".image-tabs__block");

    const setBlockClasses = (activeBlock) => {
      blocks.forEach((block) => {
        block.classList.remove("image-tabs__block--active");
        block.classList.remove("active");
      });
      activeBlock.classList.add("image-tabs__block--active");
      activeBlock.classList.add("active");
    };

    blocks.forEach((block) => {
      block.addEventListener("click", () => {
        const activeId = block.dataset.imageTabs;
        setBlockClasses(block);
        setImageClasses(section, activeId);
      });

      block.addEventListener("mouseenter", () => {
        blocks.forEach((block) => {
          block.classList.remove("image-tabs__block--active");
          block.classList.remove("active");
        });
        const hoverId = block.dataset.imageTabs;
        block.classList.add("image-tabs__block--active");
        setImageClasses(section, hoverId);
      });
    });
  };

  const initSliderMobile = (section) => {
    const sliderTabs = section.querySelector(".swiper--content-tabs");
    const sliderImage = section.querySelector(".swiper--image-tabs");

    if (sliderTabs && sliderImage) {
      const pagination = sliderTabs.querySelector(
        ".image-tabs__pagination > .swiper-pagination"
      );

      if (sliderTabs.swiper) sliderTabs.swiper.destroy();
      if (sliderImage.swiper) sliderImage.swiper.destroy();

      const swiperTabs = new Swiper(sliderTabs, {
        enabled: true,
        loop: false,
        speed: 800,
        spaceBetween: 8,
        breakpoints: {
          990: {
            enabled: false,
          },
        },
        pagination: pagination
          ? {
              el: pagination,
              type: "bullets",
              clickable: true,
            }
          : false,
      });

      const swiperImage = new Swiper(sliderImage, {
        loop: false,
        speed: 800,
        spaceBetween: 8,
        breakpoints: {
          990: {
            enabled: false,
          },
        },
      });

      swiperTabs.controller.control = swiperImage;
      swiperImage.controller.control = swiperTabs;
    }
  };

  const destroySlider = (section) => {
    const images = section.querySelectorAll(".image-tabs__image");
    const tabs = section.querySelectorAll(".image-tabs__block");
    const sliderTabs = section.querySelector(".swiper--content-tabs");
    const sliderImage = section.querySelector(".swiper--image-tabs");

    if (sliderTabs.swiper) sliderTabs.swiper.destroy();
    if (sliderImage.swiper) sliderImage.swiper.destroy();

    images.forEach((image) => {
      image.removeAttribute("style");
      image.classList.remove("swiper-slide");
    });
    tabs.forEach((tab) => {
      tab.removeAttribute("style");
      tab.classList.remove("swiper-slide");
    });
  };

  const initSection = (section) => {
    if (section && section.classList.contains("image-tabs-section")) {
      const sectionResizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.contentRect.width >= 990) {
            initClassesDesktop(entry.target);
            blockToggleDesktop(entry.target);
          }

          if (entry.contentRect.width < 990) {
            initClassesMobile(entry.target);
            initSliderMobile(entry.target);
          } else {
            destroySlider(entry.target);
          }
        });
      });

      sectionResizeObserver.observe(section);
    }
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSection(event.target);
  });
})();
