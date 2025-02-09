import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from 'react-router-dom';

function App() {
  const socketRef = useRef();
  const [playerNumber, setPlayerNumber] = useState(null);
  const [player1Gesture, setPlayer1Gesture] = useState("No gesture detected");
  const [player2Gesture, setPlayer2Gesture] = useState("No gesture detected");
  const [player1Health, setPlayer1Health] = useState(100);
  const [player2Health, setPlayer2Health] = useState(100);
  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("player_assigned", (number) => {
      setPlayerNumber(number);
    });

    socketRef.current.on("gesture_received", ({ playerNumber, gesture }) => {
      if (playerNumber === 1) {
        setPlayer1Gesture(gesture);
      } else {
        setPlayer2Gesture(gesture);
      }
    });

    socketRef.current.on("health_update", ({ playerNumber, health }) => {
      if (playerNumber === 1) {
        setPlayer1Health(health);
        if (health <= 0) {
          navigate('/game-over', { state: { winner: 2 } });
        }
      } else {
        setPlayer2Health(health);
        if (health <= 0) {
          navigate('/game-over', { state: { winner: 1 } });
        }
      }
    });

    return () => socketRef.current.disconnect();
  }, []);

  // Function to be called by Vision Engineer's gesture detection
  const updateGesture = (gesture) => {
    if (playerNumber === 1) {
      setPlayer1Gesture(gesture);
    } else {
      setPlayer2Gesture(gesture);
    }
    socketRef.current.emit("gesture_update", gesture);
  };

  window.updateGesture = updateGesture;

  return (
    <div>
      <h1>Hand Gesture Detection</h1>
      <p>You are: Player {playerNumber}</p>
      <div>
        <h2>Player 1</h2>
        <p>Gesture: {player1Gesture}</p>
        <p>Health: {player1Health}</p>
      </div>
      <div>
        <h2>Player 2</h2>
        <p>Gesture: {player2Gesture}</p>
        <p>Health: {player2Health}</p>
      </div>
    </div>
  );
}

export default App;