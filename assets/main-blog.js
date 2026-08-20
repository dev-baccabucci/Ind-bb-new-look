(function () {
  const initSlider = (section) => {
    if (!section || !section?.classList.contains("section-main-blog")) return;

    const slider = section.querySelector(".main-blog__slider");

    if (slider) {
      const pagination = section.querySelector(".main-blog__slider-pagination");

      let swiperParams = {
        loop: true,
        speed: 800,
        pagination: {
          el: pagination,
          type: "bullets",
          clickable: true,
        },
      };

      if (slider.getAttribute("data-autoplay") === "true") {
        swiperParams.autoplay = {
          disableOnInteraction: true,
        };
      }

      const changeColorScheme = (swiper) => {
        const activeIndex = swiper.activeIndex;
        const activeSlide = swiper.slides[activeIndex];
        const colorScheme = activeSlide.dataset.colorScheme;

        const changeItems = [swiper.pagination.el];

        changeItems.forEach((item) => {
          if (item) {
            let classNames = item.getAttribute("class");
            classNames = classNames.replace(/color-background-\d+/g, "");
            item.setAttribute("class", classNames);
            item.classList.add(colorScheme);
          }
        });
      };

      const featuredPostsSwiper = new Swiper(slider, swiperParams);

      changeColorScheme(featuredPostsSwiper);
      featuredPostsSwiper.on("beforeTransitionStart", function () {
        changeColorScheme(featuredPostsSwiper);
      });
    }
  };

  initSlider(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSlider(event.target);
  });
})();

class BlogTagFilter extends HTMLElement {
  constructor() {
    super();

    this.selectorPostsContainer = ".main-blog-posts-container";
    this.selectorTagsContainer = ".main-blog__tag-filter-items";
    this.selectorBreadcrumbs = "#breadcrumbs";

    this.postsContainer = document.querySelector(this.selectorPostsContainer);
    this.tagsContainer = document.querySelector(this.selectorTagsContainer);
    this.breadcrumbs = document.querySelector(this.selectorBreadcrumbs);
    this.cachedData = {};

    this.onTagClick = this.onTagClick.bind(this);
    this.addEventListeners(
      this.querySelectorAll(".main-blog__tag-filter-link")
    );
  }

  addEventListeners(tags) {
    tags.forEach((tag) => tag.addEventListener("click", this.onTagClick));
  }

  onTagClick(event) {
    event.preventDefault();
    const tag = event.currentTarget;
    if (!tag.classList.contains("main-blog__tag-filter-link")) return;
    const url = tag.getAttribute("data-url");
    this.renderPage(url);
  }

  renderPage(url) {
    if (this.cachedData[url]) {
      this.renderSectionFromCache(url);
      return;
    }

    this.renderSectionFromFetch(url);
  }

  renderSectionFromFetch(url) {
    this.postsContainer.classList.add("loading");
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error. Status: ${response.status}`);
        }
        return response.text();
      })
      .then((responseText) => {
        const html = responseText;
        this.cachedData = {
          ...this.cachedData,
          [url]: html,
        };
        this.renderBreadcrumbs(html);
        this.renderFilters(html);
        this.renderBlogContainer(html);
        this.updateBrowserUrl(url);
      })
      .catch((error) => {
        console.error("Error loading blog posts:", error);
      })
      .finally(() => {
        this.postsContainer.classList.remove("loading");
      });
  }

  renderSectionFromCache(url) {
    const html = this.cachedData[url];
    this.renderBreadcrumbs(html);
    this.renderFilters(html);
    this.renderBlogContainer(html);
    this.updateBrowserUrl(url);
  }

  renderBreadcrumbs(html) {
    if (!this.breadcrumbs) return;
    this.breadcrumbs.innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(this.selectorBreadcrumbs).innerHTML;
  }

  renderFilters(html) {
    if (!this.tagsContainer) return;
    this.tagsContainer.innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(this.selectorTagsContainer).innerHTML;

    this.addEventListeners(
      this.querySelectorAll(".main-blog__tag-filter-link")
    );
  }

  renderBlogContainer(html) {
    if (!this.postsContainer) return;
    this.postsContainer.innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(this.selectorPostsContainer).innerHTML;
    if (
      document.querySelector(".js-load-more") ||
      document.querySelector(".js-infinite-scroll")
    ) {
      loadMore();
    }
  }

  updateBrowserUrl(path) {
    window.history.pushState({}, "", path);
  }
}

if (!customElements.get("blog-tag-filter")) {
  customElements.define("blog-tag-filter", BlogTagFilter);
}
