const express = require("express");

require("dotenv").config();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const router = require("./src/routes/index");
const { responses } = require("./src/middleware/common");

const { createServer } = require("http");
const { Server } = require("socket.io");

const helmet = require("helmet");
const createError = require("http-errors");
const messageModel = require("./src/model/message");
const xss = require("xss-clean");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const moment = require("moment");
moment.locale("id");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
const PORT = 4000;

io.on("connection", (socket) => {
  console.log(`user connect ${socket.id}`);

  socket.on("message", (data) => {
    let time = new Date();
    io.emit("messageBe", { message: data, date: time });
    // socket.broadcast.emit("messageBe",{message: data, date: time})
    console.log("data user after connect", data);
  });

  socket.on("disconnect", () => {
    console.log(`user disconnect ${socket.id}`);
  });

  socket.on("sendMessage", ({ receiver_id, body }, callback) => {
    const message = {
      receiver_id: receiver_id,
      message: body,
      sender_id: socket.id,
      post_at: new Date(),
    };
    callback({
      ...message,
      post_at: moment(message.post_at).format("LT"),
    });
    messageModel.create(message).then(() => {
      socket.broadcast.to(receiver_id).emit("newMessage", message);
    });
  });

  socket.on("deleteMessage", (data) => {
    console.log("delet message", data);
    messageModel.deleteMessage(data.id);

    socket.to(data.id).emit("deleteMessageBE", data);
  });
});

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  jwt.verify(token, process.env.SECRET_KEY_JWT, function (error, payload) {
    if (error) {
      if (error && error.name === "JsonWebTokenError") {
        next(createError(400, "token invalid"));
      } else if (error && error.name === "TokenExpiredError") {
        next(createError(400, "token expired"));
      } else {
        next(createError(400, "Token not active"));
      }
    }

    socket.id = payload.id;
    socket.join(paylaod.id);
    next();
  });
});

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use("/img", express.static("./image"));
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

app.all("*", (req, res, next) => {
  responses(res, 404, false, null, "404 Not Found");
});

app.get("/", (req, res, next) => {
  res.status(200).json({ status: "success", statusCode: 200 });
});

httpServer.listen(PORT, () => {
  console.log(`app running on ${PORT}`);
});
