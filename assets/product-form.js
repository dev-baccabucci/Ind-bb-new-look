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

        // 1. Check for Size / Variant Selection
        const variantInput = this.form ? this.form.querySelector('[name="id"]') : this.querySelector('[name="id"]');
        const variantId = variantInput ? variantInput.value : '';

        const sizeFieldset = document.querySelector('fieldset[data-option-name*="size"]');
        const hasUnselectedSize = sizeFieldset && !sizeFieldset.querySelector('input:checked');

        if (!variantId || hasUnselectedSize) {
          // Display the alert
          this.handleErrorMessage("Please select a size");

          // Shake and scroll the size selector into view
          if (sizeFieldset) {
            sizeFieldset.classList.add('size-error-shake');
            sizeFieldset.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              sizeFieldset.classList.remove('size-error-shake');
            }, 800);
          }
          return; // STOP execution
        }

        // Clear any previous error message
        this.handleErrorMessage(false);

        if (this.submitButton.getAttribute("aria-disabled") === "true") return;

        this.submitButton.setAttribute("aria-disabled", true);
        this.submitButton.classList.add("loading");

        this.querySelector(".loading-overlay__spinner")?.classList.remove("hidden");

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

        // Additional service bundle handler
        if (
          this.productAdditionalService &&
          this.productAdditionalService instanceof ProductAdditionalService &&
          typeof this.productAdditionalService.getItems === "function" &&
          Array.isArray(ProductAdditionalService.selectedServices) &&
          ProductAdditionalService.selectedServices.length > 0
        ) {
          const items = this.productAdditionalService.getItems(formData);
          if (items?.length > 0) {
            const bodyData = { items: items };
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

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              this.handleErrorMessage(response.description);
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
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
            } else {
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
            this.querySelector(".loading-overlay__spinner")?.classList.add("hidden");
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