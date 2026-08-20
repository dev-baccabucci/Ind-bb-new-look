(function () {
  const initAnimation = (section) => {
    if (
      !section ||
      !section.classList.contains("media-banner-section") ||
      !section.querySelector(".animate-on-scroll")
    )
      return;

    const text = section.querySelector(".media-banner__heading");

    if (!text) return;

    ScrollTrigger.create({
      trigger: text,
      start: "50% 95%",
      end: "bottom top",
      onEnter: () => text.classList.add("animated"),
    });
  };

  initAnimation(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initAnimation(event.target);
  });
})();
