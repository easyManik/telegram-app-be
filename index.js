const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
const PORT = 4000;

require("dotenv").config();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const router = require("./src/routes/index");
const { responses } = require("./src/middleware/common");
const helmet = require("helmet");
const createError = require("http-errors");
const messageModel = require("./src/model/message");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const moment = require("moment");
moment.locale("id");

app.use(morgan("dev"));
app.use("/img", express.static("./image"));
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(xss());
app.use(cookieParser());

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    //access-control-allow-credentials:true
    optionSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

socketIO.use((socket, next) => {
  const token = socket.handshake.query.token;
  jwt.verify(token, process.env.JWT_KEY, function (error, payload) {
    if (error) {
      if (error && error.name === "JsonWebTokenError") {
        next(createError(400, "token invalid"));
      } else if (error && error.name === "TokenExpiredError") {
        next(createError(400, "token expired"));
      } else {
        next(createError(400, "Token not active"));
      }
    }

    socket.userId = payload.id;
    socket.join(payload.id);
    next();
  });
});

let users = [];
//Add this before the app.get() block
socketIO.on("connection", (socket) => {
  console.log(
    `⚡: ${socket.id} user just connected! dan id user ${socket.userId}`
  );

  socket.on("inisialRoom", ({ room, username }) => {
    console.log(room);
    socket.join(`room:${room}`);
    socket.broadcast.to(`room:${room}`).emit("notifAdmin", {
      sender: "Admin",
      message: `${username} bergabung dalam group`,
      date: new Date().getHours() + ":" + new Date().getMinutes(),
    });
  });

  socket.on("sendMessage", ({ idReceiver, messageBody }, callback) => {
    const message = {
      receiver_id: idReceiver,
      message: messageBody,
      sender_id: socket.userId,
      created_at: new Date(),
    };
    console.log(message, "message");
    callback({
      ...message,
      created_at: moment(message.post_at).format("LT"),
    });
    messageModel.create(message).then(() => {
      socket.broadcast.to(idReceiver).emit("newMessage", message);
    });
  });
  socket.on("deleteMessage", (data) => {
    console.log(data);
    messageModel.deleteMessage(data.chat_id);

    socket.to(data.chat_id).emit("deleteMessageBE", data);
  });
  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit("newUserResponse", users);
    socket.disconnect();
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

app.all("*", (req, res, next) => {
  responses(res, 404, false, null, "404 Not Found");
});

app.get("/", (req, res, next) => {
  res.status(200).json({ status: "success", statusCode: 200 });
});

http.listen(PORT, () => {
  console.log(`app running on ${PORT}`);
});
