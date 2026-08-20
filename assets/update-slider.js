(function () {
  function swiperInit(section) {
    if (!section) return;
    subSliderInit(section);
    sliderInit(section);
    popupSliderInit(section);
  }

  document.addEventListener("shopify:section:load", function (e) {
    swiperInit(e.target);
  });

  swiperInit(document.currentScript?.parentElement);
})();
