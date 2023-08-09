import * as selector from "../config.js";
import View from "./view.js";

class SearchView extends View {
  _parentElement = selector.searchBar;

  getQuery() {
    const query = selector.searchInput.value;
    this._clearQuery();
    return query;
  }

  _clearQuery() {
    selector.searchInput.value = "";
  }

  addHandler(handler) {
    document
      .querySelector("#query-search__btn")
      .addEventListener("click", (e) => {
        e.preventDefault();
        handler();
      });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handler();
    });
  }
}

export const searchView = new SearchView();
