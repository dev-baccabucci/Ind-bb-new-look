(function () {
  let postsSwiper;

  const initSlider = (slider) => {
    slider.classList.add("swiper");

    const wrapper = slider.querySelector(".blog-posts-grid");

    if (!wrapper) return;

    wrapper.classList.add("swiper-wrapper");

    const slides = slider.querySelectorAll(".blog-posts-card");

    if (!slides || !slides.length) return;

    slides.forEach((slide) => {
      slide.classList.add("swiper-slide");
    });

    const nextBtn = slider.querySelector(".blog-posts-nav-button--next");
    const prevBtn = slider.querySelector(".blog-posts-nav-button--prev");

    const spaceBetween = slider.classList.contains(
      "swiper--blog-posts--visible-overflow"
    )
      ? 16
      : 20;

    const slidesPerView = slider.classList.contains(
      "swiper--blog-posts--visible-overflow"
    )
      ? "auto"
      : 1;

    postsSwiper = new Swiper(slider, {
      loop: false,
      slidesPerView: slidesPerView,
      spaceBetween: spaceBetween,
      speed: 1000,
      navigation: {
        nextEl: nextBtn,
        prevEl: prevBtn,
        disabledClass: "blog-posts-nav-button--disabled",
      },
    });
  };

  const destroySlider = (section) => {
    if (!section || !section?.classList.contains("section-blog-posts")) return;

    const slider = section.querySelector(".swiper--blog-posts");
    const slides = section.querySelectorAll(".blog-posts-card");
    const wrapper = section.querySelector(".blog-posts-grid");

    if (!slider || !slides || !slides.length || !wrapper) return;

    slider.classList.remove("swiper");

    slides.forEach((slide) => {
      slide.removeAttribute("style");
      slide.classList.remove("swiper-slide");
    });

    wrapper.classList.remove("swiper-wrapper");

    postsSwiper.destroy(true, true);
    postsSwiper = null;
  };

  const initBlogPosts = (section) => {
    if (!section || !section?.classList.contains("section-blog-posts")) return;

    const slider = section.querySelector(".swiper--blog-posts");

    if (!slider) return;

    const sectionResizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width < 750 && slider) {
          initSlider(slider);
        } else if (postsSwiper) {
          destroySlider(section);
        }
      });
    });

    sectionResizeObserver.observe(section);
  };

  const animateBlogPostCards = (section) => {
    if (
      !section ||
      !section?.classList.contains("section-blog-posts") ||
      !section.querySelector(".animate-on-scroll")
    ) {
      return;
    }

    const blogPostsContainer = section.querySelector(".blog-posts-container");

    if (!blogPostsContainer) return;

    ScrollTrigger.matchMedia({
      "(max-width: 749px)": function () {
        ScrollTrigger.create({
          trigger: blogPostsContainer,
          start: "top 95%",
          end: "bottom top",
          onEnter: () => blogPostsContainer.classList.add("animated"),
        });
      },

      "(min-width: 750px)": function () {
        ScrollTrigger.create({
          trigger: blogPostsContainer,
          start: "top 90%",
          end: "bottom top",
          onEnter: () => blogPostsContainer.classList.add("animated"),
        });
      },
    });
  };

  if (postsSwiper) {
    destroySlider(document.currentScript.parentElement);
  }

  initBlogPosts(document.currentScript.parentElement);
  animateBlogPostCards(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (e) {
    if (postsSwiper) {
      destroySlider(e.target);
    }

    initBlogPosts(e.target);
    animateBlogPostCards(e.target);
  });
})();
