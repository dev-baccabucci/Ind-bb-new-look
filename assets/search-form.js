class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.resetBtn = this.querySelector(".search__button--reset");

    this.input?.form?.addEventListener("reset", this.onFormReset.bind(this));
    this.input?.addEventListener(
      "input",
      debounce((event) => {
        this.onChange(event);
      }, 300).bind(this)
    );

    this.resetBtn?.addEventListener("click", this.onFormReset.bind(this));
  }

  toggleResetBtn(value) {
    if (!this.resetBtn) return;

    if (value) {
      this.resetBtn.style.display = "flex";
    } else {
      this.resetBtn.style.display = "none";
    }
  }

  onChange(event) {
    this.toggleResetBtn(event.target.value);
  }

  shouldResetForm() {
    return !document.querySelector('[aria-selected="true"] a');
  }

  onFormReset(event) {
    // Prevent default so the form reset doesn't set the value gotten from the url on page load
    event.preventDefault();
    // Don't reset if the user has selected an element on the predictive search dropdown
    if (this.shouldResetForm() && this.input) {
      this.input.value = "";
      this.input.focus();
      this.toggleResetBtn("");
    }
  }
}

customElements.define("search-form", SearchForm);
