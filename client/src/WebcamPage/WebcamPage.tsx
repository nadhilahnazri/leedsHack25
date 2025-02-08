import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export const WebcamPage = () => {
  const [videoFrame, setVideoFrame] = useState<string | null>(null);
  const [gestures, setGestures] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    socket.on("video_frame", (data) => {
      setVideoFrame(`data:image/jpeg;base64,${data.frame}`);
    });

    socket.on("update_gestures", (data) => {
      setGestures(data);
    });

    return () => {
      socket.off("video_frame");
      socket.off("update_gestures");
    };
  }, []);

  return (
    <div className="webcam-container">
      <h1>Live Webcam & Gestures</h1>
      {videoFrame && <img src={videoFrame} alt="Webcam Feed" className="webcam-feed" />}
      
      <h2>Detected Gestures</h2>
      <ul>
        {Object.entries(gestures).map(([user, gesture]) => (
          <li key={user}>
            <strong>{user}:</strong> {gesture}
          </li>
        ))}
      </ul>
    </div>
  );
};
