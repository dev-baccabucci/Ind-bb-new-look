const sliderInit = (section) => {
  if (!section) return;
  if (
    section.querySelectorAll(".js-media-list") &&
    section.querySelectorAll(".js-media-list").length > 0
  ) {
    section.querySelectorAll(".js-media-list").forEach((elem, index) => {
      const navPrev = section.querySelectorAll(
        ".product__slider-nav .swiper-button-prev"
      );
      const navNext = section.querySelectorAll(
        ".product__slider-nav .swiper-button-next"
      );
      const pagination = section.querySelectorAll(".product__pagination");
      let slider = new Swiper(elem, {
        slidesPerView: 1,
        spaceBetween: 8,
        autoHeight: false,
        speed: 500,
        mousewheel: {
          forceToAxis: true,
        },
        navigation: {
          nextEl: navNext,
          prevEl: navPrev,
        },
        pagination: {
          el: pagination,
          type: "progressbar",
          clickable: true,
        },
        scrollbar: {
           el: '.swiper-scrollbar',
            hide: false,
           },
           breakpoints: {
        0: { // for mobile
        slidesPerView: 1.1, // 1 full + bit of next
        spaceBetween: 10,
        },
        990: {
          speed: 750,
          slidesPerView: 1,
          },
      },
        thumbs: {
          swiper:
            section.querySelectorAll(".js-media-sublist").length > 0
              ? section.querySelectorAll(".js-media-sublist")[index]?.swiper
              : "",
        },
        on: {
          slideChangeTransitionStart: function () {
            if (section.querySelector(".js-media-sublist")) {
              section
                .querySelector(".js-media-sublist")
                .swiper.slideTo(
                  section.querySelector(".js-media-list").swiper.activeIndex
                );
            }
          },
          slideChange: function () {
            window.pauseAllMedia();
            this.params.noSwiping = false;

            if (
              section.querySelectorAll(".js-popup-slider") &&
              section.querySelectorAll(".js-popup-slider").swiper
            ) {
              section
                .querySelectorAll(".js-popup-slider")
                .swiper.slideTo(this.activeIndex);
            }
          },
          slideChangeTransitionEnd: function () {
            if (this.slides[this.activeIndex]?.querySelector("model-viewer")) {
              this.slides[this.activeIndex]
                .querySelector(".shopify-model-viewer-ui__button--poster")
                .removeAttribute("hidden");
            }
          },
          touchStart: function () {
            if (this.slides[this.activeIndex].querySelector("model-viewer")) {
              if (
                !this.slides[this.activeIndex]
                  .querySelector("model-viewer")
                  .classList.contains("shopify-model-viewer-ui__disabled")
              ) {
                this.params.noSwiping = true;
                this.params.noSwipingClass = "swiper-slide";
              } else {
                this.params.noSwiping = false;
              }
            }
          },
        },
      });
    });
  }
};

const subSliderInit = (section) => {
  if (!section) return;
  if (
    section.querySelectorAll(".js-media-sublist") &&
    section.querySelectorAll(".js-media-sublist").length > 0
  ) {
    section.querySelectorAll(".js-media-sublist").forEach((elem) => {
      const sliderDirection = elem.dataset.thumbsDirection || "vertical";
      let subSlider = new Swiper(elem, {
        spaceBetween: 8,
        slidesPerView: "auto",
        direction: "horizontal",
        freeMode: true,
        allowTouchMove: true,
        watchSlidesProgress: true,
        observer: true,
        observeParents: true,
        on: {
          touchEnd: function (s, e) {
            let range = 5;
            let diff = (s.touches.diff = s.isHorizontal()
              ? s.touches.currentX - s.touches.startX
              : s.touches.currentY - s.touches.startY);
            if (diff < range || diff > -range) s.allowClick = true;
          },
        },
        breakpoints: {
          990: {
            slidesPerView: "auto",
            direction: sliderDirection,
          },
        },
      });
    });
  }
};

const popupSliderInit = (section) => {
  const sliderWrapper = document.querySelectorAll(".js-popup-slider");

  if (sliderWrapper) {
    const buttonPrev = document.querySelectorAll(
      ".product-media-modal__slider-nav-prev"
    );
    const buttonNext = document.querySelectorAll(
      ".product-media-modal__slider-nav-next"
    );

    let popupSlider;

    // Zoomed images can leave Swiper's zoom/touch state stuck (a known
    // limitation of the zoom module), which stops the next/prev arrows
    // from responding until the zoom is explicitly cleared. Reset zoom
    // before Swiper's own navigation click handler runs the slide change.
    [buttonPrev, buttonNext].forEach((button) => {
      if (!button) return;
      button.addEventListener("click", () => {
        if (popupSlider && popupSlider.zoom) {
          popupSlider.zoom.out();
          sliderWrapper.classList.remove("zoom");
        }
      });
    });

    popupSlider = new Swiper(sliderWrapper, {
      slidesPerView: 1,
      speed: 500,
      zoom: {
        maxRatio: 2,
      },
      mousewheel: {
        forceToAxis: true,
      },
      navigation: {
        nextEl: buttonNext,
        prevEl: buttonPrev,
      },
      pagination: {
        el: ".product-media-modal .product__pagination",
        type: "bullets",
        clickable: true,
      },
      breakpoints: {
        990: {
          speed: 750,
        },
      },
      on: {
        afterInit: function () {
          section
            .querySelectorAll(".product__media-list .product__media-item")
            .forEach((elem, index) => {
              elem.addEventListener("click", () => {
                if (sliderWrapper.swiper) {
                  sliderWrapper.swiper.slideTo(index, 0);
                  sliderWrapper.swiper.update();
                }
              });
            });
        },

        slideChange: function () {
          window.pauseAllMedia();
          this.params.noSwiping = false;
          sliderWrapper.classList.remove("zoom");
        },
        touchMove: function () {
          sliderWrapper.classList.remove("zoom");
        },
        slideChangeTransitionEnd: function () {
          if (this.slides[this.activeIndex].querySelector("model-viewer")) {
            this.slides[this.activeIndex]
              .querySelector(".shopify-model-viewer-ui__button--poster")
              .removeAttribute("hidden");
          }
        },
        touchStart: function () {
          if (this.slides[this.activeIndex].querySelector("model-viewer")) {
            if (
              !this.slides[this.activeIndex]
                .querySelector("model-viewer")
                .classList.contains("shopify-model-viewer-ui__disabled")
            ) {
              this.params.noSwiping = true;
              this.params.noSwipingClass = "swiper-slide";
            } else {
              this.params.noSwiping = false;
            }
          }
        },
      },
    });
  }
};

