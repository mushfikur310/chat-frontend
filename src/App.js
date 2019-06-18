import React from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import "./App.css";
import SignIn from "./auth/sign-in";
import Dashboard from "./components/dashboard";
import ChatBoard from "./components/channel";

function App() {
  let auth = "";
  if (localStorage.getItem("auth")) auth = localStorage.getItem("auth");
  return (
    <div className="App">
      {!auth && (
        <Switch>
          <Route exact path="/" component={SignIn} />
        </Switch>
      )}
      {auth && (
        <Switch>
          <Route exact path="/" component={Dashboard} />
        </Switch>
      )}
      {auth && (
        <Switch>
          <Route exact path="/chatboard" component={Dashboard} />
        </Switch>
      )}
      {!auth && (
        <Switch>
          <Route exact path="/chatboard" component={SignIn} />
        </Switch>
      )}
      {auth && (
        <Switch>
          <Route exact path="/room" component={Dashboard} />
        </Switch>
      )}
      {auth && (
        <Switch>
          <Route exact path="/room/:id" component={ChatBoard} />
        </Switch>
      )}
      {!auth && (
        <Switch>
          <Route exact path="/room/:id" component={SignIn} />
        </Switch>
      )}
    </div>
  );
}

export default withRouter(App);
