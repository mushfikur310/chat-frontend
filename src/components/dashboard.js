import React from "react";
import { Grid, Card, List, Button, Icon, Modal, Form } from "semantic-ui-react";
import { withRouter } from "react-router-dom";
import toastr from "toastr";
import "./common.css";

const baseURL = process.env.REACT_APP_BASE_URL;

class Dashboard extends React.Component {
  state = {
    channels: "",
    open: false,
    newChannel: ""
  };
  componentDidMount() {
    this.getAllChannels();
  }

  getAllChannels = async () => {
    let token = localStorage.getItem("token");
    fetch(`${baseURL}/get-rooms`, {
      method: "GET",
      headers: {
        token,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        return response.json();
      })
      .then(r => {
        // console.log(r);
        if (r.success) {
          this.setState({
            channels: r.result
          });
        } else {
          toastr.error(r.message);
          this.props.history.push("/");
        }
      });
  };

  logOut = () => {
    let token = localStorage.getItem("token");
    fetch(`${baseURL}/sign-out`, {
      method: "POST",
      headers: {
        token,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        return response.json();
      })
      .then(r => {
        if (r.success) {
          window.localStorage.clear();
          this.props.history.push("/");
        }
      });
  };
  chat = (e, id, c) => {
    window.localStorage.setItem("msg", c.name);
    this.props.history.push(`/room/${id}`);
  };
  newChannelModalOpen = () => {
    this.setState({
      open: true
    });
  };
  createChannel = async () => {
    let token = localStorage.getItem("token");
    let reqBody = {
      roomname: this.state.newChannel
    };
    fetch(`${baseURL}/create-room`, {
      method: "POST",
      headers: {
        token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    })
      .then(response => {
        return response.json();
      })
      .then(r => {
        if (r.success) {
          toastr.success(r.message);
          this.setState({
            channels: r.result,
            newChannel: "",
            open: false
          });
        } else {
          toastr.error(r.error);
        }
      });
  };
  closeNewChannel = () => {
    this.setState({
      open: false,
      newChnanel: ""
    });
  };
  onInputChanged = (e, name) => {
    if (name === "newChannel") this.setState({ newChannel: e.target.value });
  };
  render() {
    let { channels } = this.state;
    return (
      <div className="dashboard">
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <p className="channels">Chat rooms</p>
              <p className="newChannel">
                <Button onClick={this.newChannelModalOpen} primary>
                  Create new channel
                </Button>
              </p>
              <Card.Group>
                <Card fluid>
                  <Card.Content>
                    <List>
                      {channels &&
                        channels.length > 0 &&
                        channels.map((c, k) => {
                          return (
                            <a key={k}>
                              <List.Item>
                                <Button
                                  onClick={e => {
                                    this.chat(e, c._id, c);
                                  }}
                                  style={{ width: "80%", marginBottom: "1em" }}
                                >
                                  <Icon
                                    style={{ float: "left" }}
                                    name="discussions"
                                  />{" "}
                                  {c.name}
                                </Button>
                              </List.Item>
                            </a>
                          );
                        })}
                    </List>
                  </Card.Content>
                </Card>
              </Card.Group>
            </Grid.Column>
            <Grid.Column width={11} className="chat">
              <div className="logout">
                <Button onClick={this.logOut} primary>
                  <Icon name="sign-out" /> Signout
                </Button>
              </div>
              <Card.Group>
                <Card fluid>
                  <Card.Content>
                    <List>
                      <div className="chat">
                        <Icon size="massive" name="comment" />
                        <p style={{ color: "#74b9ff" }}>
                          Select a channel to start chatting
                        </p>
                      </div>
                    </List>
                  </Card.Content>
                </Card>
              </Card.Group>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Modal size="small" open={this.state.open} onClose={this.close}>
          <Modal.Header style={{ color: "#636e72" }}>
            Create new channel
          </Modal.Header>
          <Modal.Content>
            <div>
              <Form>
                <Form.Field>
                  <label style={{ color: "#636e72" }}>
                    Type a channel name
                  </label>
                  <input
                    placeholder="Please type a new channel name"
                    value={this.state.newChannel}
                    onChange={e => {
                      this.onInputChanged(e, "newChannel");
                    }}
                  />
                </Form.Field>
              </Form>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={this.closeNewChannel} negative>
              No
            </Button>
            {this.state.newChannel ? (
              <Button
                onClick={this.createChannel}
                positive
                icon="checkmark"
                labelPosition="right"
                content="Yes"
              />
            ) : (
              <Button
                disabled
                onClick={this.createChannel}
                positive
                icon="checkmark"
                labelPosition="right"
                content="Yes"
              />
            )}
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default withRouter(Dashboard);
