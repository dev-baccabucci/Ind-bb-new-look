(function () {
  const initAnimation = (section) => {
    if (!section || !section.querySelector(".animate-on-scroll")) return;

    const footerBlocksContainer = section.querySelector(".footer-blocks");

    if (!footerBlocksContainer) return;

    const footerBlocks = footerBlocksContainer.querySelectorAll(
      ".footer-block, .accordion"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          footerBlocks.forEach((block) => {
            gsap.fromTo(
              block,
              {
                maskPosition: "100% 0%",
              },
              {
                maskPosition: "0% 0%",
                duration: 1.75,
                ease: "ease",
                onComplete: () => {
                  block.style.webkitMaskImage = "none";
                  block.style.maskImage = "none";
                },
              }
            );
          });
          observer.disconnect();
        }
      },
      {
        threshold: 0,
      }
    );

    observer.observe(footerBlocksContainer);
  };

  initAnimation(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initAnimation(event.target);
  });
})();