if (navigator.userAgent.indexOf("iPhone") > -1) {
  document
    .querySelector("[name=viewport]")
    .setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1"
    );
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute("role", "button");
  summary.setAttribute("aria-expanded", "false");

  if (summary.nextElementSibling.getAttribute("id")) {
    summary.setAttribute("aria-controls", summary.nextElementSibling.id);
  }

  summary.addEventListener("click", (event) => {
    event.currentTarget.setAttribute(
      "aria-expanded",
      !event.currentTarget.closest("details").hasAttribute("open")
    );
  });

  if (summary.closest("header-drawer")) return;
  summary.parentElement.addEventListener("keyup", onKeyUpEscape);
});

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== "ESCAPE") return;

  const openDetailsElement = event.target.closest("details[open]");
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector("summary");
  openDetailsElement.removeAttribute("open");
  summaryElement.setAttribute("aria-expanded", false);
  summaryElement.focus();
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener("focusout", trapFocusHandlers.focusout);
  document.addEventListener("focusin", trapFocusHandlers.focusin);

  elementToFocus?.focus();
}

function pauseAllMedia() {
  document.querySelectorAll(".js-youtube").forEach((video) => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
      "*"
    );
  });
  document.querySelectorAll(".js-vimeo").forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', "*");
  });
  document.querySelectorAll("video").forEach((video) => {
    video.pause();
  });
  document.querySelectorAll("product-model").forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener("focusin", trapFocusHandlers.focusin);
  document.removeEventListener("focusout", trapFocusHandlers.focusout);
  document.removeEventListener("keydown", trapFocusHandlers.keydown);

  if (elementToFocus && !elementToFocus.classList.contains("card-focused"))
    elementToFocus.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    this.querySelectorAll("button").forEach((button) => {
      this.setMinimumDisable();

      button.addEventListener("click", this.onButtonClick.bind(this));
    });

    var eventList = ["paste", "input"];

    for (event of eventList) {
      this.input.addEventListener(event, function (e) {
        const numberRegex = /^0*?[1-9]\d*$/;

        if (
          numberRegex.test(e.currentTarget.value) ||
          e.currentTarget.value === ""
        ) {
          e.currentTarget.value;
        } else {
          e.currentTarget.value = 1;
        }

        if (e.currentTarget.value === 1 || e.currentTarget.value === "") {
          this.previousElementSibling.classList.add("disabled");
        } else {
          this.previousElementSibling.classList.remove("disabled");
        }
      });
    }

    this.input.addEventListener("focusout", function (e) {
      if (e.currentTarget.value === "") {
        e.currentTarget.value = 1;
      }
    });
  }

  setMinimumDisable() {
    if (this.input.value == 1) {
      this.querySelector('button[name="minus"]').classList.add("disabled");
    } else {
      this.querySelector('button[name="minus"]').classList.remove("disabled");
    }
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === "plus" ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);

    this.setMinimumDisable();
  }
}

customElements.define("quantity-input", QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const serializeForm = (form) => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

function fetchConfig(type = "json") {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: `application/${type}`,
    },
  };
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == "undefined") {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options["method"] || "post";
  var params = options["parameters"] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options
) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(
    options["hideElement"] || province_domid
  );

  Shopify.addListener(
    this.countryEl,
    "change",
    Shopify.bind(this.countryHandler, this)
  );

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute("data-default");
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute("data-default");
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    if (!opt) return;
    var raw = opt.getAttribute("data-provinces");
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = "none";
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement("option");
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement("option");
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector("details");
    const summaryElements = this.querySelectorAll("summary");
    this.addAccessibilityAttributes(summaryElements);

    this.headerWrapper = document.querySelector(".header-wrapper");
    if (this.headerWrapper) this.headerWrapper.preventHide = false;

    //if (navigator.platform === "iPhone")
    //  document.documentElement.style.setProperty(
    //    "--viewport-height",
    //    `${window.innerHeight}px`
    //  );

    this.addEventListener("keyup", this.onKeyUp.bind(this));
    this.addEventListener("focusout", this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll("summary").forEach((summary) =>
      summary.addEventListener("click", this.onSummaryClick.bind(this))
    );
    this.querySelectorAll("button").forEach((button) => {
      if (
        this.querySelector(".toggle-scheme-button") === button ||
        this.querySelector(".header__localization-button") === button ||
        this.querySelector(".header__localization-lang-button") === button ||
        button.classList.contains("mobile-facets__footer__button") ||
        button.closest(".mobile-mega-menu__products-card")
      ) {
        return;
      }

      button.addEventListener("click", this.onCloseButtonClick.bind(this));
    });
  }

  addAccessibilityAttributes(summaryElements) {
    summaryElements.forEach((element) => {
      element.setAttribute("role", "button");
      element.setAttribute("aria-expanded", false);
      element.setAttribute("aria-controls", element.nextElementSibling.id);
    });
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;

    const openDetailsElement = event.target.closest("details[open]");
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector("summary"))
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute("open");

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen
        ? this.closeMenuDrawer(summaryElement)
        : this.openMenuDrawer(summaryElement);
    } else {
      trapFocus(
        summaryElement.nextElementSibling,
        detailsElement.querySelector("button")
      );

      setTimeout(() => {
        detailsElement.classList.add("menu-opening");
      });
    }
  }

  openMenuDrawer(summaryElement) {
    if (this.headerWrapper) this.headerWrapper.preventHide = true;
    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });
    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-drawer`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove("menu-opening");
      this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
        details.removeAttribute("open");
        details.classList.remove("menu-opening");
      });
      this.mainDetailsToggle
        .querySelector("summary")
        .setAttribute("aria-expanded", false);
      document.body.classList.remove(`overflow-hidden-drawer`);
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
      if (this.headerWrapper) this.headerWrapper.preventHide = false;
    }
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (
        this.mainDetailsToggle.hasAttribute("open") &&
        !this.mainDetailsToggle.contains(document.activeElement)
      )
        this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest("details");
    if (!detailsElement) return;
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement?.classList.remove("menu-opening");
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute("open");
        if (detailsElement.closest("details[open]")) {
          trapFocus(
            detailsElement.closest("details[open]"),
            detailsElement.querySelector("summary")
          );
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define("menu-drawer", MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
    this.header = document.querySelector(".shopify-section-header");
    this.headerWrapper = document.querySelector(".header-wrapper");
    if (this.headerWrapper) this.headerWrapper.preventHide = false;
  }

  openMenuDrawer(summaryElement) {
    if (this.headerWrapper) this.headerWrapper.preventHide = true;
    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });
    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-drawer`);

    if (this.header.classList.contains("color-background-overlay")) {
      this.header.classList.remove("color-background-overlay");
      this.header.classList.add("color-background-overlay-hidden");
    }
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove("menu-opening");
      this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
        details.removeAttribute("open");
        details.classList.remove("menu-opening");
      });
      this.mainDetailsToggle
        .querySelector("summary")
        .setAttribute("aria-expanded", false);
      document.body.classList.remove(`overflow-hidden-drawer`);
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
      if (this.headerWrapper) this.headerWrapper.preventHide = false;
      if (
        this.header.classList.contains("color-background-overlay-hidden") &&
        !this.header.classList.contains("shopify-section-header-sticky")
      ) {
        this.header.classList.add("color-background-overlay");
        this.header.classList.remove("color-background-overlay-hidden");
      }
    }
  }
}

