const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend
app.use(express.static("public"));

let users = {};
let messages = [];

// SOCKET CONNECTION
io.on("connection", (socket) => {
    console.log("User connected");

    // JOIN
    socket.on("join", (username) => {
        socket.username = username;
        users[socket.id] = username;

        // Send old messages
        socket.emit("old messages", messages);

        // Update users
        const uniqueUsers = [...new Set(Object.values(users))];
        io.emit("user list", uniqueUsers);

        // Notify others
        socket.broadcast.emit("message", {
            type: "system",
            text: username + " joined"
        });
    });

    // CHAT MESSAGE
    socket.on("chat message", (msg) => {
        const data = {
            type: "chat",
            user: socket.username,
            text: msg,
            time: new Date().toLocaleTimeString()
        };

        messages.push(data);
        io.emit("message", data);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
        const username = users[socket.id];
        delete users[socket.id];

        const uniqueUsers = [...new Set(Object.values(users))];
        io.emit("user list", uniqueUsers);

        if (username) {
            io.emit("message", {
                type: "system",
                text: username + " left"
            });
        }

        console.log("User disconnected");
    });
});

// 🔥 IMPORTANT FOR DEPLOY
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});