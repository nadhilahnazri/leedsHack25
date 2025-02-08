// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "*", // Allow all clients to connect (change if needed)
//         methods: ["GET", "POST"]
//     }
// });

// const players = {}; // Track connected players

// io.on("connection", (socket) => {
//     console.log(`🔵 Player connected: ${socket.id}`);
//     players[socket.id] = { id: socket.id, health: 100, gesture: "None" }; // Default values

//     // Send current player list to the newly connected player
//     socket.emit("current_players", players);

//     // Notify all players about the new player
//     io.emit("player_connected", players[socket.id]);

//     // Receive gesture from a player
//     socket.on("gesture_detected", (data) => {
//         const { gesture } = data;
//         players[socket.id].gesture = gesture; // Update player's gesture
//         console.log(`📡 ${socket.id} performed: ${gesture}`);

//         // Broadcast the player's gesture to all other players
//         io.emit("update_gestures", { playerId: socket.id, gesture });
//     });

//     // Handle player disconnection
//     socket.on("disconnect", () => {
//         console.log(`🔴 Player disconnected: ${socket.id}`);
//         delete players[socket.id];

//         // Notify all players
//         io.emit("player_disconnected", { playerId: socket.id });
//     });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let latestFrame = null;  // Store the latest video frame
const userGestures = {}; // Store gestures per user

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send the latest frame when a new client connects
    if (latestFrame) {
        setInterval(() => {
            socket.emit("video_frame", { frame: latestFrame });
        }, 1000);
    }

    // Receive video frames from Python script
    socket.on("video_frame", (data) => {
        console.log("Received frame from Python:", data.frame.length, "bytes");
        latestFrame = data.frame;
        io.emit("video_frame", { frame: latestFrame });
    });

    // Receive gesture data from Python script
    socket.on("gesture_detected", (data) => {
        console.log(`Gesture from ${socket.id}: ${data.gesture}`);
        userGestures[socket.id] = data.gesture;

        // Broadcast updated gestures to all clients
        io.emit("update_gestures", userGestures);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete userGestures[socket.id]; // Remove user gesture on disconnect
        io.emit("update_gestures", userGestures);
    });
});

server.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});

