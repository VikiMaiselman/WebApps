import PreviewView from "./previewView.js";
import * as selector from "../config.js";

class BookmarksView extends PreviewView {
  _parentElement = selector.searchResultsContainer;
  _errorMsg = {
    title: "No bookmarks yet",
    text: "Find a nice recipe and save it ;)",
  };

  addHandlerDisplayBookmarks(handler) {
    let toDisplay;
    selector.bookmarksBtn.addEventListener("mouseover", (e) => {
      toDisplay = true;
      handler(toDisplay);
    });

    // selector.bookmarksBtn.addEventListener("dblclick", (e) => {
    //   toDisplay = true;
    //   handler(toDisplay);
    // });

    selector.bookmarksBtn.addEventListener("mouseout", (e) => {
      toDisplay = false;
      handler(toDisplay);
    });
  }
}

export const bookmarksView = new BookmarksView();
