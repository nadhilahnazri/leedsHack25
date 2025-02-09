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