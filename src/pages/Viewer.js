import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

const socket = io("https://casttesting.onrender.com", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 2000,
});

const Viewer = () => {
  const { type } = useParams();
  const [screenData, setScreenData] = useState("");
  const [videoFrame, setVideoFrame] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("🧭 Viewer mounted for:", type);

    if (!socket.connected) socket.connect();
    socket.emit("join-room", "admin-room");
    console.log("👋 Joined admin-room");

    // 🎥 VIDEO HANDLER
    const handleVideo = (payload) => {
      if (!payload || !payload.data) return;
      const base64 = typeof payload.data === "string" ? payload.data : "";
      const blob = base64ToBlob(base64, "image/jpeg");
      const url = URL.createObjectURL(blob);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
        console.log("🎥 Playing video frame");
      }
    };

    // 🔊 AUDIO HANDLER
    const handleAudio = (payload) => {
      if (!payload || !payload.data) return;
      const blob = new Blob([payload.data], { type: "audio/wav" }); // or audio/webm if needed
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        console.log("🔊 Playing audio chunk");
      }
    };

    // 🖥️ SCREEN HANDLER
    const handleScreen = (payload) => {
      const base64 = typeof payload === "string" ? payload : payload?.data || "";
      setScreenData(`data:image/jpeg;base64,${base64}`);
      console.log("🖼️ Displaying screen frame");
    };

    if (type === "cast") socket.on("screen-data", handleScreen);
    if (type === "video") socket.on("video-data", handleVideo);
    if (type === "audio") socket.on("audio-data", handleAudio);

    return () => {
      socket.off("screen-data", handleScreen);
      socket.off("video-data", handleVideo);
      socket.off("audio-data", handleAudio);
    };
  }, [type]);

  // 📦 Helper to convert base64 string to Blob
  const base64ToBlob = (base64, mimeType) => {
    const byteChars = atob(base64);
    const byteArray = new Uint8Array([...byteChars].map(c => c.charCodeAt(0)));
    return new Blob([byteArray], { type: mimeType });
  };

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

      {type === "video" && (
        <video
          ref={videoRef}
          controls
          autoPlay
          width="640"
          height="360"
          style={{ border: "1px solid gray" }}
        />
      )}

      {type === "audio" && <audio ref={audioRef} controls autoPlay />}
    </div>
  );
};

export default Viewer;
