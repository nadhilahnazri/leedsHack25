import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export const WebcamStream = (): JSX.Element => {
  const [image, setImage] = useState("");

  useEffect(() => {
    socket.on("video_frame", (data) => {
      setImage(`data:image/jpeg;base64,${data.frame}`);
    });

    return () => {
      socket.off("video_frame");
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Live Hand Tracking Feed</h1>
      {image ? (
        <img src={image} alt="Live Stream" width="640" height="480" />
      ) : (
        <p>Waiting for video stream...</p>
      )}
    </div>
  );
};
