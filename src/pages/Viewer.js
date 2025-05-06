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
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("🧭 Viewer mounted for:", type);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-room", "admin-room");
    console.log("👋 Joined admin-room");

    const handleScreen = (d) => {
      const base64 = typeof d === "string" ? d : d?.data || "";
      setScreenData(`data:image/jpeg;base64,${base64}`);
    };

    const handleAudio = (audioBlob) => {
      const blob = new Blob([audioBlob], { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    };

    const handleVideo = (videoBlob) => {
      const blob = new Blob([videoBlob], { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
      }
    };

    if (type === "cast") socket.on("screen-data", handleScreen);
    if (type === "audio") socket.on("audio-data", handleAudio);
    if (type === "video") socket.on("video-data", handleVideo);

    return () => {
      console.log("🔌 Cleaning up listeners");
      socket.off("screen-data", handleScreen);
      socket.off("audio-data", handleAudio);
      socket.off("video-data", handleVideo);
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
