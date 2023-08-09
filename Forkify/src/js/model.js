import { API_URL, RES_PER_PAGE } from "./config.js";
import { getJSON } from "./helpers.js";

export const data = {
  recipe: {},
  searchResults: {
    query: "",
    resultsList: [],
    curPage: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

export async function fetchRecipe(recipeId) {
  try {
    const recipeData = await getJSON(`${API_URL}${recipeId}`);
    const { recipe } = recipeData.data;

    data.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      cookingTime: recipe.cooking_time,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
    };

    if (data.bookmarks.some((bookmark) => bookmark.id === data.recipe.id)) {
      data.recipe.bookmarked = true;
    } else {
      data.recipe.bookmarked = false;
    }
  } catch (err) {
    throw err;
  }
}

export async function fetchQuery(query) {
  try {
    const querySearchData = await getJSON(`${API_URL}?search=${query}`);
    const recipes = querySearchData.data.recipes;

    data.searchResults.query = query;
    data.searchResults.resultsList = recipes.map((recipe) => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
      };
    });
  } catch (err) {
    throw err;
  }
}

export function getSearchesPerPage(
  page = data.searchResults.curPage,
  isForBookmarks = false
) {
  data.searchResults.curPage = page;

  const start = (page - 1) * 10;
  const end = page * 10;

  if (!isForBookmarks) return data.searchResults.resultsList.slice(start, end);
  else return data.bookmarks.slice(start, end);
}

export function updateServings(newServingsNum) {
  // const newQt = oldQt * newServ / oldServ

  data.recipe.ingredients.forEach((ingredient) => {
    if (ingredient) {
      const newQt =
        (ingredient.quantity * newServingsNum) / data.recipe.servings;
      ingredient.quantity = newQt;
    }
  });
  data.recipe.servings = newServingsNum;
}

export function addBookmark(curRecipe) {
  curRecipe.bookmarked = true;
  if (!data.bookmarks.some((bookmark) => bookmark.id === curRecipe.id)) {
    data.bookmarks.push(curRecipe);
  }
  persistBookmarks();
}

export function removeBookmark(id) {
  const recipeIdx = data.bookmarks.findIndex((bookmark) => bookmark.id === id);
  data.bookmarks.splice(recipeIdx, 1);

  if (id === data.recipe.id) {
    data.recipe.bookmarked = false;
  }
  persistBookmarks();
}

function persistBookmarks() {
  localStorage.setItem("bookmarks", JSON.stringify(data.bookmarks));
}

function init() {
  const storage = localStorage.getItem("bookmarks");
  if (storage) data.bookmarks = JSON.parse(storage);
}
init();
