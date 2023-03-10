const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 80;
const botname = "Bot";

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //welcome current user
    socket.emit("message", formatMessage(botname, "Welome to chatbot !!"));

    //sends message to all the clients except user connecting
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botname, `${user.username} joined the chat`)
      );

    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  console.log("someone connected...");

  //listen for chat message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(user.username, msg));
    // console.log(msg);
  });
  // //listen for chat message
  // socket.on("chatMessage", (msg) => {
  //   const user = getCurrentUser(socket.id);
  //     io.to(user.room).emit("message", formatMessage(user.username, msg));
  //   // console.log(msg);
  // });

  //runs when a user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botname, `${user.username} has left the chat`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