customElements.define("header-drawer", HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      "click",
      this.hide.bind(this, false)
    );
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ESCAPE") this.hide();
    });
    if (this.classList.contains("media-modal")) {
      this.addEventListener("pointerup", (event) => {
        if (
          event.pointerType === "mouse" &&
          !event.target.closest("deferred-media, product-model")
        )
          this.hide();
      });
    } else {
      this.addEventListener("click", (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector(".template-popup");
    document.body.classList.add("overflow-hidden");
    this.setAttribute("open", "");
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    let isOpen = false;

    this.removeAttribute("open");
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();

    document.querySelectorAll("body > quick-add-modal").forEach((el) => {
      if (el.hasAttribute("open")) {
        isOpen = true;
      }
    });

    if (!isOpen) {
      document.body.classList.remove("overflow-hidden");
      document.body.dispatchEvent(new CustomEvent("modalClosed"));
    }

    const images = document.querySelectorAll(".product-media-modal__content");

    if (images) {
      images.classList.remove("zoom");
    }
  }
}

customElements.define("modal-dialog", ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const modal = document.querySelector(this.getAttribute("data-modal"));
      if (modal) modal.show(button);
    });
  }
}

customElements.define("modal-opener", ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="Deferred-Poster-"]')?.addEventListener(
      "click",
      this.loadContent.bind(this)
    );
    if (this.getAttribute("data-autoplay") === "true") {
      this.loadContent();
    }
  }

  loadContent() {
    if (!this.getAttribute("loaded")) {
      const content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );

      this.setAttribute("loaded", true);
      //window.pauseAllMedia();

      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (
              this.getAttribute("data-autoplay") === "true" &&
              this.closest(".swiper-slide-active")
            ) {
              if (entry.target.nodeName === "VIDEO") {
                let playPromise = entry.target.play();
                if (playPromise !== undefined) {
                  playPromise
                    .then((_) => {})
                    .catch((error) => {
                      console.error("Error playing video:", error);
                    });
                }
              } else if (
                entry.target.nodeName === "IFRAME" &&
                entry.target.contentWindow
              ) {
                if (entry.target.classList.contains("js-youtube")) {
                  entry.target.contentWindow.postMessage(
                    '{"event":"command","func":"playVideo","args":""}',
                    "*"
                  );
                } else {
                  entry.target.contentWindow.postMessage(
                    '{"method":"play"}',
                    "*"
                  );
                }
              }
            }
          } else {
            if (entry.target.nodeName === "VIDEO") {
              entry.target.pause();
            } else if (
              entry.target.nodeName === "IFRAME" &&
              entry.target.contentWindow
            ) {
              if (entry.target.classList.contains("js-youtube")) {
                entry.target.contentWindow.postMessage(
                  '{"event":"command","func":"pauseVideo","args":""}',
                  "*"
                );
              } else {
                entry.target.contentWindow.postMessage(
                  '{"method":"pause"}',
                  "*"
                );
              }
            }
          }
        });
      });

      const deferredElement = this.appendChild(
        content.querySelector("video, model-viewer, iframe")
      );

      if (
        deferredElement.nodeName === "VIDEO" ||
        deferredElement.nodeName === "IFRAME"
      ) {
        videoObserver.observe(deferredElement);
      }

      if (this.closest(".swiper-slide-active")?.querySelector("model-viewer")) {
        const modelViewer = this.closest(".swiper-slide-active").querySelector(
          "model-viewer"
        );

        if (
          !modelViewer.classList.contains("shopify-model-viewer-ui__disabled")
        ) {
          this.closest(".swiper").swiper.params.noSwiping = true;
          this.closest(".swiper").swiper.params.noSwipingClass = "swiper-slide";
        }
      }
    }
  }
}

