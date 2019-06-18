import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import toastr from "toastr";
import "toastr/build/toastr.css";
import "./index.css";
import App from "./App";

toastr.options = {
  positionClass: "toast-bottom-left"
};
toastr.options.showMethod = "slideDown";
toastr.options.hideMethod = "slideUp";
toastr.options.progressBar = true;
toastr.options.closeButton = true;
toastr.options.preventDuplicates = true;
toastr.options.closeDuration = 900;

const rootEl = document.getElementById("root");

const render = AppComponent => {
  let view = (
    <Router>
      <AppComponent />
    </Router>
  );

  ReactDOM.render(view, rootEl);
};
render(App);
