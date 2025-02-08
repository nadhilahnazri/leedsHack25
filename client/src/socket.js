import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Change to actual backend IP if needed

socket.on("connect", () => {
    console.log("🟢 Connected to WebSocket server:", socket.id);
});

socket.on("disconnect", () => {
    console.log("🔴 Disconnected from server");
});

socket.on("update_gestures", (data) => {
    console.log(`👋 Player ${data.playerId} did ${data.gesture}`);
});

export default socket;
