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

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Store webcam frames and gestures for all clients
const clientData = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Initialize client data
    clientData[socket.id] = {
        frame: null,
        gesture: null,
        isLocal: false, // Default to false, set to true for the local vision system
    };

    // Handle local vision system connection
    socket.on("set_local", () => {
        clientData[socket.id].isLocal = true;
        console.log(`Client ${socket.id} is the local vision system.`);
    });

    // Receive video frames from clients
    socket.on("video_frame", (data) => {
        clientData[socket.id].frame = data.frame;

        // Broadcast all frames to all clients
        const frames = {};
        for (const [id, data] of Object.entries(clientData)) {
            frames[id] = data.frame;
        }
        io.emit("update_frames", frames);
    });

    // Receive gesture data from the local vision system
    socket.on("gesture_detected", (data) => {
        if (clientData[socket.id].isLocal) {
            clientData[socket.id].gesture = data.gesture;

            // Broadcast gestures to all clients
            const gestures = {};
            for (const [id, data] of Object.entries(clientData)) {
                if (data.isLocal) {
                    gestures[id] = data.gesture;
                }
            }
            io.emit("update_gestures", gestures);
        }
    });

    // Handle client disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete clientData[socket.id];

        // Broadcast updated frames and gestures
        const frames = {};
        const gestures = {};
        for (const [id, data] of Object.entries(clientData)) {
            frames[id] = data.frame;
            if (data.isLocal) {
                gestures[id] = data.gesture;
            }
        }
        io.emit("update_frames", frames);
        io.emit("update_gestures", gestures);
    });
});

server.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});