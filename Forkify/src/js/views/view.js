import * as selector from "../config.js";

export default class View {
  _data;

  render(data) {
    this._data = data;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return this.renderError();
    }
    this._renderAppropriateElement();
  }

  renderError() {
    swal({
      title: this._errorMsg.title,
      text: this._errorMsg.text,
      icon: "error",
      button: "Try again",
    });
  }

  renderSpinner() {
    selector.initialMessage.classList.add("hidden");

    const markup = `
      <div class="spinner">
          <svg>
            <use href="src/img/icons.svg#icon-loader"></use>
          </svg>
      </div>`;

    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  removeSpinner() {
    const spinners = document.getElementsByClassName("spinner");
    if (!spinners) return;
    for (const s of spinners) s.remove();
  }

  _clear() {
    this._parentElement.innerHTML = "";
  }
}

// E V E N T   L I S T E N E R S
selector.searchInput.addEventListener("focus", (e) => {
  selector.searchBar.classList.add("input__upsliding");
});

selector.searchInput.addEventListener("focusout", (e) => {
  selector.searchBar.classList.remove("input__upsliding");
});

selector.navbarBtns.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-recipe")) {
    modalWindow.classList.remove("hidden");
    uploadMsg.classList.remove("upload__msg--hidden");
  }
});

selector.closeBtn.addEventListener("click", (e) => {
  modalWindow.classList.add("hidden");
  uploadMsg.classList.add("upload__msg--hidden");
});
