class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", (event) => {
      event.preventDefault();
      const cartItems =
        this.closest("cart-items") || this.closest("cart-drawer-items");
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

if (!customElements.get("cart-remove-button")) {
  customElements.define("cart-remove-button", CartRemoveButton);
}

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById("shopping-cart-line-item-status") ||
      document.getElementById("CartDrawer-LineItemStatus");

    if (document.querySelector(".cart-shipping__progress")) {
      this.minSpend = document.querySelector(".cart-shipping").dataset.minSpend;
      this.minTotal = Math.round(this.minSpend * (Shopify.currency.rate || 1));
      this.cartShipping();
    }

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener("change", debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  cartShipping() {
    if (!document.querySelector(".cart-shipping__progress")) return;
    let progressPrev = getComputedStyle(
      document.querySelector(".cart-shipping__progress-current")
    )?.getPropertyValue("width");
    document.documentElement.style.setProperty("--progress-prev", progressPrev);

    this.total = document.querySelector(".cart-shipping").dataset.total;
    this.progress = (this.total / this.minTotal) * 100;
    if (this.progress > 100) this.progress = 100;

    if (this.minTotal > this.total) {
      let amount = this.minTotal - this.total;
      let message = document
        .querySelector(".cart-shipping")
        .dataset.message.replace("||amount||", formatMoney(amount));
      document.querySelector(".cart-shipping__message_default").innerText =
        message;
      document
        .querySelector(".cart-shipping__message_success")
        .classList.remove("active");
      document
        .querySelector(".cart-shipping__message_default")
        .classList.add("active");
    } else {
      document
        .querySelector(".cart-shipping__message_default")
        .classList.remove("active");
      document
        .querySelector(".cart-shipping__message_success")
        .classList.add("active");
    }

    document.querySelector(".cart-shipping__progress-current").style.width =
      this.progress + "%";
  }

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.cartUpdate,
      (event) => {
        if (event.source === "cart-items") {
          return;
        }
        this.onCartUpdate();
      }
    );

    initButtonsAnimation(this.parentElement);
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute("name")
    );
  }

  onCartUpdate() {
    fetch(`${routes.cart_url}?section_id=main-cart-items`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");
        const sourceQty = html.querySelector("cart-items");
        this.innerHTML = sourceQty.innerHTML;
      })
      .catch((e) => {
        console.error(e);
      });
  }

  getSectionsToRender() {
    return [
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items").dataset.id,
        selector: ".js-contents",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
      {
        id: "cart-live-region-text",
        section: "cart-live-region-text",
        selector: ".shopify-section",
      },
      {
        id: "main-cart-footer",
        section: document.getElementById("main-cart-footer").dataset.id,
        selector: ".js-contents-totals",
      },
      {
        id: "main-cart-shipping",
        section:
          document.getElementById("main-cart-shipping").dataset.id || null,
        selector: ".js-contents-shipping",
      },
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);
    this.querySelectorAll(".quantity__button").forEach((button) =>
      button.classList.add("disabled")
    );

    if (
      document.querySelectorAll(
        '.card--product card__add-to-cart button[name="add"]'
      )
    ) {
      document
        .querySelectorAll(
          '.card--product .card__add-to-cart button[name="add"]'
        )
        .forEach((button) => {
          button.setAttribute("aria-disabled", false);
          if (button.querySelector("span")) {
            button.querySelector("span").classList.remove("hidden");
            button.querySelector(".sold-out-message").classList.add("hidden");
          }
        });
    }

    if (document.querySelector(".cart-shipping__progress")) {
      let progressPrev = getComputedStyle(
        document.querySelector(".cart-shipping__progress-current")
      ).getPropertyValue("width");
      document.documentElement.style.setProperty(
        "--progress-prev",
        progressPrev
      );
    }

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement =
          document.getElementById(`Quantity-${line}`) ||
          document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll(".cart-item");

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute("value");
          this.updateLiveRegions(line, parsedState.errors);

          // dispatch cart:error
          document.dispatchEvent(
            new CustomEvent("cart:error", {
              detail: { line, errors: parsedState.errors },
            })
          );

          return;
        }

        // dispatch line-item:change for the modified element
        document.dispatchEvent(
          new CustomEvent("line-item:change", {
            detail: {
              lineItem: parsedState.items[line - 1] || null,
              cart: parsedState,
            },
          })
        );

        this.classList.toggle("is-empty", parsedState.item_count === 0);

        // dispatch cart:change for the entire basket
        document.dispatchEvent(
          new CustomEvent("cart:change", { detail: { cart: parsedState } })
        );

        const cartDrawerWrapper = document.querySelector("cart-drawer");
        const cartFooter = document.getElementById("main-cart-footer");
        const cartPageWrapper = document.querySelector(".main-cart__wrapper");

        if (cartFooter) {
          cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
        }
        if (cartDrawerWrapper) {
          cartDrawerWrapper.classList.toggle(
            "is-empty",
            parsedState.item_count === 0
          );
        }
        if (cartPageWrapper) {
          cartPageWrapper.classList.toggle(
            "is-empty",
            parsedState.item_count === 0
          );
        }

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document
              .getElementById(section.id)
              .querySelector(section.selector) ||
            document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
        const updatedValue = parsedState.items[line - 1]
          ? parsedState.items[line - 1].quantity
          : undefined;
        let message = "";
        if (
          items.length === parsedState.items.length &&
          updatedValue !== parseInt(quantityElement.value)
        ) {
          if (typeof updatedValue === "undefined") {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace(
              "[quantity]",
              updatedValue
            );
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`CartItem-${line}`) ||
          document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(
                cartDrawerWrapper,
                lineItem.querySelector(`[name="${name}"]`)
              )
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(
            cartDrawerWrapper.querySelector(".drawer__inner-empty"),
            cartDrawerWrapper.querySelector("a")
          );
        } else if (document.querySelector(".cart-item") && cartDrawerWrapper) {
          trapFocus(
            cartDrawerWrapper,
            document.querySelector(".cart-item__name")
          );
        }
        publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
        if (
          document.querySelector("cart-popular-products-slider") &&
          typeof document.querySelector("cart-popular-products-slider").init ===
            "function"
        ) {
          document.querySelector("cart-popular-products-slider").init();
        }
      })
      .catch(() => {
        this.querySelectorAll(".loading-overlay").forEach((overlay) =>
          overlay.classList.add("hidden")
        );
        this.querySelectorAll(".quantity__button").forEach((button) =>
          button.classList.remove("disabled")
        );
        const errors =
          document.getElementById("cart-errors") ||
          document.getElementById("CartDrawer-CartErrors");
        errors.textContent = window.cartStrings.error;

        // dispatch cart:error when fetch fail
        document.dispatchEvent(
          new CustomEvent("cart:error", {
            detail: { errors: window.cartStrings.error },
          })
        );
      })
      .finally(() => {
        this.querySelectorAll(".quantity__button").forEach((button) =>
          button.classList.remove("disabled")
        );
        if (document.querySelector(".cart-shipping__progress")) {
          this.cartShipping();
        }
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) ||
      document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError)
      lineItemError.querySelector(".cart-item__error-text").innerHTML = message;

    this.lineItemStatusElement.setAttribute("aria-hidden", true);

    const cartStatus =
      document.getElementById("cart-live-region-text") ||
      document.getElementById("CartDrawer-LiveRegionText");
    cartStatus.setAttribute("aria-hidden", false);

    setTimeout(() => {
      cartStatus.setAttribute("aria-hidden", true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const cartLine =
      this.querySelector(`#CartItem-${line}`) ||
      this.querySelector(`#CartDrawer-Item-${line}`);
    if (cartLine) {
      cartLine.classList.add("disabled");
      const loadingElement = cartLine.querySelector(".loading-overlay");
      if (loadingElement) loadingElement.classList.remove("hidden");
    }

    const cartFooter =
      document.querySelector(".cart__footer") ||
      document.querySelector(".cart-drawer__footer");
    if (cartFooter) {
      const subtotalValue = cartFooter.querySelector(
        ".totals__subtotal-value > span"
      );
      if (subtotalValue) subtotalValue.classList.add("disabled");
      const loadingElement = cartFooter.querySelector(".loading-overlay");
      if (loadingElement) loadingElement.classList.remove("hidden");
    }

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute("aria-hidden", false);
  }

  disableLoading(line) {
    const cartLine =
      this.querySelector(`#CartItem-${line}`) ||
      this.querySelector(`#CartDrawer-Item-${line}`);
    if (cartLine) {
      cartLine.classList.remove("disabled");
      const loadingElement = cartLine.querySelector(".loading-overlay");
      if (loadingElement) loadingElement.classList.add("hidden");
    }

    const cartFooter =
      document.querySelector(".cart__footer") ||
      document.querySelector(".cart-drawer__footer");
    if (cartFooter) {
      const subtotalValue = cartFooter.querySelector(
        ".totals__subtotal-value > span"
      );
      if (subtotalValue) subtotalValue.classList.remove("disabled");
      const loadingElement = cartFooter.querySelector(".loading-overlay");
      if (loadingElement) loadingElement.classList.add("hidden");
    }
  }
}

if (!customElements.get("cart-items")) {
  customElements.define("cart-items", CartItems);
}

class CartNote extends HTMLElement {
  constructor() {
    super();
    this.spinnerIcon = this.querySelector(".cart__note-loading");
    this.successIcon = this.querySelector(".cart__note-success");
    this.textarea = this.querySelector("textarea");
    this.cartButtons = document.querySelector(".cart__ctas");
    this.drawerButtons = document.querySelector(".cart-drawer__buttons");

    this.textarea.addEventListener(
      "input",
      debounce((event) => {
        if (this.spinnerIcon) this.spinnerIcon.style.display = "flex";
        if (this.successIcon) this.successIcon.style.display = "none";
        if (this.cartButtons) this.cartButtons.style.pointerEvents = "none";
        if (this.cartButtons) this.cartButtons.style.opacity = "0.7";
        if (this.drawerButtons) this.drawerButtons.style.pointerEvents = "none";
        if (this.drawerButtons) this.drawerButtons.style.opacity = "0.7";

        const body = JSON.stringify({ note: event.target.value });

        fetch(`${routes.cart_update_url}`, {
          ...fetchConfig(),
          ...{ body },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            if (this.successIcon) this.successIcon.style.display = "flex";

            setTimeout(() => {
              if (this.successIcon) this.successIcon.style.display = "none";
            }, 2000);
          })
          .catch((error) => {
            console.error(
              "There was a problem with the fetch operation:",
              error
            );
          })
          .finally(() => {
            if (this.spinnerIcon) this.spinnerIcon.style.display = "none";
            if (this.cartButtons) this.cartButtons.removeAttribute("style");
            if (this.drawerButtons) this.drawerButtons.removeAttribute("style");
          });
      }, 500)
    );
  }
}

if (!customElements.get("cart-note")) {
  customElements.define("cart-note", CartNote);
}

class CartPopularProductsSlider extends HTMLElement {
  constructor() {
    super();

    window.addEventListener("load", this.init.bind(this));
  }

  init() {
    const sliderEl = this.querySelector(
      ".cart-popular-products-slider__window"
    );
    if (!sliderEl) return;
    if (sliderEl?.swiper) sliderEl.swiper.destroy();
    if (this.getAttribute("data-cart-is-empty") === "true") return;

    const nextBtn = this.querySelector(
      ".cart-popular-products-slider__button--next"
    );
    const prevBtn = this.querySelector(
      ".cart-popular-products-slider__button--prev"
    );
    const paginationEl = this.querySelector(".swiper-pagination");

    const swiperSettings = {
      slidesPerView: 2,
      spaceBetween: 8,
      speed: 400,
      allowTouchMove: true,
      loop: true,
      loopPreventsSliding: false,
      navigation: {
        nextEl: nextBtn,
        prevEl: prevBtn,
        disabledClass: "swiper-button-disabled",
      },
      pagination: {
        el: paginationEl,
        type: "bullets",
        clickable: true,
      },
    };

    new Swiper(sliderEl, swiperSettings);
  }
}

if (!customElements.get("cart-popular-products-slider")) {
  customElements.define(
    "cart-popular-products-slider",
    CartPopularProductsSlider
  );
}
