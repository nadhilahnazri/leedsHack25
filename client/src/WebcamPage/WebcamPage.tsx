import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://10.41.180.28:5000");

export const WebcamPage = () => {
  const [frames, setFrames] = useState<{ [key: string]: string }>({});
  const [gestures, setGestures] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Listen for updated frames from all clients
    socket.on("update_frames", (data) => {
      setFrames(data);
    });

    // Listen for updated gestures from the local vision system
    socket.on("update_gestures", (data) => {
      setGestures(data);
    });

    return () => {
      socket.off("update_frames");
      socket.off("update_gestures");
    };
  }, []);

  return (
    <div className="webcam-container">
      <h1>Live Webcam Feeds</h1>
      <div className="webcam-grid">
        {Object.entries(frames).map(([id, frame]) => (
          <div key={id} className="webcam-feed">
            <img src={`data:image/jpeg;base64,${frame}`} alt={`Webcam Feed ${id}`} />
            {gestures[id] && <p>Gesture: {gestures[id]}</p>}
          </div>
        ))}
      </div>

      <h2>Detected Gestures</h2>
      <ul>
        {Object.entries(gestures).map(([id, gesture]) => (
          <li key={id}>
            <strong>{id}:</strong> {gesture}
          </li>
        ))}
      </ul>
    </div>
  );
};