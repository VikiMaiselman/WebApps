import * as selector from "../config.js";
import View from "./view.js";

class PaginationView extends View {
  _parentElement = document.querySelector(".pagination");

  _renderAppropriateElement() {
    this._clear();

    const curPage = this._data.curPage;
    const totalPagesNumber = Math.ceil(
      this._data.resultsList.length / this._data.resultsPerPage
    );
    let markup;

    if (curPage === totalPagesNumber && totalPagesNumber > 1) {
      // last page
      markup = `
            <button data-goto="${curPage - 1}" class="update__page">
                <p>Page <span>${curPage - 1}</span></p>
                <svg class="pagination-svg">
                    <use href="src/img/icons.svg#icon-arrow-left"></use>
                </svg>
            </button>
    `;
    }

    if (curPage < totalPagesNumber) {
      // somewhere in between
      markup = `
        <button data-goto="${curPage - 1}" class="update__page">
            <p>Page <span>${curPage - 1}</span></p>
            <svg class="pagination-svg">
                <use href="src/img/icons.svg#icon-arrow-left"></use>
            </svg>
        </button>
        <button data-goto="${curPage + 1}" class="update__page">
            <p>Page <span>${curPage + 1}</span></p>
            <svg class="pagination-svg">
                <use href="src/img/icons.svg#icon-arrow-right"></use>
            </svg>
        </button>
    `;
    }

    if (curPage === 1 && totalPagesNumber > 1) {
      // 1st page
      markup = `
              <button data-goto="2" class="update__page">
                  <p>Page <span>2</span></p>
                  <svg class="pagination-svg">
                      <use href="src/img/icons.svg#icon-arrow-right"></use>
                  </svg>
              </button>
      `;
    }

    // if all the results can be displayed on the same page - no pagination div should be added

    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  addHandler(handler) {
    this._parentElement.addEventListener("click", (e) => {
      const btn = e.target.closest(".update__page");
      if (!btn) return;
      const pageToGoTo = +btn.dataset.goto;

      handler(pageToGoTo);
    });
  }
}

export const paginationView = new PaginationView();
