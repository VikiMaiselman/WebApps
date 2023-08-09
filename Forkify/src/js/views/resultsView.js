import PreviewView from "./previewView.js";
import * as selector from "../config.js";

class ResultsView extends PreviewView {
  _parentElement = selector.searchResultsContainer;
  _errorMsg = {
    title: "No results matched your query",
    text: "Try again with a different query",
  };
}

export const resultsView = new ResultsView();
