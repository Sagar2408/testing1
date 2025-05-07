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
  const [videoData, setVideoData] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    console.log("🧭 Viewer mounted for:", type);

    if (!socket.connected) socket.connect();

    socket.emit("join-room", "admin-room");
    console.log("👋 Joined admin-room");

    const handleScreen = (d) => {
      const base64 = typeof d === "string" ? d : d?.data || "";
      setScreenData(`data:image/jpeg;base64,${base64}`);
    };

    const handleAudio = (audioBlob) => {
      console.log("🔊 Received audio-data");
      const blob = new Blob([audioBlob], { type: "audio/wav" }); // updated MIME
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    };

    const handleVideo = (d) => {
      console.log("🎥 Received video-data");
      const base64 = typeof d === "string" ? d : d?.data || "";
      setVideoData(`data:image/jpeg;base64,${base64}`);
    };

    if (type === "cast") socket.on("screen-data", handleScreen);
    if (type === "audio") socket.on("audio-data", handleAudio);
    if (type === "video") socket.on("video-data", handleVideo);

    return () => {
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

      {type === "video" && (
        <img
          src={videoData}
          alt="Live Video Frame"
          style={{ width: "640px", height: "360px", border: "1px solid gray" }}
        />
      )}
    </div>
  );
};

export default Viewer;
