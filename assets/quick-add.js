if (!customElements.get("quick-add-modal")) {
  customElements.define(
    "quick-add-modal",
    class QuickAddModal extends ModalDialog {
      constructor() {
        super();
        this.modalContent = this.querySelector('[id^="QuickAddInfo-"]');

        window.addEventListener("keyup", (evt) => {
          if (evt.code === "Escape" && this.classList.contains("active")) {
            this.hide();
          }
        });

        window.addEventListener("resize", () => {
          this.modalContent
            .querySelectorAll(".js-media-list")
            .forEach((element) => {
              element.swiper?.destroy();
            });
          this.modalContent
            .querySelectorAll(".js-media-sublist")
            .forEach((element) => {
              element.swiper?.destroy();
            });

          setTimeout(() => {
            subSliderInit(this.modalContent, true);
            sliderInit(this.modalContent, true);
          }, 200);
        });
      }

      hide(preventFocus = false) {
        this.modalContent.innerHTML = "";

        this.modalContent
          .querySelectorAll(".js-media-list")
          .forEach(function () {
            this.swiper?.destroy();
          });
        this.modalContent
          .querySelectorAll(".js-media-sublist")
          .forEach(function () {
            this.swiper?.destroy();
          });

        subSliderInit(this.modalContent, true);
        sliderInit(this.modalContent, true);

        if (preventFocus) this.openedBy = null;

        this.classList.remove("active");
        super.hide();

        this.addEventListener(
          "transitionend",
          () => {
            this.openedBy?.closest(".card__links").nextElementSibling.focus();
          },
          { once: true }
        );
      }

      show(opener) {
        opener.setAttribute("aria-disabled", true);
        opener.classList.add("loading");
        const spinner = opener.querySelector(".loading-overlay__spinner");
        if (spinner) {
          spinner.classList.remove("hidden");
        }

        fetch(opener.getAttribute("data-product-url"))
          .then((response) => response.text())
          .then((responseText) => {
            const responseHTML = new DOMParser().parseFromString(
              responseText,
              "text/html"
            );
            this.productElement = responseHTML.querySelector(
              'section[id^="MainProduct-"]'
            );
            this.preventDuplicatedIDs();
            this.removeDOMElements();
            this.setInnerHTML(
              this.modalContent,
              this.productElement.innerHTML,
              opener
            );

            if (window.Shopify && Shopify.PaymentButton) {
              Shopify.PaymentButton.init();
            }

            if (window.ProductModel) window.ProductModel.loadShopifyXR();

            this.updateImageSizes();
            this.preventVariantURLSwitching();
            setTimeout(() => {
              this.classList.add("active");
            });
            super.show(opener);

            this.addEventListener(
              "transitionend",
              () => {
                const containerToTrapFocusOn = this;
                const focusElement = this.querySelector(
                  ".quick-add-modal__content"
                );
                trapFocus(containerToTrapFocusOn, focusElement);
              },
              { once: true }
            );
          })
          .finally(() => {
            opener.removeAttribute("aria-disabled");
            opener.classList.remove("loading");

            if (opener.querySelector(".loading-overlay__spinner")) {
              opener
                .querySelector(".loading-overlay__spinner")
                .classList.add("hidden");
            }

            this.modalContent
              .querySelectorAll(".js-media-list")
              .forEach((element) => {
                element.swiper?.destroy();
              });

            this.modalContent
              .querySelectorAll(".js-media-sublist")
              .forEach((element) => {
                element.swiper?.destroy();
              });

            subSliderInit(this.modalContent, true);
            sliderInit(this.modalContent, true);

            selectDropDown();
            this.initProductAccordion();
            this.setScrollClass(this.modalContent);
          });
      }

      setInnerHTML(element, html, opener) {
        element.innerHTML = html;
        // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
        element.querySelectorAll("script").forEach((oldScriptTag) => {
          const newScriptTag = document.createElement("script");
          Array.from(oldScriptTag.attributes).forEach((attribute) => {
            newScriptTag.setAttribute(attribute.name, attribute.value);
          });
          newScriptTag.appendChild(
            document.createTextNode(oldScriptTag.innerHTML)
          );
          oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
        });

        // Read more button
        const moreBtn = document.createElement("a");
        moreBtn.innerHTML = `<span>${theme.quickviewMore}</span>`;
        moreBtn.setAttribute("href", opener.getAttribute("data-product-url"));
        moreBtn.setAttribute(
          "class",
          "product__full-details button button--underline"
        );
        if (
          element.querySelectorAll(".product__info-column") &&
          element.querySelectorAll(".product__info-column").length > 0
        ) {
          element.querySelector(".product-form__buttons").appendChild(moreBtn);
        } else {
          element.querySelector(".product-form__buttons").appendChild(moreBtn);
        }

        // Initialize buttons animations (global function initButtonsAnimation in global.js)
        initButtonsAnimation(element);
      }
      calcContainerHeight(element) {
        const topHeigh = this.querySelector(
          ".quick-add-modal__top"
        ).clientHeight;
        const buyBlockHeight = element.querySelector(
          ".product__buy-buttons"
        )?.clientHeight;
        element.style.height = `calc(100% - ${
          topHeigh + buyBlockHeight + 4
        }px)`;
      }

      toggleScrollClass(element) {
        const infoContainer = element?.querySelector(
          ".product__info-container"
        );

        const baseHeight = element.getBoundingClientRect().height;
        const productMedia = element.querySelector(".product__main");
        if (!productMedia || !infoContainer || !baseHeight) return;
        const productMediaType = productMedia.dataset.imageType;
        const heightRatio =
          productMediaType === "portrait"
            ? 1.266
            : productMediaType === "landscape"
            ? 0.75
            : 1;
        const imageHeight = productMedia.clientWidth * heightRatio;

        const toShowHeight = baseHeight - 16 - imageHeight;

        if (infoContainer.scrollHeight > toShowHeight) {
          element.classList.add("has-scroll");
        } else {
          element.classList.remove("has-scroll");
        }
      }

      setScrollClass(element) {
        const resizeObserver = new ResizeObserver((entries) => {
          const [entry] = entries;

          const dialog = entry.target.querySelector(
            ".quick-add-modal__content-info"
          );
          if (dialog) {
            this.calcContainerHeight(element);
            this.toggleScrollClass(dialog);
          }
        });

        if (element) {
          resizeObserver.observe(this);
        }
      }

      initProductAccordion() {
        const toggles = this.querySelectorAll(".about__accordion-toggle");

        toggles.forEach((toggle) => {
          toggle.addEventListener("click", (event) => {
            event.preventDefault();
            const description = toggle.nextElementSibling?.classList.contains(
              "about__accordion-description"
            )
              ? toggle.nextElementSibling
              : toggle.previousElementSibling?.classList.contains(
                  "about__accordion-description"
                )
              ? toggle.previousElementSibling
              : null;

            if (description) {
              if (!toggle.classList.contains("active")) {
                slideDown(toggle, description, 300); // func in global.js
              } else {
                slideUp(toggle, description, 300); // func in global.js
              }
            }
          });
        });
      }

      removeDOMElements() {
        const descriptionWrapper = this.productElement.querySelector(
          ".product__description-wrapper"
        );
        const popup = this.productElement.querySelectorAll(".product-popup");
        if (popup)
          popup.forEach((el) => {
            el.remove();
          });

        const shareButtons =
          this.productElement.querySelector(".share-buttons");
        if (shareButtons) shareButtons.remove();

        const sku = this.productElement.querySelector(".product__sku");
        if (sku) sku.remove();

        const breadcrumb = this.productElement.querySelector(".breadcrumb");

        if (breadcrumb) breadcrumb.remove();

        const tags = this.productElement.querySelector(".product-tags");
        if (tags) tags.remove();

        const countdown =
          this.productElement.querySelector(".product-countdown");
        if (countdown) countdown.remove();

        const bigProductModal =
          this.productElement.querySelector("product-modal");
        if (bigProductModal) bigProductModal.remove();

        const pickupAvailability = this.productElement.querySelector(
          ".pickup-availability"
        );
        if (pickupAvailability) pickupAvailability.remove();

        const iconWithTexts = this.productElement.querySelectorAll(
          ".product__text-icons"
        );
        if (iconWithTexts)
          iconWithTexts.forEach((el) => {
            el.remove();
          });

        const recommendations = this.productElement.querySelector(
          ".product-recommendations"
        );
        if (recommendations) recommendations.remove();
      }

      preventDuplicatedIDs() {
        const sectionId = this.productElement.dataset.section;
        this.productElement.innerHTML =
          this.productElement.innerHTML.replaceAll(
            sectionId,
            `quickadd-${sectionId}`
          );
        this.productElement
          .querySelectorAll("variant-selects, variant-radios")
          .forEach((variantSelect) => {
            variantSelect.dataset.originalSection = sectionId;
          });
      }

      preventVariantURLSwitching() {
        if (this.modalContent.querySelector("variant-radios,variant-selects")) {
          this.modalContent
            .querySelector("variant-radios,variant-selects")
            .setAttribute("data-update-url", "false");
        }
      }

      updateImageSizes() {
        const product = this.modalContent.querySelector(".product");
        const desktopColumns = product.classList.contains("product--columns");
        if (!desktopColumns) return;

        const mediaImages = product.querySelectorAll(".product__media img");
        if (!mediaImages.length) return;

        let mediaImageSizes = "(min-width: 576px) 316px, calc(100vw - 4rem)";

        if (product.classList.contains("product--medium")) {
          mediaImageSizes = mediaImageSizes.replace("715px", "605px");
        } else if (product.classList.contains("product--small")) {
          mediaImageSizes = mediaImageSizes.replace("715px", "495px");
        }

        mediaImages.forEach((img) =>
          img.setAttribute("sizes", mediaImageSizes)
        );
      }
    }
  );
}
