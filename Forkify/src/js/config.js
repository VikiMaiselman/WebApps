export const API_URL = "https://forkify-api.herokuapp.com/api/v2/recipes/";
export const TIMEOUT_SEC = 10;
export const RES_PER_PAGE = 10;

export const searchInput = document.querySelector("#search__input");
export const searchBar = document.querySelector(".nav-bar--search");
export const navbarBtns = document.querySelector(".nav-bar--links");

export const recipeContainer = document.querySelector(".recipe--single");
export const initialMessage = document.querySelector(".recipe__start-msg");
export const recipeBody = document.querySelector(".recipe__body");
export const recipeImg = document.querySelector(`#recipe--img`);
export const recipeName = document.querySelector("#recipe--name");
export const cookingDuration = document.querySelector(`#duration`);
export const servings = document.querySelector(`#num-people`);
export const bookmark = document.querySelector("#svg-bookmark");
export const ingredientsContainer = document.querySelector(".ingredients-list");
export const ingredient = document.querySelector(`.ingredient__in-list`);
export const websiteName = document.querySelector(`.website-name`);
export const searchInstructions = document.querySelector(
  `#search__instructions`
);
export const searchResultsContainer =
  document.querySelector(".recipes__in-list");
export const recipeResult = document.querySelector(".recipe__in-list");

export const modalWindow = document.querySelector(".modal__window");
export const uploadMsg = document.querySelector(".upload__msg");
export const closeBtn = document.querySelector(".btn--close__modal");
export const bookmarksContainer = document.querySelector(".bookmarks__saved");
export const bookmarksBtn = document.querySelector(".bookmarks");