customElements.define("deferred-media", DeferredMedia);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.updateVariantStatuses();

    // Check if a partial/preview variant exists for media updating (e.g., Color selected)
    const previewVariant = this.getPreviewVariant();
    if (previewVariant?.featured_media) {
      this.updateMedia(
        `${this.dataset.section}-${previewVariant.featured_media.id}`
      );
    }

    // Only enable Add to Cart if an EXACT full variant is selected
    if (!this.currentVariant) {
      this.toggleAddButton(true, window.variantStrings?.selectOption || "Select options");
      this.setUnavailable();
    } else {
      this.toggleAddButton(!this.currentVariant.available, window.variantStrings?.soldOut || "Sold out");
      this.updatePickupAvailability();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
    }
  }

  updateOptions() {
    const fieldsets = Array.from(
      this.querySelectorAll(".product-form__controls--dropdown")
    );

    const selectOptions = Array.from(
      this.querySelectorAll("select"),
      (select) => select.value || null
    );

    const radioOptions = fieldsets.map((fieldset) => {
      const checked = fieldset.querySelector("input:checked");
      return checked ? checked.value : null;
    });

    this.options = selectOptions.concat(radioOptions);
  }

  updateMasterId() {
    if (this.variantData || this.querySelector('[type="application/json"]')) {
      // Must have selected all options (no nulls or empty values)
      const allSelected = this.options.length > 0 && this.options.every((opt) => opt !== null && opt !== "");

      if (!allSelected) {
        this.currentVariant = null;
        return;
      }

      this.currentVariant = this.getVariantData().find((variant) => {
        return variant.options.every((option, index) => this.options[index] === option);
      }) || null;
    }
  }

  // Used strictly for image switching without affecting Add to Cart
  getPreviewVariant() {
    if (this.currentVariant) return this.currentVariant;

    const selectedOptions = this.options;
    return this.getVariantData().find((variant) => {
      return selectedOptions.every((opt, index) => {
        return !opt || opt === variant.options[index];
      });
    });
  }

  isHidden(elem) {
    const styles = window.getComputedStyle(elem);
    return styles.display === "none" || styles.visibility === "hidden";
  }

  updateMedia(mediaId) {
    if (!this.currentVariant || !this.currentVariant?.featured_media) return;
    const currentSection = document.querySelector(
      `[data-section="main-${this.dataset.section}"]`
    );
    this.mediaList = currentSection.querySelector(".product__media-list");
    const activeMedia = this.mediaList.querySelector(
      `[data-media-id="${mediaId}"]`
    );
    this.mediaList.querySelectorAll("[data-media-id]").forEach((element) => {
      element.classList.remove("active");
    });
    if (activeMedia) activeMedia.classList.add("active");

    const swiperWrappers = document.querySelectorAll(".product__media-wrapper");

    swiperWrappers.forEach((elem) => {
      if (!this.isHidden(elem)) {
        const newMedia = elem.querySelector(
          `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
        );

        if (elem.querySelector(".js-media-list")) {
          elem
            .querySelector(".js-media-list")
            .swiper.slideTo(
              elem
                .querySelector(".js-media-list")
                .swiper.slides.indexOf(newMedia)
            );
        }
      }
    });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    window.history.replaceState(
      {},
      "",
      `${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}, #product-countdown-form-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(":checked").value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll(".product-form__controls")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option'),
      ];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(":checked").value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        if (input.tagName === "OPTION") {
          input.innerText = input.getAttribute("value");
        } else if (input.tagName === "INPUT") {
          input.classList.remove("disabled", "always-clickable");
          input.disabled = false;
        }
      } else {
        if (input.tagName === "OPTION") {
          input.innerText =
            window.variantStrings.unavailable_with_option.replace(
              "[value]",
              input.getAttribute("value")
            );
        } else if (input.tagName === "INPUT") {
          input.classList.add("disabled");

          if (this.dataset.unavailableOptionsClickable === "true") {
            input.classList.add("always-clickable");
          } else {
            input.disabled = true;
          }
        }
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }

  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id;
    const sectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;
    fetch(
      `${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    )
      .then((response) => response.text())
      .then((responseText) => {
        // prevent unnecessary ui changes from abandoned selections
        if (this.currentVariant?.id !== requestedVariantId) return;

        const html = new DOMParser().parseFromString(responseText, "text/html");
        const destination = document.getElementById(
          `price-${this.dataset.section}`
        );
        const source = html.getElementById(
          `price-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const skuSource = html.getElementById(
          `Sku-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const skuDestination = document.getElementById(
          `Sku-${this.dataset.section}`
        );
        const inventorySource = html.getElementById(
          `Inventory-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const inventoryDestination = document.getElementById(
          `Inventory-${this.dataset.section}`
        );
        const colorNameSources = html.querySelectorAll(
          `[id^="ColorName-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }"]`
        );
        const colorNameDestinations = document.querySelectorAll(
          `[id^="ColorName-${
            this.dataset.originalSection && !this.closest("quick-add-modal")
              ? this.dataset.originalSection
              : this.dataset.section
          }"]`
        );

        if (source && destination) destination.innerHTML = source.innerHTML;
        if (inventorySource && inventoryDestination)
          inventoryDestination.innerHTML = inventorySource.innerHTML;
        if (skuSource && skuDestination) {
          skuDestination.innerHTML = skuSource.innerHTML;
          skuDestination.classList.toggle(
            "visibility-hidden",
            skuSource.classList.contains("visibility-hidden")
          );
        }
        if (colorNameSources?.length === colorNameDestinations?.length) {
          colorNameDestinations.forEach((colorNameDestination, index) => {
            colorNameDestination.innerHTML = colorNameSources[index].innerHTML;
          });
        }

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove("visibility-hidden");

        if (inventoryDestination)
          inventoryDestination.classList.toggle(
            "visibility-hidden",
            inventorySource.innerText === ""
          );

        this.toggleAddButton(
          !this.currentVariant.available,
          window.variantStrings.soldOut
        );

        // product media
        if (this.dataset?.variantMediaDisplay !== "show_all") {
          const sourceSectionId = this.dataset.originalSection
            ? this.dataset.originalSection
            : this.dataset.section;
          const currentSectionId = this.dataset.section;

          const mediaSource = html.querySelector(
            `[data-section="product-media-${sourceSectionId}"]`
          );
          const mediaDestination = document.querySelector(
            `[data-section="product-media-${currentSectionId}"]`
          );

          if (mediaSource && mediaDestination) {
            mediaDestination.innerHTML = mediaSource.innerHTML;

            const parentQuickView = this.closest("quick-view-modal");
            if (parentQuickView) {
              if (typeof parentQuickView.removeDOMElements === "function") {
                parentQuickView.removeDOMElements(mediaDestination);
              }
              if (typeof parentQuickView.initSlider === "function") {
                parentQuickView.initSlider();
              }
            } else {
              const section = document.getElementById(
                `shopify-section-${currentSectionId}`
              );

              if (section && typeof initProductPage === "function") {
                initProductPage(section);
              }
            }
            if (document.querySelector(".js-media-list")) {
              subSliderInit(true);
              sliderInit(true);
            }
          }
        }
      });
  }

  toggleAddButton(disable = true, text) {
    const productForm = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');

    if (!addButton) return;
    const addButtonText =
      addButton.querySelector(".button__label") ||
      addButton.querySelector("span");

    if (disable) {
      addButton.setAttribute("disabled", "disabled");
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute("disabled");
      addButtonText.textContent = window.variantStrings.addToCart;
    }
  }

  setUnavailable() {
    const button = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    const addButton = button.querySelector('[name="add"]');
    const inventory = document.getElementById(
      `Inventory-${this.dataset.section}`
    );
    const sku = document.getElementById(`Sku-${this.dataset.section}`);

    if (!addButton) return;

    this.toggleAddButton(true, window.variantStrings.unavailable);
    if (inventory) inventory.classList.add("visibility-hidden");
    if (sku) sku.classList.add("visibility-hidden");
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  updateVariantSwatches(html) {
    const currentSectionId = this.dataset.section;
    const sourceSectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    const variantSwatchesSource = html.querySelector(
      `#variant-radios-${sourceSectionId} [data-is-variant-image-swatch]`
    );

    const variantSwatchesDestination = document.querySelector(
      `#variant-radios-${currentSectionId} [data-is-variant-image-swatch]`
    );

    const quickAddModal = this.closest("quick-add-modal");

    if (variantSwatchesSource && variantSwatchesDestination) {
      if (quickAddModal) {
        variantSwatchesDestination.innerHTML =
          variantSwatchesSource.innerHTML.replaceAll(
            sourceSectionId,
            `quickadd-${sourceSectionId}`
          );
      } else {
        variantSwatchesDestination.innerHTML = variantSwatchesSource.innerHTML;
      }
    }
  }
}

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    // Preserve null for unselected option groups (DO NOT .filter out null)
    this.options = fieldsets.map((fieldset) => {
      const checkedInput = fieldset.querySelector("input:checked");
      return checkedInput ? checkedInput.value : null;
    });
  }
}

