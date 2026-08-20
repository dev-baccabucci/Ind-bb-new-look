(function () {
  const initAnimation = (section) => {
    if (
      !section ||
      !section.classList.contains("ticker-banner-section") ||
      !section.querySelector(".animate-on-scroll")
    )
      return;

    const ticker = section.querySelector(".ticker-banner-ticker");

    if (!ticker) return;

    ScrollTrigger.create({
      trigger: ticker,
      start: "50% 100%",
      end: "bottom top",
      onEnter: () => ticker.classList.add("animated"),
    });
  };

  initAnimation(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", (e) => {
    initAnimation(e.target);
  });
})();
