import * as selector from "../config.js";
import View from "./view.js";

class RecipeView extends View {
  _parentElement = document.querySelector(".recipe--single");
  _errorMsg = {
    title: "No recipes found for your query",
    text: "Check whether you entered the right id",
  };

  // PUBLISHER - subscriber
  addHandler(handler) {
    ["load", "hashchange"].forEach((event) =>
      window.addEventListener(event, handler)
    );
  }

  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener("click", (e) => {
      let newServingsNum;
      const btn = e.target.closest(".btn--update-servings");
      if (!btn) return;

      if (btn.classList.contains("minus"))
        newServingsNum = +selector.servings.innerHTML - 1;

      if (btn.classList.contains("plus"))
        newServingsNum = +selector.servings.innerHTML + 1;

      console.log(newServingsNum);
      if (newServingsNum > 0) handler(newServingsNum);
    });
  }

  addHandlerBookmark(handler) {
    this._parentElement.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn--bookmark");
      if (!btn) return;
      handler();
    });
  }

  updateBookmarking(recipe) {
    selector.bookmark.setAttribute(
      "href",
      `src/img/icons.svg#icon-bookmark${recipe.bookmarked ? "-fill" : ""}`
    );
  }

  clearOnError() {
    this.removeSpinner();
    this.renderError();
    this._toggleWelcomeMessage();
  }

  _renderAppropriateElement() {
    this._displayAppropriateContainer();
    this._updateRecipeHTMLData();
  }

  _displayAppropriateContainer() {
    selector.recipeBody.classList.remove("hidden");
    selector.initialMessage.classList.add("hidden");
  }

  _toggleWelcomeMessage() {
    selector.initialMessage.classList.toggle("hidden");
  }

  _updateRecipeHTMLData() {
    selector.recipeImg.src = this._data.image;
    selector.recipeName.innerHTML = this._data.title;
    selector.cookingDuration.innerHTML = this._data.cookingTime;
    selector.servings.innerHTML = this._data.servings;
    selector.websiteName.innerHTML = this._data.publisher;
    selector.searchInstructions.setAttribute("href", this._data.sourceUrl);

    this._renderIngredients();
    this.updateBookmarking(this._data);
  }

  _renderIngredients() {
    const markup = this._data.ingredients
      .map((ingredient) => {
        return `<li><span class="ingredient__in-list">${
          ingredient.quantity || ""
        } ${ingredient.unit || ""}
      ${ingredient.description}</span></li>`;
      })
      .join("");

    selector.ingredientsContainer.innerHTML = markup;
  }
}

export const recipeView = new RecipeView();
