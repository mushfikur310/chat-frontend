import React from "react";
import {
  Grid,
  Card,
  List,
  Button,
  Icon,
  Input,
  Modal,
  Form
} from "semantic-ui-react";
import { withRouter, NavLink } from "react-router-dom";
import toastr from "toastr";
import "./common.css";
import io from "socket.io-client";
import moment from "moment";

const baseURL = process.env.REACT_APP_BASE_URL;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

class ChatBoard extends React.Component {
  state = {
    channels: [],
    c_name: "",
    open: false,
    newChannel: "",
    text: "",
    messages: [
      {
        author: "John doe ",
        message: "Hey! how are you ?",
        time: moment().format("hh:mm A")
      }
    ],
    selectedChannel: {},
    newMessage: []
  };
  componentDidMount() {
    this.setState({
      c_name: window.localStorage.getItem("msg"),
      activeChat: true
    });
    this.getAllChannels();
    this.socket = io(SOCKET_URL);

    this.socket.on("RECEIVE", data => {
      if (
        window.location.href.substring(
          window.location.href.lastIndexOf("/") + 1
        ) === data.room
      ) {
        this.setState({
          messages: [...this.state.messages, data.data]
        });
      }
    });
  }

  getAllChannels = async () => {
    let selectedChannel = {};
    let urlId = window.location.href.substring(
      window.location.href.lastIndexOf("/") + 1
    );
    let token = localStorage.getItem("token");
    await fetch(`${baseURL}/get-rooms`, {
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
        if (r.success) {
          this.setState({
            channels: r.result
          });
          selectedChannel = r.result.filter(c => c._id == urlId);
        } else {
          toastr.error(r.message);
          this.props.history.push("/");
        }
      });

    this.setState({ selectedChannel: selectedChannel[0] });
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
    this.setState({ selectedChannel: c });
    // this.props.history.push(`/room/${id}`);
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
  onMessageChanged = (e, name) => {
    let msgObj = {};
    if (name === "text") {
      this.setState({
        text: e.target.value
      });
      msgObj.message = e.target.value;
      msgObj.time = moment().format("hh:mm A");
    }
    this.setState({
      newMessage: msgObj
    });
  };
  sendMessage = () => {
    let newMessage = [...this.state.messages];
    let typedMessage = { ...this.state.newMessage };
    //newMessage.push(typedMessage);
    let roomId = window.location.href.substring(
      window.location.href.lastIndexOf("/") + 1
    );
    let now = moment().format("hh:mm A");
    this.socket.emit("SEND", {
      room: roomId,
      data: {
        time: now,
        author: window.localStorage.getItem("username"),
        message: typedMessage.message
      }
    });
    this.setState({
      messages: newMessage,
      text: ""
    });
  };
  render() {
    let { channels, messages, selectedChannel } = this.state;
    let username = window.localStorage.getItem("username");
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
                            <NavLink key={k} to={`/room/${c._id}`}>
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
                            </NavLink>
                          );
                        })}
                    </List>
                  </Card.Content>
                </Card>
              </Card.Group>
            </Grid.Column>
            <Grid.Column width={11} className="chat">
              <div className="logout">
                <p
                  style={{ float: "left", marginTop: "7px", color: "#57606f" }}
                >
                  Welcome{" "}
                  <span style={{ color: "#1e90ff" }}>
                    {window.localStorage.getItem("username")}
                  </span>
                </p>
                <Button onClick={this.logOut} primary>
                  <Icon name="sign-out" /> Signout
                </Button>
              </div>
              <Card.Group>
                <Card fluid>
                  <Card.Content>
                    <div className="conversation">
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#0984e3",
                          borderBottom: "1px solid #ced6e0"
                        }}
                      >
                        {selectedChannel.name}
                      </p>
                      {messages &&
                        messages.length > 0 &&
                        messages.map((m, k) => {
                          return (
                            <div key={k} className="message-container">
                              <div className="user">
                                <span>{`${m.author} `}</span>
                                {m.time}
                              </div>
                              <div className="message">{m.message}</div>
                            </div>
                          );
                        })}
                    </div>
                  </Card.Content>
                </Card>
              </Card.Group>
              <div style={{ marginTop: "1em" }}>
                <Input
                  fluid
                  type="text"
                  placeholder="Type a message"
                  value={this.state.text}
                  onChange={e => {
                    this.onMessageChanged(e, "text");
                  }}
                  action
                >
                  <input />
                  {this.state.text ? (
                    <Button onClick={this.sendMessage} primary type="submit">
                      <Icon name="send" />
                    </Button>
                  ) : (
                    <Button
                      onClick={this.sendMessage}
                      primary
                      disabled
                      type="submit"
                    >
                      <Icon name="send" />
                    </Button>
                  )}
                </Input>
              </div>
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

export default withRouter(ChatBoard);
