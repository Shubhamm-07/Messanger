require("dotenv").config();
const express = require("express");
const cors = require("cors");
const socket = require("socket.io");

const connect = require("./config/db");

const app = express();

const corsOptions = {
  origin: "https://messanger-lemon.vercel.app", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // if you need cookies/auth
};
app.use(cors(corsOptions));
app.use(express.json());

const userController = require("./controller/user");
const chatController = require("./controller/chats");
const messageController = require("./controller/messages");

app.use("/auth", userController);
app.use("/chat", chatController);
app.use("/message", messageController);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connect();
    console.log("MongoDB connected");

    const server = app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });

    const io = socket(server, {
      pingTimeout: 6000,
      cors: {
        origin: "https://messanger-lemon.vercel.app",
      },
    });

    io.on("connection", (socket) => {
      socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        socket.join(room);
      });

      socket.on("new message", (recievedMessage) => {
        const chat = recievedMessage.chat;
        chat.users.forEach((user) => {
          if (user === recievedMessage.sender._id) return;
          socket.in(user).emit("message recieved", recievedMessage);
        });
      });
    });

  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();
