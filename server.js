// imports
const express = require("express");

const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// configuration
const app = express();
app.use(express.json()); //json gondeririya onu qebul elesin deye
app.use(express.urlencoded({ extended: true }));
dotenv.config();
connectDB();
const PORT = process.env.PORT || 5000;

// routes

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Deployment
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}

app.use(notFound);
app.use(errorHandler);

// listen
const server = app.listen(PORT, console.log(`Started..... ${PORT}`));
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: { origin: "*" },
});
io.on("connection", (socket) => {
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.emit("connected");
  });
  // join chat
  socket.on("join chat", (room) => {
 

    socket.join(room);
  });
  // typing
  socket.on("typing", (room) => {
    socket.broadcast.to(room).emit("typing");
  });
  // stop typing
  socket.on("stop typing", (room) => {
    socket.broadcast.to(room).emit("stop typing");
  });
  // new message
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
  
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
    
      
      socket.broadcast.to(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("Disconnect");
    socket.leave(userData._id);
  });
});
