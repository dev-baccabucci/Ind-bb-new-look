function loadItems (button) {
  const totalPages = parseInt(
    document.querySelector("[data-total-pages]").value,
    10
  );
  let currentPage = parseInt(
    document.querySelector("[data-current-page]").value,
    10
  );
  let currentPageScroll = currentPage + 1;

  currentPage = currentPage + 1;
  const nextUrl = document
    .querySelector("[data-next-url]")
    .value.replace(/page=[0-9]+/, "page=" + currentPage);
  const nextUrlScroll = document
    .querySelector("[data-next-url]")
    .value.replace(/page=[0-9]+/, "page=" + currentPageScroll);

  document.querySelector("[data-current-page]").value = currentPage;

  button.setAttribute("disabled", "");
  button.classList.add("loading");

  fetch(nextUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((responseHTML) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(responseHTML, "text/html");
      const newItems = doc.querySelector(".load-more-grid").innerHTML;

      document
        .querySelector(".load-more-grid")
        .insertAdjacentHTML("beforeend", newItems);
      colorSwatches();
    })
    .catch((error) => {
      console.error("Error loading items:", error);
      button.removeAttribute("disabled");
      button.classList.remove("loading");
    })
    .finally(() => {
      if (currentPage <= totalPages) {
        const scrollData = document.querySelector(".infinite-scroll__data");
        if (scrollData && currentPage !== totalPages) {
          const nextUrlInput = scrollData.querySelector("input[data-next-url]");
          const currentPageInput = scrollData.querySelector(
            "input[data-current-page]"
          );

          if (nextUrlInput) {
            nextUrlInput.dataset.nextUrl = nextUrlScroll;
            nextUrlInput.value = nextUrlScroll;
          }

          if (currentPageInput) {
            currentPageInput.dataset.currentPage = currentPage;
            currentPageInput.value = currentPage;
          }

          checkVisibility();
        }

        button.removeAttribute("disabled");
        button.classList.remove("loading");

        if (currentPage === totalPages) {
          button.remove();
        }
      }
    });
};

function checkVisibility() {
  const spinnerList = document.querySelectorAll(".js-infinite-scroll");
  spinnerList.forEach((spinner) => {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadItems(spinner);
          sectionObserver.unobserve(entry.target);
        }
      });
    });

    sectionObserver.observe(spinner);
  });
};

function loadMore() {
  document.querySelectorAll(".js-load-more").forEach((button) => {
    button.onclick = () => {
      loadItems(button);
    };
  });

  checkVisibility();
}

(function () {
  loadMore();
})();
