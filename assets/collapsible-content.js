(function () {
  const slideUp = (element, duration = 300) => {
    if (!element) return;
    element.style.height = `${element.scrollHeight}px`;
    element.style.overflow = "hidden";
    element.style.transition = `height ${duration}ms ease`;

    requestAnimationFrame(() => {
      element.style.height = "0";
    });

    setTimeout(() => {
      element.style.display = "none";
      element.style.removeProperty("height");
      element.style.removeProperty("overflow");
      element.style.removeProperty("transition");
    }, duration);
  };

  const slideDown = (element, duration = 300) => {
    if (!element) return;

    element.style.removeProperty("display");
    let display = window.getComputedStyle(element).display;

    if (display === "none") display = "block";
    element.style.display = display;

    const height = element.scrollHeight;

    element.style.height = "0";
    element.style.overflow = "hidden";
    element.style.transition = `height ${duration}ms ease`;

    requestAnimationFrame(() => {
      element.style.height = `${height}px`;
    });

    setTimeout(() => {
      element.style.removeProperty("height");
      element.style.removeProperty("overflow");
      element.style.removeProperty("transition");
    }, duration);
  };

  const toggleCollapsible = (event, toggles) => {
    if (!toggles) return;

    const answer = event.currentTarget.querySelector(
      ".collapsible-content__answer"
    );
    const activeItem = Array.from(toggles).find((item) =>
      item.classList.contains("active")
    );

    if (event.currentTarget !== activeItem) {
      if (activeItem) {
        activeItem.classList.remove("active");
        const activeAnswer = activeItem.querySelector(
          ".collapsible-content__answer"
        );
        if (activeAnswer) slideUp(activeAnswer);
      }
      event.currentTarget.classList.add("active");
      slideDown(answer);
    } else {
      event.currentTarget.classList.remove("active");
      slideUp(answer);
    }
  };

  const initCollapsibleContent = (section) => {
    if (!section || !section?.classList.contains("collapsible-content-section"))
      return;
    const toggles = section.querySelectorAll(".collapsible-content__item");

    toggles.forEach((toggle) =>
      toggle.addEventListener("click", (event) =>
        toggleCollapsible(event, toggles)
      )
    );
  };

  document.addEventListener(
    "DOMContentLoaded",
    initCollapsibleContent(document.currentScript.parentElement)
  );

  document.addEventListener("shopify:section:load", function (event) {
    initCollapsibleContent(event.target);
  });
})();
