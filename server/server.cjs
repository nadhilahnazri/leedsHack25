const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all clients to connect (change if needed)
        methods: ["GET", "POST"]
    }
});

const players = {}; // Track connected players

io.on("connection", (socket) => {
    console.log(`🔵 Player connected: ${socket.id}`);
    players[socket.id] = { id: socket.id, health: 100, gesture: "None" }; // Default values

    // Send current player list to the newly connected player
    socket.emit("current_players", players);

    // Notify all players about the new player
    io.emit("player_connected", players[socket.id]);

    // Receive gesture from a player
    socket.on("gesture_detected", (data) => {
        const { gesture } = data;
        players[socket.id].gesture = gesture; // Update player's gesture
        console.log(`📡 ${socket.id} performed: ${gesture}`);

        // Broadcast the player's gesture to all other players
        io.emit("update_gestures", { playerId: socket.id, gesture });
    });

    // Handle player disconnection
    socket.on("disconnect", () => {
        console.log(`🔴 Player disconnected: ${socket.id}`);
        delete players[socket.id];

        // Notify all players
        io.emit("player_disconnected", { playerId: socket.id });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