customElements.define("variant-radios", VariantRadios);

class PasswordViewer {
  constructor() {
    const passwordField = document.querySelectorAll(".field--pass");

    passwordField.forEach((el) => {
      const input = el.querySelector("input");
      const btnWrapper = el.querySelector(".button-pass-visibility");
      const btnOpen = el.querySelector(".icon-eye-close");
      const btnClose = el.querySelector(".icon-eye");

      input.addEventListener("input", () => {
        input.value !== ""
          ? (btnWrapper.style.display = "block")
          : (btnWrapper.style.display = "none");
      });

      btnOpen.addEventListener("click", () => {
        input.type = "text";
        btnOpen.style.display = "none";
        btnClose.style.display = "block";
      });

      btnClose.addEventListener("click", () => {
        input.type = "password";
        btnOpen.style.display = "block";
        btnClose.style.display = "none";
      });
    });
  }
}

// -----------------------------------------------------------------------------
// COLOR SWATCHES START
function generateSrcset(image, widths = []) {
  const imageUrl = new URL(image["src"]);
  return widths
    .filter((width) => width <= image["width"])
    .map((width) => {
      imageUrl.searchParams.set("width", width.toString());
      return `${imageUrl.href} ${width}w`;
    })
    .join(", ");
}

function createImageElement(image, classes, sizes, productTitle) {
  const previewImage = image["preview_image"];
  const newImage = new Image(previewImage["width"], previewImage["height"]);
  newImage.className = classes;
  newImage.alt = image["alt"] || productTitle;
  newImage.sizes = sizes;
  newImage.src = previewImage["src"];
  newImage.srcset = generateSrcset(
    previewImage,
    [165, 360, 533, 720, 940, 1066]
  );
  newImage.loading = "lazy";
  return newImage;
}

function checkSwatches() {
  document.querySelectorAll(".js-color-swatches-wrapper").forEach((wrapper) => {
    wrapper.querySelectorAll(".js-color-swatches input").forEach((input) => {
      input.addEventListener("click", (event) => {
        const primaryImage = wrapper.querySelector(".media--first");
        const secondaryImage = wrapper.querySelector(".media--second");
        const handleProduct = wrapper.dataset.product;

        if (event.currentTarget.checked && primaryImage) {
          wrapper
            .querySelector(".js-color-swatches-link")
            .setAttribute("href", event.currentTarget.dataset.variantLink);
          if (wrapper.querySelector('.card__add-to-cart button[name="add"]')) {
            wrapper
              .querySelector('.card__add-to-cart button[name="add"]')
              .setAttribute("aria-disabled", false);
            if (
              wrapper.querySelector(
                '.card__add-to-cart button[name="add"] > span'
              )
            ) {
              wrapper
                .querySelector('.card__add-to-cart button[name="add"] > span')
                .classList.remove("hidden");
              wrapper
                .querySelector(
                  '.card__add-to-cart button[name="add"] .sold-out-message'
                )
                .classList.add("hidden");
            }
            wrapper.querySelector('.card__add-to-cart input[name="id"]').value =
              event.currentTarget.dataset.variantId;
          }
          const currentColor = event.currentTarget.value;
          const currentVariantId = event.currentTarget.dataset?.variantId;

          fetch(`${window.Shopify.routes.root}products/${handleProduct}.js`)
            .then((response) => response.json())
            .then((product) => {
              const variant = product.variants.find(
                (item) =>
                  (currentVariantId &&
                    item.id == currentVariantId &&
                    item.featured_media != null &&
                    item.options.includes(currentColor)) ||
                  (!currentVariantId &&
                    item.featured_media != null &&
                    item.options.includes(currentColor))
              );

              if (variant) {
                const newPrimaryImage = createImageElement(
                  variant["featured_media"],
                  primaryImage.className,
                  primaryImage.sizes,
                  product.title
                );

                if (newPrimaryImage.src !== primaryImage.src) {
                  let flag = false;
                  if (secondaryImage) {
                    const secondaryImagePathname = new URL(secondaryImage.src)
                      .pathname;
                    const newPrimaryImagePathname = new URL(newPrimaryImage.src)
                      .pathname;

                    if (secondaryImagePathname === newPrimaryImagePathname) {
                      primaryImage.remove();
                      secondaryImage.classList.remove("media--second");
                      secondaryImage.classList.add("media--first");
                      flag = true;
                    }
                  }
                  if (!flag) {
                    primaryImage.style.transition = "opacity 200ms ease-in-out";
                    primaryImage.style.opacity = "0";
                    setTimeout(() => {
                      primaryImage.replaceWith(newPrimaryImage);
                      newPrimaryImage.style.opacity = "0";
                      newPrimaryImage.style.transition =
                        "opacity 200ms ease-in-out";
                      newPrimaryImage.offsetHeight;
                      newPrimaryImage.style.opacity = "1";
                      if (secondaryImage) {
                        secondaryImage.remove();
                      }
                    }, 200);
                  }
                }
              }
            })
            .catch(() => {});
        }
      });
    });
  });
}

