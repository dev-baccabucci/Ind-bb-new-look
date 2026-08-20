if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        if (this.querySelector("form")) {
          this.form = this.querySelector("form");
          this.form.querySelector("[name=id]").disabled = false;
          this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        } else {
          this.querySelector("[name=id]").disabled = false;
          this.querySelector("button[type=submit]").addEventListener(
            "click",
            this.onSubmitHandler.bind(this)
          );
        }

        this.cart = document.querySelector("cart-drawer");
        this.submitButton = this.querySelector('[type="submit"]');
        if (this.cart) {
          this.submitButton.setAttribute("aria-haspopup", "dialog");
        }

        this.hideErrors = this.dataset.hideErrors === "true";

        // additional service on product page
        const productInfo = this.closest(".product__info-container");
        const sectionId = productInfo?.dataset.section;
        this.productAdditionalService = productInfo?.querySelector(
          `product-additional-service[data-section-id="${sectionId}"]`
        );
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute("aria-disabled") === "true") return;

        this.handleErrorMessage();

        this.submitButton.setAttribute("aria-disabled", true);
        this.submitButton.classList.add("loading");

        this.querySelector(".loading-overlay__spinner").classList.remove(
          "hidden"
        );

        const config = fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];

        const formData = new FormData(this.form);
        if (!this.form) {
          formData.append("id", this.querySelector("[name=id]").value);
        }

        if (this.cart) {
          formData.append(
            "sections",
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append("sections_url", window.location.pathname);
        }
        config.body = formData;

        //--------------------------------------------------
        // changing body of request if additional service is selected
        if (
          this.productAdditionalService &&
          this.productAdditionalService instanceof ProductAdditionalService &&
          typeof this.productAdditionalService.getItems === "function" &&
          Array.isArray(ProductAdditionalService.selectedServices) &&
          ProductAdditionalService.selectedServices.length > 0
        ) {
          const items = this.productAdditionalService.getItems(formData);
          if (items?.length > 0) {
            const bodyData = {
              items: items,
            };
            if (this.cart) {
              bodyData.sections = this.cart
                .getSectionsToRender()
                .map((section) => section.id);
              bodyData.sections_url = window.location.pathname;
            }

            delete config.headers["X-Requested-With"];
            config.headers["Content-Type"] = "application/json";
            config.body = JSON.stringify(bodyData);
          }
        }
        //--------------------------------------------------

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            // CART ERROR EVENT
            if (response.status) {
              document.dispatchEvent(
                new CustomEvent("cart:error", {
                  detail: {
                    source: "product-form",
                    productVariantId: formData.get("id"),
                    errors: response.description,
                    message: response.message,
                  },
                })
              );
              // -------------------------------------------

              publish(PUB_SUB_EVENTS.cartError, {
                source: "product-form",
                productVariantId: formData.get("id"),
                errors: response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);
              const soldOutMessage =
                this.submitButton.querySelector(".sold-out-message");
              if (!soldOutMessage) return;
              this.submitButton.setAttribute("aria-disabled", true);
              this.submitButton.querySelector("span").classList.add("hidden");
              soldOutMessage.classList.remove("hidden");
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            // VARIANT ADDED EVENT
            document.dispatchEvent(
              new CustomEvent("variant:add", {
                detail: {
                  variant: {
                    id: formData.get("id"),
                  },
                  quantity: Number(formData.get("quantity") || 1),
                  formElement: this.form,
                  sectionId: this.dataset.section,
                },
              })
            );
            // -------------------------------------------

            if (!this.error) {
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: "product-form",
                productVariantId: formData.get("id"),
              });

              // CART CHANGE EVENT
              document.dispatchEvent(
                new CustomEvent("cart:change", {
                  detail: response,
                  bubbles: true,
                })
              );
            }
            this.error = false;
            const quickAddModal = this.closest("quick-add-modal");
            let activeElement = document.activeElement;
            if (quickAddModal) {
              document.body.addEventListener(
                "modalClosed",
                () => {
                  setTimeout(() => {
                    this.cart.setActiveElement(activeElement);
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
              if (
                this.productAdditionalService &&
                this.productAdditionalService instanceof
                  ProductAdditionalService &&
                typeof this.productAdditionalService.clearItems ===
                  "function" &&
                Array.isArray(ProductAdditionalService.selectedServices) &&
                ProductAdditionalService.selectedServices.length > 0
              ) {
                this.productAdditionalService.clearItems();
              }
            } else {
              if (this.closest(".header")) {
                const cartLink = document.querySelector("#cart-icon-bubble");
                if (cartLink) {
                  activeElement = cartLink;
                }
                activeElement = document.querySelector("#cart-icon-bubble");
              } else if (this.closest(".collection-product-card")) {
                const productCard = this.closest(".collection-product-card");
                const linkTitle = productCard.querySelector(".card__title > a");
                if (linkTitle) {
                  activeElement = linkTitle;
                }
              }

              this.cart.setActiveElement(activeElement);
              this.cart.renderContents(response);
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove("loading");
            if (this.cart && this.cart.classList.contains("is-empty"))
              this.cart.classList.remove("is-empty");
            if (!this.error) this.submitButton.removeAttribute("aria-disabled");
            this.querySelector(".loading-overlay__spinner").classList.add(
              "hidden"
            );
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  );
}
