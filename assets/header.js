(function () {
  const animateMegaMenu = (header) => {
    const menu = header.querySelector(".list-menu--inline");
    const menuLinks = header.querySelectorAll(".list-menu-item");
    const megaMenus = header.querySelectorAll(".mega-menu");
    const mobileMegaMenus = header.querySelectorAll(".mobile-mega-menu");

    if (
      !megaMenus ||
      !menuLinks ||
      menuLinks.length === 0 ||
      megaMenus.length === 0
    ) {
      return;
    }

    const closeMenuDisclosure = () => {
      const disclosures = header.querySelectorAll("details-disclosure");
      if (customElements.get("details-disclosure")) {
        disclosures.forEach((disclosure) => {
          disclosure.close();
        });
      }

      const disclosureLists = header.querySelectorAll(".disclosure__list");
      disclosureLists.forEach((disclosureList) => {
        disclosureList.setAttribute("hidden", true);
      });
    };

    const animateSubmenuLinks = (megaMenu) => {
      if (!megaMenu) return;
      const submenu = megaMenu.querySelector(".mega-menu__submenu");
      const mediaBlocks = megaMenu.querySelectorAll(".mega-menu__media");
      if (!submenu) return;
      const sublinks = submenu.querySelectorAll(".mega-menu__submenu-link");

      const removeActiveClass = () => {
        sublinks.forEach((sublink) => {
          sublink.classList.remove("mega-menu__submenu-link--active");
        });

        mediaBlocks.forEach((block) => {
          block.classList.remove("mega-menu__media--active");
          block.removeAttribute("style");
        });
      };

      const resetActiveClass = () => {
        removeActiveClass();
        sublinks[0]?.classList.add("mega-menu__submenu-link--active");
        if (mediaBlocks[0]) {
          mediaBlocks[0].classList.add("mega-menu__media--active");
          mediaBlocks[0].style.display = "flex";
        }
      };

      const toggleActive = (sublink) => {
        if (sublink.classList.contains("mega-menu__submenu-link--active")) {
          return;
        }
        removeActiveClass();
        sublink.classList.add("mega-menu__submenu-link--active");
        const tabId = sublink.getAttribute("data-mega-menu-tab-id");
        const needMedia = megaMenu.querySelector(
          `.mega-menu__media[data-mega-menu-tab-id='${tabId}']`
        );
        if (!needMedia) return;
        needMedia.style.display = "flex";
        setTimeout(() => {
          needMedia.classList.add("mega-menu__media--active");
        }, 150);
      };

      sublinks.forEach((sublink) => {
        sublink.addEventListener("mouseenter", (e) => {
          toggleActive(sublink);
        });
      });

      megaMenu.addEventListener("mouseleave", resetActiveClass);
    };

    const setDisplayStyles = (megaMenu) => {
      megaMenu.setAttribute("open", "true");
      header.classList.add("header-sticky-with-opened-mega-menu");
      //document.body.classList.add("overflow-hidden-drawer");
      closeMenuDisclosure();
      animateSubmenuLinks(megaMenu);
    };

    const setHiddenStyles = (megaMenu) => {
      //document.body.classList.remove("overflow-hidden-drawer");
      megaMenu.removeAttribute("open");
      header.classList.remove("header-sticky-with-opened-mega-menu");
    };

    const checkMenuPosition = (megaMenu) => {
      const modalWindow = megaMenu?.querySelector(".mega-menu__wrapper");
      if (!menu || !modalWindow) return;
      const mainMenuRect = menu.getBoundingClientRect();
      const megaMenuRect = modalWindow.getBoundingClientRect();
      if (mainMenuRect.right > megaMenuRect.right) {
        const difWidth = 8 + mainMenuRect.right - megaMenuRect.right;
        modalWindow.style.width = `calc(${difWidth}px + 1vw * 100 * 820 / 1440)`;
      }
    };

    const checkScrollContainers = (megaMenu) => {
      const productBlocks = megaMenu.querySelectorAll(".mega-menu__products");
      const menuBlocks = megaMenu.querySelectorAll(".mega-menu__menu");
      const cardsBlocks = megaMenu.querySelectorAll(
        ".mega-menu__cards-wrapper"
      );

      if (productBlocks && productBlocks.length > 0) {
        productBlocks.forEach((block) => {
          if (block.scrollHeight > block.clientHeight) {
            block.classList.add("mega-menu__products--scroll");
          } else {
            block.classList.remove("mega-menu__products--scroll");
          }
        });
      }

      if (menuBlocks || menuBlocks.length > 0) {
        menuBlocks.forEach((block) => {
          if (block.scrollHeight > block.clientHeight) {
            block.classList.add("mega-menu__menu--scroll");
          } else {
            block.classList.remove("mega-menu__menu--scroll");
          }
        });
      }

      if (cardsBlocks || cardsBlocks.length > 0) {
        cardsBlocks.forEach((block) => {
          if (block.scrollHeight > block.clientHeight) {
            block.classList.add("mega-menu__cards-wrapper--scroll");
          } else {
            block.classList.remove("mega-menu__cards-wrapper--scroll");
          }
        });
      }
    };

    const openMegaMenu = (link) => {
      if (link.classList.contains("list-menu--megamenu")) {
        link.classList.add("list-menu--megamenu-visible");

        megaMenus.forEach((megaMenu) => {
          if (megaMenu == link.querySelector(".mega-menu")) {
            checkMenuPosition(megaMenu);
            checkScrollContainers(megaMenu);
            setDisplayStyles(megaMenu);

            const overlay = megaMenu.querySelector(".mega-menu__overlay");
            const handleMouseLeaveWrapper = () => {
              setHiddenStyles(megaMenu);
              link.classList.remove("list-menu--megamenu-visible");
              overlay?.removeEventListener(
                "mouseenter",
                handleMouseLeaveWrapper
              );
            };
            overlay?.addEventListener("mouseenter", handleMouseLeaveWrapper);
          }
        });

        menuLinks.forEach((el) => {
          if (el !== link) {
            el.classList.remove("list-menu--megamenu-visible");
          }
        });
      } else {
        menuLinks.forEach((el) => {
          el.classList.remove("list-menu--megamenu-visible");
        });
      }
    };

    menuLinks.forEach((link) => {
      link.addEventListener("mouseenter", (e) => {
        if (link.classList.contains("list-menu--megamenu")) {
          openMegaMenu(link);
        } else {
          menuLinks.forEach((el) => {
            el.classList.remove("list-menu--megamenu-visible");
          });
        }
      });

      link.addEventListener("mouseleave", (e) => {
        if (link.classList.contains("list-menu--megamenu")) {
          megaMenus.forEach((megaMenu) => {
            if (megaMenu == link.querySelector(".mega-menu")) {
              setHiddenStyles(megaMenu);
            }
          });
        }
      });
    });

    const hiddenAllMegaMenu = () => {
      menuLinks.forEach((link) => {
        link.classList.remove("list-menu--megamenu-visible");
      });

      megaMenus.forEach((megaMenu) => {
        setHiddenStyles(megaMenu);
      });
    };

    menu.addEventListener("mouseleave", hiddenAllMegaMenu);

    // rename color swatch inputs ids and labels for desktop mega menu
    megaMenus.forEach((megaMenu, index) => {
      const allMediaBlocks = megaMenu.querySelectorAll(".mega-menu__media");

      if (!allMediaBlocks || allMediaBlocks.length === 0) return;

      allMediaBlocks.forEach((block) => {
        const tabId = block.getAttribute("data-mega-menu-tab-id");

        block
          .querySelectorAll(".mega-menu__products-card")
          .forEach((productCard) => {
            const allSwatchInputs = productCard.querySelectorAll(
              "input[type='radio']"
            );
            const allSwatchLabels =
              productCard.querySelectorAll("label.color-swatch");

            allSwatchInputs.forEach((input) => {
              const oldId = input.id;
              const oldName = input.name;
              input.id = `${oldId}-mega${index}-tab${tabId}`;
              input.name = `${oldName}-mega${index}-tab${tabId}`;
            });
            allSwatchLabels.forEach((label) => {
              const oldFor = label.htmlFor;
              label.htmlFor = `${oldFor}-mega${index}-tab${tabId}`;
            });
          });
      });
    });

    // rename color swatch inputs ids and labels for mobile mega menu
    mobileMegaMenus.forEach((megaMenu, menuId) => {
      const allMobileItems = megaMenu.querySelectorAll(
        ".mobile-mega-menu__item"
      );

      if (!allMobileItems || allMobileItems.length === 0) return;

      allMobileItems.forEach((item, itemId) => {
        item
          .querySelectorAll(".mobile-mega-menu__products-card")
          .forEach((productCard) => {
            const allSwatchInputs = productCard.querySelectorAll(
              "input[type='radio']"
            );
            const allSwatchLabels =
              productCard.querySelectorAll("label.color-swatch");

            allSwatchInputs.forEach((input) => {
              const oldId = input.id;
              const oldName = input.name;
              input.id = `${oldId}-mob-mega${menuId}-item${itemId}`;
              input.name = `${oldName}-mob-mega${menuId}-tab${itemId}`;
            });
            allSwatchLabels.forEach((label) => {
              const oldFor = label.htmlFor;
              label.htmlFor = `${oldFor}-mob-mega${menuId}-item${itemId}`;
            });
          });
      });
    });
  };

  const closeMobileMenu = (header) => {
    const menuCloseBtn = header.querySelector(".header__modal-close-button");
    const mobileMenuDrawer = header.querySelector("header-drawer");
    menuCloseBtn.addEventListener("click", (e) => {
      mobileMenuDrawer.closeMenuDrawer(e);
    });
  };

  const onHoverRemoveOverlay = (event) => {
    if (
      window.innerWidth < 1100 ||
      !event.target?.closest(".shopify-section-header") ||
      event.target.closest(".shopify-section-header-sticky") ||
      event.target.closest(".header-sticky-with-opened-mega-menu")
    ) {
      return;
    }
    const header = event.target.closest(".shopify-section-header");
    header.classList.remove("color-background-overlay");
    header.classList.add("color-background-overlay-hidden");

    header.removeEventListener("mousemove", onMouseMove);
  };

  const onHoverAddOverlay = (event) => {
    if (
      window.innerWidth < 1100 ||
      !event.target?.classList.contains("shopify-section-header") ||
      event.target.classList.contains("shopify-section-header-sticky") ||
      event.target.classList.contains("header-sticky-with-opened-mega-menu")
    ) {
      return;
    }
    const searchModal = document.querySelector("header-search.header__search");
    const burgerMenu = document.querySelector("burger-menu");
    if (
      (searchModal && searchModal.hasAttribute("open")) ||
      (burgerMenu && burgerMenu.hasAttribute("opened"))
    ) {
      return;
    }
    event.target.classList.add("color-background-overlay");
    event.target.classList.remove("color-background-overlay-hidden");
  };

  const initHeaderOverlay = (header) => {
    const main = document.getElementById("MainContent");
    const sections = main.querySelectorAll(".shopify-section");

    if (sections.length > 0) {
      const sectionFirstChild = sections[0].querySelector(
        "[data-header-overlay='true']"
      );
      // selector with custom-liquid ".shopify-section-group-header-group, .shopify-section-group-overlay-group.custom-liquid-section"
      const headerGroupSections = document.querySelectorAll(
        ".shopify-section-group-header-group"
      );
      const breadcrumbs = document.querySelector(".breadcrumb");

      const removeColorScheme = (element) => {
        let classNames = element.getAttribute("class");
        classNames = classNames.replace(/color-background-\d+/g, "");
        element.setAttribute("class", classNames);
      };

      if (sectionFirstChild) {
        if (headerGroupSections[headerGroupSections.length - 1] === header) {
          sections[0].classList.add("section--has-overlay");
          sections[0].classList.remove("not-margin");
          header.classList.add("color-background-overlay");
          if (breadcrumbs) {
            removeColorScheme(breadcrumbs);
            const colorScheme =
              sectionFirstChild.getAttribute("data-color-scheme");
            if (colorScheme) breadcrumbs.classList.add(`color-${colorScheme}`);
          }
        } else {
          sections[0].classList.add("not-margin");
          header.classList.remove("color-background-overlay");
          header.removeEventListener("mouseenter", onHoverRemoveOverlay);
          header.removeEventListener("mouseleave", onHoverAddOverlay);
          if (breadcrumbs) removeColorScheme(breadcrumbs);
        }
      } else {
        header.classList.remove("color-background-overlay");
        header.removeEventListener("mouseenter", onHoverRemoveOverlay);
        header.removeEventListener("mouseleave", onHoverAddOverlay);
        if (breadcrumbs) removeColorScheme(breadcrumbs);
      }
    }
  };

  const onMouseMove = (event) => {
    onHoverRemoveOverlay(event);
  };

  const addListenersOnHeaderOverlay = (header) => {
    if (header && header.classList.contains("color-background-overlay")) {
      header.addEventListener("mouseenter", onHoverRemoveOverlay);
      header.addEventListener("mouseleave", onHoverAddOverlay);

      // get cursor position when page loading
      header.addEventListener("mousemove", onMouseMove);
    }
  };

  const initHeader = () => {
    const header = document.querySelector(".shopify-section-header");
    if (!header) return;

    animateMegaMenu(header);
    closeMobileMenu(header);
    initHeaderOverlay(header);
    addListenersOnHeaderOverlay(header);
  };

  initHeader();

  document.addEventListener("shopify:section:load", initHeader);
  document.addEventListener("shopify:section:unload", initHeader);
  document.addEventListener("shopify:section:reorder", initHeader);
})();

