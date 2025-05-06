import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

// Initialize socket once (global)
const socket = io("https://casttesting.onrender.com", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 2000,
});

const Viewer = () => {
  const { type } = useParams();
  const [screenData, setScreenData] = useState("");
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("🧭 Viewer mounted for:", type);

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket:", socket.id);
      socket.emit("join-room", "admin-room");
      console.log("👋 Sent join-room for admin-room");
    });

    socket.onAny((event, data) => {
      console.log("📡 Event Received:", event, data);
    });

    if (type === "cast") {
      socket.on("screen-data", (d) => {
        console.log("🖼️ Received screen-data");
        const base64 = typeof d === "string" ? d : d?.data || "";
        setScreenData(`data:image/jpeg;base64,${base64}`);
      });
    }

    if (type === "audio") {
      socket.on("audio-data", (audioBlob) => {
        console.log("🔊 Received audio-data");
        const blob = new Blob([audioBlob], { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        audioRef.current.play();
      });
    }

    if (type === "video") {
      socket.on("video-data", (videoBlob) => {
        console.log("🎥 Received video-data");
        const blob = new Blob([videoBlob], { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        videoRef.current.src = url;
        videoRef.current.play();
      });
    }

    return () => {
      console.log("🔌 Cleaning up socket listeners");
      socket.off("screen-data");
      socket.off("audio-data");
      socket.off("video-data");
    };
  }, [type]);

  return (
    <div>
      <Navbar />
      <h2>Viewing: {type}</h2>

      {type === "cast" && (
        <img
          src={screenData}
          alt="Live Screen"
          style={{ width: "640px", height: "360px", border: "1px solid gray" }}
        />
      )}
      {type === "audio" && <audio ref={audioRef} controls autoPlay />}
      {type === "video" && <video ref={videoRef} controls autoPlay width="640" height="360" />}
    </div>
  );
};

export default Viewer;
