import PreviewView from "./previewView.js";
import * as selector from "../config.js";

class BookmarksView extends PreviewView {
  _parentElement = selector.searchResultsContainer;
  _errorMsg = {
    title: "No bookmarks yet",
    text: "Find a nice recipe and save it ;)",
  };
}

export const bookmarksView = new BookmarksView();
