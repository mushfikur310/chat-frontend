import React from "react";
import { withRouter } from "react-router-dom";
import toastr from "toastr";
import { Button, Form, Grid, Header } from "semantic-ui-react";

const baseURL = process.env.REACT_APP_BASE_URL;

class LoginForm extends React.Component {
  state = {
    user_name: "",
    password: ""
  };

  onSignIn = async () => {
    let reqBody = {
      username: this.state.user_name,
      password: this.state.password
    };
    if (this.state.user_name === "") {
      toastr.error("Please enter user name !");
      return;
    }
    if (this.state.password === "") {
      toastr.error("Please enter password !");
      return;
    }
    fetch(`${baseURL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    })
      .then(response => {
        return response.json();
      })
      .then(r => {
        if (r.success) {
          localStorage.setItem("token", r.result.token);
          localStorage.setItem("username", r.result.username);
          localStorage.setItem("auth", true);
          toastr.success(r.message);
          this.props.history.push("/chatboard");
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("auth");
          toastr.error(r.error);
          this.props.history.push("/");
        }
      });
  };
  onInputChanged = (e, name) => {
    if (name === "user_name") this.setState({ user_name: e.target.value });
    if (name === "password") this.setState({ password: e.target.value });
  };
  render() {
    return (
      <div className="dashboard">
        <Grid
          textAlign="center"
          style={{ height: "100vh" }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" color="teal" textAlign="center">
              Welcome to chat app
            </Header>
            <Form size="large">
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Enter user name"
                onChange={e => {
                  this.onInputChanged(e, "user_name");
                }}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Enter password"
                onChange={e => {
                  this.onInputChanged(e, "password");
                }}
                type="password"
              />

              <Button onClick={this.onSignIn} color="teal" fluid size="large">
                Sign in
              </Button>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default withRouter(LoginForm);
