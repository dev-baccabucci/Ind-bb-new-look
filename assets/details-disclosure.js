class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector("details");

    document.addEventListener("keyup", this.onKeyUp.bind(this));
    document.addEventListener("click", this.onFocusOut.bind(this));
  }

  onKeyUp(event) {
    if (event.code === "Escape") {
      this.mainDetailsToggle.removeAttribute("open");
    }
  }

  onFocusOut(e) {
    const withBoundaries = e.composedPath().includes(this.mainDetailsToggle);

    if (!withBoundaries) {
      this.mainDetailsToggle?.removeAttribute("open");
    }
  }

  close() {
    this.mainDetailsToggle?.removeAttribute("open");
  }
}

customElements.define("details-disclosure", DetailsDisclosure);
