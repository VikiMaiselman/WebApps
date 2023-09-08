import {
  fetchRecipe,
  fetchQuery,
  getSearchesPerPage,
  updateServings,
  addBookmark,
  removeBookmark,
  data,
} from "./model.js";
import { recipeView } from "./views/recipeView.js";
import { searchView } from "./views/searchView.js";
import { resultsView } from "./views/resultsView.js";
import { paginationView } from "./views/paginationView.js";
import { bookmarksView } from "./views/bookmarksView.js";
import PreviewView from "./views/previewView.js";

// F U N C T I O N S
async function controlRecipe() {
  try {
    const idRecipe = window.location.hash.slice(1);
    if (!idRecipe) return;

    recipeView.renderSpinner();
    await fetchRecipe(idRecipe);
    const recipe = data.recipe;

    recipeView.render(recipe);
    recipeView.removeSpinner();
  } catch (err) {
    // throw err;
    recipeView.clearOnError();
  }
}

async function controlSearch() {
  try {
    const query = searchView.getQuery();
    if (!query) return;

    await fetchQuery(query);

    // Rendering all the results
    // resultsView.render(data.searchResults.resultsList);
    // Rendering the results with pagination
    resultsView.render(getSearchesPerPage(1));
    paginationView.render(data.searchResults);
  } catch (err) {
    resultsView.renderError();
  }
}

function controlPagination(pageNumber) {
  // Rendering the results with pagination
  resultsView.render(getSearchesPerPage(pageNumber));
  paginationView.render(data.searchResults);
}

function controlServings(newServingsNum) {
  updateServings(newServingsNum);
  recipeView.render(data.recipe);
}

function controlBookmark() {
  if (data.recipe.bookmarked) removeBookmark(data.recipe.id);
  else addBookmark(data.recipe);
  recipeView.updateBookmarking(data.recipe);
}

function controlDisplayBookmark(isDisplayBookmarks) {
  if (isDisplayBookmarks) bookmarksView.render(getSearchesPerPage(1, true));
  else {
    if (getSearchesPerPage(1, false).length !== 0) {
      resultsView.render(getSearchesPerPage(1, false));
    } else bookmarksView.renderEmptyList();
  }
}

// publisher-SUBSCRIBER
function init() {
  recipeView.addHandler(controlRecipe);
  searchView.addHandler(controlSearch);
  paginationView.addHandler(controlPagination);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlBookmark);
  bookmarksView.addHandlerDisplayBookmarks(controlDisplayBookmark);
}
init();
