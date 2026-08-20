(function () {
  const initProductMarkers = (section) => {
    if (!section || !section?.classList.contains("product-markers-section")) {
      return;
    }

    const allMarkers = section.querySelectorAll(".product-markers__item");
    const mobileContainer = section.querySelector(
      ".product-markers-for-mobile"
    );
    const allMobileCards = mobileContainer.querySelectorAll(
      ".product-markers__item-inner"
    );

    const renameColorSwatchInputIds = () => {
      section
        .querySelectorAll(".product-markers__item-inner")
        .forEach((el, index) => {
          const allSwatchInputs = el.querySelectorAll("input[type='radio']");
          const allSwatchLabels = el.querySelectorAll("label.color-swatch");

          allSwatchInputs.forEach((input) => {
            const oldId = input.id;
            const oldName = input.name;
            input.id = `${oldId}-card${index}`;
            input.name = `${oldName}-card${index}`;
          });
          allSwatchLabels.forEach((label) => {
            const oldFor = label.htmlFor;
            label.htmlFor = `${oldFor}-card${index}`;
          });
        });
    };
    renameColorSwatchInputIds();

    const calcNewCoord = (marker) => {
      const card = marker.querySelector(".product-markers__item-inner");
      const markerRect = marker.getBoundingClientRect();

      if (!card) return;

      card.style.removeProperty("left");
      card.style.removeProperty("right");

      const cardRect = card.getBoundingClientRect();
      const screenWidth =
        document.documentElement.clientWidth || window.innerWidth;

      if (cardRect.right > screenWidth) {
        let newRight = markerRect.right - cardRect.right;
        if (card.classList.contains("product-markers__item-inner--to-right")) {
          newRight = -1 * (screenWidth - markerRect.right - 20);
        }

        card.style.left = "auto";
        card.style.right = `${newRight}px`;
      } else if (cardRect.left < 0) {
        let newLeft = markerRect.left - cardRect.left;
        if (card.classList.contains("product-markers__item-inner--to-left")) {
          newLeft = -1 * markerRect.left;
        }
        card.style.right = "auto";
        card.style.left = `${newLeft}px`;
      } else {
      }
    };

    const onSelectMarker = (marker) => {
      const index = marker.dataset.index;

      const screenWidth =
        document.documentElement.clientWidth || window.innerWidth;

      allMarkers.forEach((marker) => {
        marker.classList.remove("mobile-initial-active");
      });

      if (screenWidth >= 990) {
        return;
      }

      if (marker.classList.contains("active")) {
        if (screenWidth < 990) return;
        marker.classList.remove("active");

        return;
      }

      allMarkers.forEach((marker) => {
        marker.classList.remove("active");
      });
      marker.classList.add("active");

      allMobileCards.forEach((card) => {
        card.classList.remove("active");

        if (card.dataset.index == index) {
          card.classList.add("active");
        }
      });

      if (screenWidth >= 990) {
        calcNewCoord(marker);
      }
    };

    allMarkers.forEach((marker) => {
      calcNewCoord(marker);

      marker.addEventListener("click", (event) => {
        if (event.target.closest(".js-color-swatches")) return;
        onSelectMarker(marker);
      });

      marker.addEventListener("mouseover", () => {
        if (marker.classList.contains("active")) {
          return;
        }

        const screenWidth =
          document.documentElement.clientWidth || window.innerWidth;
        if (screenWidth >= 990) {
          calcNewCoord(marker);
        }
      });

      marker.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          onSelectMarker(marker);
        }
      });
    });

    document.addEventListener("click", (event) => {
      const screenWidth =
        document.documentElement.clientWidth || window.innerWidth;
      if (screenWidth < 990) return;

      const parentClicked = event.target.closest(".product-markers__item");
      allMarkers.forEach((marker) => {
        if (
          parentClicked != marker &&
          !event.target.closest(".js-color-swatches")
        ) {
          marker.classList.remove("active");
        }
      });
    });
  };

  const initAnimations = (section) => {
    if (
      !section ||
      !section?.classList.contains("product-markers-section") ||
      !section.querySelector(".animate-on-scroll")
    )
      return;

    const sectionContainer = section.querySelector(".product-markers");
    const imageContainer = section.querySelector(
      ".product-markers__image-container"
    );

    if (!sectionContainer || !imageContainer) return;

    ScrollTrigger.create({
      trigger: imageContainer,
      start: "50% bottom",
      end: "bottom top",
      onEnter: () => sectionContainer.classList.add("animated"),
    });
  };

  initProductMarkers(document.currentScript.parentElement);
  initAnimations(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initProductMarkers(event.target);
    initAnimations(event.target);
  });
})();
