const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

let users = [];

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("join", (username) => {
        socket.username = username;
        users.push(username);

        io.emit("user list", users);
        io.emit("system message", username + " joined");
    });

    socket.on("chat message", (msg) => {
        io.emit("chat message", {
            user: socket.username,
            text: msg,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on("disconnect", () => {
        users = users.filter(u => u !== socket.username);

        io.emit("user list", users);

        if (socket.username) {
            io.emit("system message", socket.username + " left");
        }
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});