// func reused in other places
function colorSwatches() {
  checkSwatches();

  document.addEventListener("shopify:section:load", function () {
    checkSwatches();
  });
}

(function () {
  colorSwatches();
})();

// COLOR SWATCHES END
// -----------------------------------------------------------------------------

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();

    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      if (this.querySelector(".product-recommendations__loading")) {
        this.querySelector(".product-recommendations__loading").classList.add(
          "loading"
        );
        this.querySelector(".product-recommendations__loading").style.display =
          "flex";
      }

      this.recommendationsSlider = null;

      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          const recommendations = html.querySelector("product-recommendations");
          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }

          checkSwatches();

          const addClasses = (slider) => {
            const sliderWrapper = slider.querySelector(
              ".product-recommendations__list"
            );
            const slides = slider.querySelectorAll(
              ".product-recommendations__item"
            );

            slider.classList.add("swiper");
            if (sliderWrapper) sliderWrapper.classList.add("swiper-wrapper");

            slides.forEach((slide) => {
              slide.classList.add("swiper-slide");
            });
          };

          const removeClasses = (slider) => {
            const sliderWrapper = slider.querySelector(
              ".product-recommendations__list"
            );
            const slides = slider.querySelectorAll(
              ".product-recommendations__item"
            );

            slider.classList.remove("swiper");
            if (sliderWrapper) sliderWrapper.classList.remove("swiper-wrapper");

            slides.forEach((slide) => {
              slide.removeAttribute("style");
              slide.classList.remove("swiper-slide");
            });
          };

          const initSlider = (settings) => {
            const slider = this.querySelector(".js-recommendation-swiper");

            if (!slider) return;
            const mobSlidesPreView = slider.classList.contains(
              "js-recommendation-swiper--visible-overflow"
            )
              ? "auto"
              : 1;

            const sliderSettings = {
              slidesPerView: mobSlidesPreView,
              spaceBetween: 16,
              speed: 800,
              mousewheel: {
                forceToAxis: true,
              },
              allowTouchMove: true,
              navigation: {
                nextEl: slider.querySelector(".swiper-button-next"),
                prevEl: slider.querySelector(".swiper-button-prev"),
                disabledClass: "swiper-button-disabled",
              },
            };

            const scrollbarSettings = {
              slidesPerView: 1,
              spaceBetween: 16,
              mousewheel: {
                forceToAxis: true,
              },
              speed: 400,
              allowTouchMove: true,
              breakpoints: {
                576: {
                  slidesPerView: 2,
                },
                990: {
                  slidesPerView: 3,
                },
                1440: {
                  slidesPerView: 4,
                },
              },
              scrollbar: {
                el: slider.querySelector(".swiper-scrollbar"),
                grabCursor: true,
                draggable: true,
                hide: false,
              },
            };
            if (slider) {
              addClasses(slider);

              this.recommendationsSlider = new Swiper(
                slider,
                settings === "scrollbar" ? scrollbarSettings : sliderSettings
              );
            }
          };

          const destroySlider = () => {
            const slider = this.querySelector(".js-recommendation-swiper");

            if (slider) {
              removeClasses(slider);
              this.recommendationsSlider.destroy(true, true);
              this.recommendationsSlider = null;
            }
          };

          const initSection = () => {
            const resizeObserver = new ResizeObserver((entries) => {
              const [entry] = entries;
              if (entry.contentRect.width < 576) {
                if (this.recommendationsSlider) destroySlider();
                initSlider("slider");
              } else {
                if (this.recommendationsSlider) destroySlider();
                initSlider("scrollbar");
              }
            });

            const sectionOuter = this.closest(
              ".product-recommendations__outer"
            );
            const slider = this.querySelector(".js-recommendation-swiper");

            if (sectionOuter && slider) {
              resizeObserver.observe(sectionOuter);
            }
          };

          initSection();

          // Initialize buttons animations (global function initButtonsAnimation in global.js)
          initButtonsAnimation(this);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          if (this.querySelector(".product-recommendations__loading")) {
            this.querySelector(
              ".product-recommendations__loading"
            ).classList.remove("loading");
            this.querySelector(".product-recommendations__loading").remove();
          }
        });
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 400px 0px",
    }).observe(this);
  }
}

customElements.define("product-recommendations", ProductRecommendations);

