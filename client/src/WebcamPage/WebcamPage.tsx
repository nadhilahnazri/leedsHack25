import { useEffect, useState } from "react";
import io from "socket.io-client";
import "./WebcamPage.css"; // Import the CSS file

const socket = io("http://localhost:5000");

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

  const usersWithFeeds = Object.entries(frames).filter(([_, frame]) => frame);

  return (
    <div className="webcam-container">
      <h1>Live Webcam Feeds</h1>
      <div className="webcam-grid">
        {usersWithFeeds.map(([id, frame]) => (
          <div key={id} className="user-box">
            <div className="webcam-feed">
              <img 
                src={`data:image/jpeg;base64,${frame}`} 
                alt={`Webcam Feed ${id}`} 
              />
            </div>
            <div className="gesture-info">
              {gestures[id] ? `Gesture: ${gestures[id]}` : "No gesture detected"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
