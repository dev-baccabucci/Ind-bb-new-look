(function () {
  let heroStickyImgWrapperTop = 0;

  const setImagePosition = (section) => {
    if (!section?.classList.contains("hero-section")) return;

    const heroSection = section.querySelector(".hero.animate");
    const imageWrapper = section.querySelector(".hero-sticky-image-container");
    const heading = section.querySelector(".hero-heading");
    if (!heroSection || !imageWrapper || !heading) return;

    const setPosition = () => {
      const style = getComputedStyle(heroSection);
      const prevProgress =
        parseFloat(style.getPropertyValue("--progress")) || 0;

      heroSection.style.setProperty("--progress", 0);

      const { height: initH } = imageWrapper.getBoundingClientRect();

      heroSection.style.setProperty("--progress", prevProgress);

      const headingRect = heading.getBoundingClientRect();
      heroStickyImgWrapperTop =
        heading.offsetTop + headingRect.height / 2 - initH / 2;

      imageWrapper.style.top = `${heroStickyImgWrapperTop}px`;
      imageWrapper.style.transform = "translateX(-50%)";
    };

    setPosition();
    imageWrapper.classList.add("show");

    new ResizeObserver(setPosition).observe(section);
  };

  const initHero = (section) => {
    if (!section || !section?.classList.contains("hero-section")) return;

    const container = section.querySelector(".hero.animate");

    if (!container) return;

    if (container.classList.contains("hero--first-section")) {
      container.classList.add("animated");
      return;
    }

    ScrollTrigger.create({
      trigger: container,
      start: "50% bottom",
      end: "bottom top",
      onEnter: () => container.classList.add("animated"),
    });
  };

  const initAnimation = (section) => {
    if (
      !section ||
      !section?.classList.contains("hero-section") ||
      !section.querySelector(".hero-sticky-image")
    )
      return;

    const heroSection = section.querySelector(".hero.animate");

    if (!heroSection) return;

    const imageWrapper = section.querySelector(".hero-sticky-image-container");

    if (!imageWrapper) return;

    const heading = section.querySelector(".hero-heading");

    if (heading) {
      const headingRect = heading.getBoundingClientRect();
      const imageRect = imageWrapper.getBoundingClientRect();
      heroStickyImgWrapperTop =
        heading.offsetTop + headingRect.height / 2 - imageRect.height / 2;
    }

    const calculateProgress = () => {
      const sectionRect = heroSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = window.scrollY + sectionRect.top;

      const end = start + sectionRect.height - windowHeight;

      const scrollPosition = window.scrollY;
      let progress = (scrollPosition - start) / (end - start);
      progress = Math.min(Math.max(progress, 0), 1);

      heroSection.style.setProperty("--progress", progress);

      if (heading) {
        const imageWrapperTopPos = heroStickyImgWrapperTop * (1 - progress);
        imageWrapper.style.top = `${imageWrapperTopPos}px`;
      }

      const stickyWrapper = section.querySelector(".hero-sticky-wrapper");
      if (stickyWrapper) {
        if (progress >= 0.95) {
          stickyWrapper.classList.add("ended");
        } else {
          stickyWrapper.classList.remove("ended");
        }
      }
    };

    window.addEventListener("scroll", calculateProgress);

    const resizeObserver = new ResizeObserver(() => {
      calculateProgress();
    });

    resizeObserver.observe(heroSection);

    calculateProgress();
  };

  setImagePosition(document.currentScript.parentElement);
  initHero(document.currentScript.parentElement);
  initAnimation(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (e) {
    setImagePosition(e.target);
    initHero(e.target);
    initAnimation(e.target);
  });
})();