class BurgerMenu extends HTMLElement {
  constructor() {
    super();
    this.header = document.querySelector(".header-wrapper");
    this.headerLogo = this.header.querySelector(".header__heading-link");
    this.burgerMenu = this.querySelector(".burger-menu");
    this.toggleBtn = this.querySelector(".burger-menu__toggle");
    this.isOpen = false;

    if (this.header) this.header.preventHide = false;

    this.setListeners();
  }

  open() {
    if (this.header) this.header.preventHide = true;
    this.setAttribute("opened", "true");
    document.body.classList.add("overflow-hidden-drawer");
    this.burgerMenu?.addEventListener("transitionend", () => trapFocus(this), {
      once: true,
    });
    this.isOpen = true;
  }

  close() {
    document.body.classList.remove("overflow-hidden-drawer");
    this.removeAttribute("opened");
    if (this.header) this.header.preventHide = false;
    this.isOpen = false;
  }

  setListeners() {
    this.toggleBtn?.addEventListener("click", () => {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    });
    this.burgerMenu?.addEventListener("keyup", (event) => {
      event.code === "Escape" && this.close();
    });

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width < 1100) {
          this.close();
        }
      });
    });

    resizeObserver.observe(this);
  }
}

if (!customElements.get("burger-menu")) {
  customElements.define("burger-menu", BurgerMenu);
}

