(() => {
  const initSection = (section) => {
    if (!section || !section?.classList.contains("steps-section")) return;

    const tabsWrapper = section.querySelector(".steps__items");
    const tabs = section.querySelectorAll(".steps__item");
    const contents = section.querySelectorAll(".steps__content");
    const bulletLine = section.querySelector(".steps__items-line");

    if (!tabsWrapper || !tabs.length || !contents.length) return;

    let isTabClicking = false;
    let scrollTimeout;

    // draw line
    const setBulletVariables = (activeTab) => {
      const topWrapperTop = tabsWrapper.getBoundingClientRect().top;
      const tabTop = activeTab.getBoundingClientRect().top;
      const bulletPosition = tabTop - topWrapperTop;
      const tabHeight = activeTab.offsetHeight;

      bulletLine.style.setProperty("--max_height_bullet", `${tabHeight}px`);
      bulletLine.style.setProperty("--pos_y_bullet", `${bulletPosition}px`);
    };

    // activate step by scroll page
    const activateStepByScroll = () => {
      if (isTabClicking) return;

      const middleOfScreen = window.innerHeight / 2 + window.scrollY;

      let closestElement = null;
      let closestDistance = Infinity;

      contents.forEach((content) => {
        const contentTop = content.getBoundingClientRect().top + window.scrollY;
        const contentBottom = contentTop + content.offsetHeight;

        const visibleHeight =
          Math.min(contentBottom, window.scrollY + window.innerHeight) -
          Math.max(contentTop, window.scrollY);

        if (visibleHeight < content.offsetHeight * 0.25) return;

        const contentCenter = contentTop + content.offsetHeight / 2;
        const distanceToMiddle = Math.abs(middleOfScreen - contentCenter);

        if (distanceToMiddle < closestDistance) {
          closestDistance = distanceToMiddle;
          closestElement = content;
        }
      });

      if (closestElement) {
        const activeId = closestElement.dataset.stepId;

        closestElement.classList.add("step-viewed");

        tabs.forEach((tab) => {
          tab.classList.remove("steps__item--active");

          if (tab.dataset.stepId === activeId) {
            tab.classList.add("steps__item--active");
            setBulletVariables(tab);
          }
        });
      }
    };

    // scroll to active step content after click
    const scrollToStep = (activeContent) => {
      const elementPosition =
        activeContent.getBoundingClientRect().top + window.scrollY;

      let offsetPosition = elementPosition - 16;

      const header = document.querySelector(".shopify-section-header");
      if (header) {
        const headerHeight = header.getBoundingClientRect().height;
        offsetPosition = offsetPosition - headerHeight;
      }

      if (activeContent.classList.contains("steps__content--with-pd-top")) {
        offsetPosition = offsetPosition + 64;
      }

      isTabClicking = true;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isTabClicking = false;
      }, 800);
    };

    // activate step by click
    const activateStepByClick = (event) => {
      const activeTab = event.target.closest(".steps__item");
      if (!activeTab || activeTab.classList.contains("steps__item--active")) {
        return;
      }
      const activeId = activeTab.dataset.stepId;
      const activeContent = section.querySelector(
        `[data-step-id="${activeId}"].steps__content`
      );

      tabs.forEach((tab) => {
        tab.classList.remove("steps__item--active");
      });

      activeTab.classList.add("steps__item--active");
      if (activeContent) activeContent.classList.add("step-viewed");
      setBulletVariables(activeTab);
      if (activeContent) scrollToStep(activeContent);
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", activateStepByClick);
      tab.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          activateStepByClick(event);
        }
      });
    });

    activateStepByScroll();
    window.addEventListener("scroll", activateStepByScroll);
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSection(event.target);
  });
})();
