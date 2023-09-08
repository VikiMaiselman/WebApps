import View from "./view.js";
import * as selector from "../config.js";

export default class PreviewView extends View {
  _renderAppropriateElement() {
    this._clear();

    const markup = this._data
      .map((result) => this._renderEachResult(result))
      .join("");

    this._parentElement.insertAdjacentHTML("afterbegin", markup);
    this._addHandlerHoverOver();
  }

  _renderEachResult(result) {
    return `<a href="#${result.id}" class="recipe__in-list">
              <div class="recipe-icon">
                  <img src="${result.image}" alt="${result.title}" />
              </div>
              <h3 class="recipe--name__small">${result.title}</h3>
              <p class="recipe--website-name">${result.publisher}</p>
              </a>`;
  }

  _toggleWelcomeMessage() {}

  _addHandlerHoverOver() {
    this._parentElement.addEventListener("mouseover", (e) => {
      const recipe = e.target.closest(".recipe__in-list");
      if (!recipe) return;
      recipe.classList.add("active--recipe");
    });

    this._parentElement.addEventListener("mouseout", (e) => {
      const recipe = e.target.closest(".recipe__in-list");
      if (!recipe) return;
      recipe.classList.remove("active--recipe");
    });
  }

  renderEmptyList() {
    this._parentElement.innerHTML = "";
  }
}