class HeaderSearch extends HTMLElement {
  constructor() {
    super();
    this.header = document.querySelector(".header-wrapper");
    this.searchLink = this.querySelector(".header__icon--search");
    this.closeButton = this.querySelector(".header__search-close");
    this.overlayEl = this.querySelector(".header__search-overlay");
    this.modalContainer = this.querySelector(".header__search-inner");

    this.searchInput = this.querySelector("#Search-In-Modal");

    this.open = this.onOpen.bind(this);
    this.close = this.onClose.bind(this);
    this.handleKeyDown = this.onHandleKeyDown.bind(this);

    this.searchLink?.addEventListener("click", this.open);
    this.closeButton?.addEventListener("click", this.close);
    this.overlayEl?.addEventListener("click", this.close);
    this.header?.addEventListener("keydown", this.handleKeyDown);
  }

  onOpen(event) {
    event.preventDefault();
    if (this.header) this.header.preventHide = true;
    this.setAttribute("open", true);

    this.modalContainer.addEventListener("transitionend", () => {
      trapFocus(this.modalContainer, this.searchInput);
    });

    document.body.classList.add("overflow-hidden");
  }

  onClose() {
    this.removeAttribute("open");
    if (this.header) this.header.preventHide = false;

    document.body.classList.remove("overflow-hidden");

    this.modalContainer.addEventListener("transitionend", () => {
      removeTrapFocus();
      if (this.searchLink) this.searchLink.focus();
    });
  }

  onHandleKeyDown(event) {
    if (this.getAttribute("open")) {
      if (event.key === "Escape") {
        this.close();
      }
    }
  }

  disconnectedCallback() {
    this.header.removeEventListener("keydown", this.handleKeyDown);
  }
}

if (!customElements.get("header-search")) {
  customElements.define("header-search", HeaderSearch);
}