function formatMoney(cents, format = "") {
  if (typeof cents === "string") {
    cents = cents.replace(".", "");
  }

  cents = parseInt(cents, 10);

  let value = "";
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = format || theme.moneyFormat;

  function formatWithDelimiters(
    number,
    precision = 2,
    thousands = ",",
    decimal = "."
  ) {
    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split(".");
    const dollarsAmount = parts[0].replace(
      /(\d)(?=(\d{3})+(?!\d))/g,
      `$1${thousands}`
    );
    const centsAmount = precision > 0 ? decimal + parts[1] : "";

    return dollarsAmount + centsAmount;
  }

  const match = formatString.match(placeholderRegex);
  const formatType = match ? match[1] : "amount";

  switch (formatType) {
    case "amount":
      value = formatWithDelimiters(cents, 2, ",", ".");
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0, ",", ".");
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
    case "amount_with_apostrophe_separator":
      value = formatWithDelimiters(cents, 2, "'", ".");
      break;
    case "amount_no_decimals_with_space_separator":
      value = formatWithDelimiters(cents, 0, " ", ".");
      break;
    case "amount_with_space_separator":
      value = formatWithDelimiters(cents, 2, " ", ",");
      break;
    case "amount_with_period_and_space_separator":
      value = formatWithDelimiters(cents, 2, " ", ".");
      break;
    default:
      value = formatWithDelimiters(cents, 2, ",", ".");
  }

  return formatString.replace(placeholderRegex, value);
}
class LocalizationForm extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      input: this.querySelector(
        'input[name="locale_code"], input[name="country_code"]'
      ),
      button: this.querySelector("button"),
      panel: this.querySelector("ul"),
    };

    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.elements.button.addEventListener("click", this.togglePanel.bind(this));
    this.addEventListener("keydown", this.onEscapePress.bind(this));

    this.querySelectorAll("a").forEach((item) =>
      item.addEventListener("click", this.onItemClick.bind(this))
    );
  }

  connectedCallback() {
    document.addEventListener("click", this.handleDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleDocumentClick);
  }

  handleDocumentClick(event) {
    if (!this.contains(event.target)) {
      this.hidePanel();
    }
  }

  hidePanel() {
    this.elements.button.setAttribute("aria-expanded", "false");
    this.elements.panel.setAttribute("hidden", true);
  }

  showPanel() {
    this.elements.button.setAttribute("aria-expanded", "true");
    this.elements.panel.removeAttribute("hidden");
  }

  togglePanel() {
    if (this.elements.button.getAttribute("aria-expanded") === "true") {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  onEscapePress(event) {
    if (event.key === "Escape") {
      this.hidePanel();
    }
  }

  onItemClick(event) {
    event.preventDefault();
    this.elements.input.value = event.currentTarget.dataset.value;
    this.querySelector("form")?.submit();
    this.hidePanel();
  }
}

if (!customElements.get("localization-form")) {
  customElements.define("localization-form", LocalizationForm);
}

// BUTTON ANIMATION CODE START
// -----------------------------------------------------------------------------

function initButtonsAnimation(parent) {
  if (!parent) return;
  const initButton = (button) => {
    const circle = button.querySelector(".animated-button-circle");

    const fillEffect = (e) => {
      const rect = button.getBoundingClientRect(),
        i = e.clientY - rect.top,
        s = e.clientX - rect.left,
        r = i / rect.height,
        n = s / rect.width;

      circle.style.transformOrigin = 100 * n + "% " + 100 * r + "%";
    };

    if (circle) {
      button.addEventListener("mouseenter", fillEffect);
      button.addEventListener("mouseleave", fillEffect);
    }
  };

  const buttons = parent.querySelectorAll(
    ".button--primary, .button--secondary, .button--transparent, .customer .button--primary, .customer .button--secondary, .customer .button--transparent, .products-tabs__tab"
  );

  if (buttons.length) {
    buttons.forEach((button) => {
      initButton(button);
    });
  }
}

initButtonsAnimation(document);

// BUTTON ANIMATION CODE END
// -----------------------------------------------------------------------------

// SLIDE UP, SLIDE DOWN
// -----------------------------------------------------------------------------
function slideUp(toggleEl, contentEl, duration = 300) {
  // Get the current height of the element
  const height = contentEl.clientHeight;

  // Set animation styles
  contentEl.style.transitionProperty = "height, margin, padding";
  contentEl.style.transitionDuration = duration + "ms";
  contentEl.style.overflow = "hidden";

  // Set initial values
  contentEl.style.height = height + "px";
  contentEl.style.padding = "0";
  contentEl.style.margin = "0";

  // Delay to start animation
  setTimeout(function () {
    // Set the values ​​for hiding the element
    contentEl.style.height = "0";
    contentEl.style.padding = "0";
    contentEl.style.margin = "0";
  }, 10);

  // Delay for animation to complete
  setTimeout(function () {
    // Remove installed styles after animation
    toggleEl.classList.remove("active");
    contentEl.classList.remove("active");
    contentEl.style.removeProperty("height");
    contentEl.style.removeProperty("padding");
    contentEl.style.removeProperty("margin");
    contentEl.style.removeProperty("overflow");
    contentEl.style.removeProperty("transition-duration");
    contentEl.style.removeProperty("transition-property");
  }, duration);
}

function slideDown(toggleEl, contentEl, duration = 300) {
  toggleEl.classList.add("active");
  contentEl.classList.add("active");
  contentEl.style.overflow = "hidden";
  contentEl.style.height = "0";

  const height = contentEl.scrollHeight;

  setTimeout(function () {
    contentEl.style.height = height + "px";
  }, 10);

  setTimeout(function () {
    contentEl.style.removeProperty("overflow");
    contentEl.style.removeProperty("height");
  }, duration);
}

// SLIDE UP, SLIDE DOWN END
// -----------------------------------------------------------------------------

// CUSTOM ELEMENTS ON PRODUCT PAGE START
// -----------------------------------------------------------------------------

function selectDropDown() {
  const dropdownElements = document.querySelectorAll(
    ".product-form__controls--dropdown:not([data-initialized])"
  );

  dropdownElements.forEach((element) => {
    element.setAttribute("data-initialized", "true");

    const elItem = element.querySelector(".dropdown-select .select-wrapper");
    const elList = element.querySelector(".dropdown-select ul");
    const elListItem = element.querySelectorAll(".dropdown-select ul li");
    const selectedText = element.querySelector(
      ".dropdown-select .select-label"
    );
    const shadowTop = elItem?.querySelector(".shadow-top");
    const shadowBottom = elItem?.querySelector(".shadow-bottom");

    const updateShadows = () => {
      if (!elList) return;
      shadowTop?.classList.toggle("show", elList.scrollTop > 0);
      shadowBottom?.classList.toggle(
        "show",
        elList.scrollTop + elList.clientHeight < elList.scrollHeight - 5
      );
    };

    elList.addEventListener("scroll", updateShadows);

    selectedText.addEventListener("click", function (e) {
      e.stopPropagation();
      const isActive = elItem.classList.contains("active");
      closeDropdowns(isActive ? null : elItem);
      elItem.classList.toggle("active", !isActive);
      if (!isActive) updateShadows();
    });

    selectedText.addEventListener("dblclick", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    elItem.addEventListener("click", (e) => e.stopPropagation());

    elListItem.forEach((li) => {
      li.addEventListener("click", function (e) {
        const closestLi = e.target.closest("li");
        const disabledOption = closestLi.querySelector(
          "input.disabled:not(.always-clickable)"
        );

        if (disabledOption || !selectedText.querySelector("span")) return;
        selectedText.querySelector("span").textContent =
          closestLi.dataset.value;
        selectedText.style.setProperty(
          "--swatch-color",
          closestLi.dataset.color
        );
        elItem.classList.remove("active");
        document.activeElement.blur();
      });
    });
  });
}

function closeDropdowns(exceptElement = null) {
  document
    .querySelectorAll(".dropdown-select .select-wrapper.active")
    .forEach((el) => {
      if (el !== exceptElement) el.classList.remove("active");
    });
}

document.addEventListener("click", () => closeDropdowns());

document.addEventListener("DOMContentLoaded", function () {
  selectDropDown();
});

document.addEventListener("shopify:section:load", function () {
  selectDropDown();
});

class ProductAdditionalService extends HTMLElement {
  static selectedServices = [];

  constructor() {
    super();
    this.sectionId = this.dataset.sectionId;
    this.variantId = this.dataset.serviceProductVariantId;
    this.mainProductTitle = this.dataset.mainProductTitle;

    this.productInfo = this.closest(`#ProductInfo-${this.sectionId}`);
    this.dynamicBtns = this.productInfo?.querySelector(
      ".product-form__checkout"
    );

    this.checkbox = this.querySelector("input[type='checkbox']");
    this.checkbox?.addEventListener("change", this.onSelect.bind(this));
  }

  onSelect(event) {
    event.preventDefault();
    const propertyName =
      window.cartStrings?.additional_service_property || "Added with";

    if (this.checkbox.checked) {
      if (
        !ProductAdditionalService.selectedServices.some(
          (item) => item.id === this.variantId
        )
      ) {
        ProductAdditionalService.selectedServices.push({
          id: this.variantId,
          quantity: 1,
          properties: {
            [`${propertyName}`]: this.mainProductTitle,
          },
        });
      }
    } else {
      ProductAdditionalService.selectedServices =
        ProductAdditionalService.selectedServices.filter(
          (item) => item.id !== this.variantId
        );
    }

    if (this.dynamicBtns) {
      this.dynamicBtns.classList.toggle(
        "disabled",
        ProductAdditionalService.selectedServices.length > 0
      );
    }
  }

  getItems(formData) {
    if (!formData || ProductAdditionalService.selectedServices.length === 0) {
      return;
    }

    const mainItemId = formData.get("id");
    const mainItemQuantity = formData.get("quantity");
    if (!mainItemId || !mainItemQuantity) return;

    const additionalItems = ProductAdditionalService.selectedServices.map(
      (service) => {
        return {
          id: service.id,
          quantity: service.quantity,
          properties: service.properties,
        };
      }
    );

    const mainProperties = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("properties[")) {
        const cleanKey = key.replace(/^properties\[(.*?)\]$/, "$1");
        mainProperties[cleanKey] = value;
      }
    }

    return [
      ...additionalItems,
      {
        id: mainItemId,
        quantity: mainItemQuantity,
        properties: mainProperties,
      },
    ];
  }

  clearItems() {
    ProductAdditionalService.selectedServices = [];
  }
}

