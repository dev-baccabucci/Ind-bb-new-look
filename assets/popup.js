"use strict";

document.addEventListener("DOMContentLoaded", function () {
  let adpPopup = {};

  (function () {
    let $this;

    adpPopup = {
      sPrevious: window.scrollY,
      sDirection: "down",

      /*
       * Initialize
       */
      init: function (e) {
        $this = adpPopup;

        $this.popupInit(e);

        // Init events.
        $this.events(e);
      },

      /*
       * Events
       */
      events: function (e) {
        // Custom Events
        document.addEventListener("click", function (event) {
          if (
            event.target.matches(".popup-close") ||
            event.target.closest(".popup-close")
          ) {
            $this.closePopup(event);
          }
          if (
            event.target.matches(".popup-accept") ||
            event.target.closest(".popup-accept")
          ) {
            $this.acceptPopup(event);
            $this.closePopup(event);
          }
          if (
            event.target.matches(".age-verification__popup-close") ||
            event.target.closest(".age-verification__popup-close")
          ) {
            $this.agePopup(event);
            $this.closePopup(event);
          }
          if (
            event.target.matches(".age-verification__button-no") ||
            event.target.closest(".age-verification__button-no")
          ) {
            $this.ageDeclined(event);
          }
        });

        // Checking this will cause popup to close when user presses key.
        document.addEventListener("keyup", function (event) {
          // Press ESC to Close.
          if (event.key === "Escape") {
            document
              .querySelectorAll('.popup-open[data-esc-close="true"]')
              .forEach(function (popup) {
                $this.closePopup(popup);
              });
          }

          // Press F4 to Close.
          if (event.key === "F4") {
            document
              .querySelectorAll('.popup-open[data-f4-close="true"]')
              .forEach(function (popup) {
                $this.closePopup(popup);
              });
          }
        });

        // Checking this will cause popup to close when user clicks on overlay.
        document.querySelectorAll(".popup-overlay").forEach((element) => {
          element.addEventListener("click", (event) => {
            if (
              element.previousElementSibling.matches(
                '.popup-open[data-overlay-close="true"]'
              )
            ) {
              $this.closePopup(element.previousElementSibling);
            }
          });
        });
      },

      /*
       * Init popup elements
       */
      popupInit: function () {
        // Track scroll direction
        document.addEventListener("scroll", function () {
          const scrollCurrent = window.scrollY;
          $this.sDirection = scrollCurrent > $this.sPrevious ? "down" : "up";
          $this.sPrevious = scrollCurrent;
        });

        // Initialize popups
        document.querySelectorAll(".popup").forEach((popup) => {
          const triggerType = popup.dataset.openTrigger;

          // Manual trigger
          if (triggerType === "manual") {
            const selector = popup.dataset.openManualSelector;
            if (selector) {
              document.querySelectorAll(selector).forEach((el) => {
                el.classList.add("popup-trigger");
                el.addEventListener("click", function (e) {
                  e.preventDefault();
                  popup.classList.remove("popup-already-opened");
                  $this.openPopup(popup);
                  if (e.currentTarget.classList.contains("popup")) {
                    $this.closePopup(popup);
                  }
                });
              });
            }
          }

          // Allow check
          if (
            !$this.isAllowPopup(popup) &&
            !popup.classList.contains("age-verification")
          ) {
            return;
          }

          $this.openTriggerPopup(popup);
        });
      },

      /*
       * Trigger open popup
       */
      openTriggerPopup: function (popup) {
        const trigger = popup.dataset.openTrigger;

        if (trigger === "none") {
          const ageVerification = $this.getStorage(
            "popup-age-" + (popup.dataset.id || 0)
          );
          if (!ageVerification) $this.openPopup(popup);
        }

        if (trigger === "delay") {
          setTimeout(
            () => $this.openPopup(popup),
            popup.dataset.openDelayNumber * 1000
          );
        }

        if (trigger === "exit") {
          let showExit = true;
          document.addEventListener("mousemove", function (e) {
            const scroll =
              window.pageYOffset || document.documentElement.scrollTop;
            if (e.pageY - scroll < 7 && showExit) {
              $this.openPopup(popup);
              showExit = false;
            }
          });
        }

        if (trigger === "scroll") {
          const type = popup.dataset.openScrollType;
          const position = popup.dataset.openScrollPosition;
          document.addEventListener("scroll", function () {
            if (type === "px" && window.scrollY >= position) {
              $this.openPopup(popup);
            }
            if (type === "%" && $this.getScrollPercent() >= position) {
              $this.openPopup(popup);
            }
          });
        }

        if (trigger === "accept") {
          const accepted = $this.getStorage(
            "popup-accept-" + (popup.dataset.id || 0)
          );
          if (!accepted) $this.openPopup(popup);
        }
      },

      /*
       * Trigger close popup
       */
      closeTriggerPopup: function (popup) {
        const trigger = popup.dataset.closeTrigger;

        if (trigger === "delay") {
          setTimeout(
            () => $this.closePopup(popup),
            popup.dataset.closeDelayNumber * 1000
          );
        }

        if (trigger === "scroll") {
          const type = popup.dataset.closeScrollType;
          const pos = popup.dataset.closeScrollPosition;
          const initPx = popup.dataset.initScrollPx;
          const initPercent = popup.dataset.initScrollPercent;

          document.addEventListener("scroll", function () {
            if (type === "px") {
              if ($this.sDirection === "up" && window.scrollY < initPx - pos)
                $this.closePopup(popup);
              if ($this.sDirection === "down" && window.scrollY >= initPx + pos)
                $this.closePopup(popup);
            }
            if (type === "%") {
              if (
                $this.sDirection === "up" &&
                $this.getScrollPercent() < initPercent - pos
              )
                $this.closePopup(popup);
              if (
                $this.sDirection === "down" &&
                $this.getScrollPercent() >= initPercent + pos
              )
                $this.closePopup(popup);
            }
          });
        }
      },

      /*
       * Open popup
       */
      openPopup: function (popup) {
        if (
          popup.classList.contains("popup-open") ||
          popup.classList.contains("popup-already-opened")
        ) {
          return;
        }

        if (popup.hasAttribute("data-body-scroll-disable")) {
          document.body.classList.add("popup-scroll-hidden");
        }

        const limit =
          (parseInt($this.getStorage("popup-" + popup.dataset.id)) || 0) + 1;
        $this.setStorage("popup-" + popup.dataset.id, limit, {
          expires: popup.dataset.limitLifetime,
        });

        popup.classList.add("popup-open");
        popup.dataset.initScrollPx = window.scrollY;
        popup.dataset.initScrollPercent = $this.getScrollPercent();

        $this.applyAnimation(popup, popup.dataset.openAnimation);
        $this.closeTriggerPopup(popup);
      },

      /*
       * Close popup
       */
      closePopup: function (event) {
        let el = event.target ? event.target : event;
        // Get popup container.
        let popup = el.closest(".popup");
        // Close animation.
        let animation = popup.getAttribute("data-exit-animation");
        $this.applyAnimation(popup, animation, function () {
          // Already opened.
          popup.classList.add("popup-already-opened");
          // Hide popup.
          popup.classList.remove("popup-open");

          popup.blur();
        });
        document.body.classList.remove("popup-scroll-hidden");
        document.body.classList.remove("popup-scroll-hidden-mobile");
      },

      /*
       * Age popup
       */
      agePopup: function (event) {
        let el = event.target ? event.target : event;

        // Get popup container.
        let popup = el.closest(".popup");
        // Set Cookie of Age.
        $this.setStorage("popup-age-" + popup.dataset.id, 1, { expires: 360 });
      },

      ageDeclined: function () {
        document
          .querySelector(".age-verification__question")
          ?.classList.remove("show");
        document
          .querySelector(".age-verification__declined")
          ?.classList.add("show");
      },

      acceptPopup: function (el) {
        const popup = el.closest(".popup");
        $this.setStorage("popup-accept-" + popup.dataset.id, 1, {
          expires: 360,
        });
      },

      /*
       * Apply animation
       */
      applyAnimation: function (popup, name, callback) {
        const overlay = popup.nextElementSibling?.classList.contains(
          "popup-overlay"
        )
          ? popup.nextElementSibling
          : null;

        const overlayName =
          typeof callback === "function" ? "popupExitFade" : "popupOpenFade";

        if (overlay) {
          overlay.classList.add("popup-animated", overlayName);
          overlay.addEventListener("animationend", function handler() {
            overlay.classList.remove("popup-animated", overlayName);
            overlay.removeEventListener("animationend", handler);
          });
        }

        const wrap = popup.querySelector(".popup-wrap");
        if (wrap) {
          wrap.classList.add("popup-animated", name);
          wrap.addEventListener("animationend", function handler() {
            wrap.classList.remove("popup-animated", name);
            wrap.removeEventListener("animationend", handler);
            if (typeof callback === "function") callback();
          });
        }
      },

      /*
       * Storage helpers
       */
      getCookie: function (name) {
        const matches = document.cookie.match(
          new RegExp(
            "(?:^|; )" +
              name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
              "=([^;]*)"
          )
        );
        return matches ? decodeURIComponent(matches[1]) : undefined;
      },

      getStorage: function (key) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed.expires && Date.now() > parsed.expires) {
              localStorage.removeItem(key);
              return undefined;
            }
            return parsed.value;
          } catch {
            return undefined;
          }
        }
        const cookieValue = $this.getCookie(key);
        if (cookieValue !== undefined) {
          $this.setStorage(key, cookieValue);
          return cookieValue;
        }
        return undefined;
      },

      setStorage: function (key, value, options = {}) {
        const data = { value, expires: null };
        if (options.expires) {
          const expiresDate = new Date();
          expiresDate.setDate(
            expiresDate.getDate() + parseInt(options.expires, 10)
          );
          data.expires = expiresDate.getTime();
        }
        localStorage.setItem(key, JSON.stringify(data));
      },

      getScrollPercent: function () {
        const h = document.documentElement;
        const b = document.body;
        return (
          ((h.scrollTop || b.scrollTop) /
            ((h.scrollHeight || b.scrollHeight) - h.clientHeight)) *
          100
        );
      },

      isAllowPopup: function (popup) {
        const limitDisplay = parseInt(popup.dataset.limitDisplay || 0);
        const limitDisplayCookie = parseInt(
          $this.getStorage("popup-" + popup.dataset.id)
        );
        if (
          limitDisplay &&
          limitDisplayCookie &&
          limitDisplayCookie >= limitDisplay
        ) {
          return false;
        }
        return true;
      },
    };
  })();

  // Init
  adpPopup.init();

  document.addEventListener("shopify:section:load", function () {
    adpPopup.init();
  });

  document.addEventListener("shopify:section:unload", function () {
    document.body.classList.remove("popup-scroll-hidden");
  });
});
