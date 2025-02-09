const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let players = [];  // Store connected players
let playerHealth = { 1: 100, 2: 100 };  // Initial HP for Player 1 & 2

io.on("connection", (socket) => {
  console.log(`A player connected: ${socket.id}`);

  // Assign player number 1 or 2 based on number of players already connected
  if (players.length >= 2) {
    socket.disconnect();  // Disconnect if more than 2 players are already connected
    console.log("A player tried to connect but the game is full.");
    return;
  }

  const playerNumber = players.length + 1;
  players.push({ id: socket.id, playerNumber });

  // Inform the player about their assigned player number
  socket.emit("player_assigned", playerNumber);
  console.log(`Player ${playerNumber} connected.`);

  // Handle gesture updates from the player
  socket.on("gesture_detected", (gesture) => {
    console.log(`Player ${playerNumber} sent gesture: ${gesture}`);
    // Broadcast the gesture to the other player
    socket.broadcast.emit("opponent_gesture", { playerNumber, gesture });
  });

  // Handle health updates from players (e.g., when an attack happens)
  socket.on("health_update", (newHealth) => {
    playerHealth[playerNumber] = newHealth;
    console.log(`Player ${playerNumber} HP updated: ${newHealth}`);
    // Broadcast updated health to both players
    io.emit("player_health", playerHealth);
  });

  // Check if the player's health is 0 or less and broadcast game over
  if (newHealth <= 0) {
    const winner = playerNumber === 1 ? 2 : 1;
    io.emit("game_over", { winner });
  }
});

  // Handle disconnection
  socket.on("disconnect", () => {
    players = players.filter((p) => p.id !== socket.id);
    console.log(`Player ${playerNumber} disconnected: ${socket.id}`);
  });
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