if (!customElements.get("product-additional-service")) {
  customElements.define("product-additional-service", ProductAdditionalService);
}

// CUSTOM ELEMENTS ON PRODUCT PAGE END
// -----------------------------------------------------------------------------


// CART REFRESH EVENT
// -----------------------------------------------------------------------------

document.documentElement.addEventListener("cart:refresh", () => {
  const sectionsToUpdate = [
    { id: "cart-count-bubble", selector: "#cart-icon-bubble" },
    { id: "cart-drawer", selector: "#CartDrawer" },
    { id: "main-cart-items", selector: ".cart-items-wrapper" },
    { id: "main-cart-footer", selector: ".cart__footer" },
    { id: "main-cart-shipping", selector: ".cart-shipping" },
  ];

  sectionsToUpdate.forEach((section) => {
    fetch(`${routes.cart_url}?section_id=${section.id}`)
      .then((response) => response.text())
      .then((html) => {
        const parsedHTML = new DOMParser().parseFromString(html, "text/html");
        const sourceSection = parsedHTML.querySelector(section.selector);
        const destinationSection = document.querySelector(section.selector);
        if (sourceSection && destinationSection) {
          destinationSection.innerHTML = sourceSection.innerHTML;
        }
      })
      .catch((e) => console.error(`Error updating ${section.id}:`, e));
  });
});

// CART REFRESH EVENT END
// -----------------------------------------------------------------------------


document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('nativeShareBtn');
  const fallbackMsg = document.getElementById('shareFallbackMsg');

  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const productUrl = shareBtn.getAttribute('data-url');
    const productTitle = shareBtn.getAttribute('data-title');

    // Check if the browser supports the native Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          url: productUrl
        });
        console.log('Product shared successfully via native UI');
      } catch (err) {
        // User cancelled the share or an error occurred
        console.log('Sharing cancelled or failed:', err);
      }
    } else {
      // Fallback: Copy to Clipboard for unsupported browsers (mostly older desktops)
      try {
        await navigator.clipboard.writeText(productUrl);
        
        // Show success message
        fallbackMsg.classList.add('is-visible');
        
        // Hide message after 3 seconds
        setTimeout(() => {
          fallbackMsg.classList.remove('is-visible');
        }, 3000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  });
});