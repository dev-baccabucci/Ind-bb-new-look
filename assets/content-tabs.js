(() => {
  const setActiveContent = (section, activeId) => {
    const contentEls = section.querySelectorAll(".content-tabs__content");

    contentEls.forEach((el) => {
      el.classList.remove("content-tabs__content--active");
      el.classList.remove("animate");
    });

    const activeContent = section.querySelector(
      `[data-content-tab-id="${activeId}"].content-tabs__content`
    );

    if (activeContent) {
      activeContent.classList.add("content-tabs__content--active");

      setTimeout(() => {
        activeContent.classList.add("animate");
      }, 100);
    }
  };

  const toggleTab = (section) => {
    const tabs = section.querySelectorAll(".content-tabs__tab");

    tabs.forEach((tab) => {
      const currentId = tab.dataset.contentTabId;

      tab.addEventListener("click", (event) => {
        if (
          !event.currentTarget.classList.contains("content-tabs__tab--active")
        ) {
          tabs.forEach((el) => {
            el.classList.remove("content-tabs__tab--active");
          });
          tab.classList.add("content-tabs__tab--active");

          setActiveContent(section, currentId);
        }
      });

      tab.addEventListener("keydown", (event) => {
        if (
          !event.currentTarget.classList.contains(
            "content-tabs__tab--active"
          ) &&
          event.key === "Enter"
        ) {
          tabs.forEach((el) => {
            el.classList.remove("content-tabs__tab--active");
          });
          tab.classList.add("content-tabs__tab--active");

          setActiveContent(section, currentId);
        }
      });
    });
  };

  const setWidthForAfter = (section) => {
    const wrapper = section.querySelector(".content-tabs__tabs-wrapper");
    if (!wrapper) return;

    const setVariable = (el) => {
      el.style.setProperty("--wrapper-border-width", `0px`);
      const elScrollWidth = el.scrollWidth;
      el.style.setProperty("--wrapper-border-width", `${elScrollWidth}px`);
    };

    setVariable(wrapper);

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setVariable(entry.target);
      });
    });
    resizeObserver.observe(wrapper);
  };

  const initSection = (section) => {
    if (!section || !section.classList.contains("content-tabs-section")) return;

    toggleTab(section);
    setWidthForAfter(section);
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSection(event.target);
  });
})();
