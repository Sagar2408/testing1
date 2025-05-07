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

  useEffect(() => {
    console.log("🧭 Viewer mounted for:", type);
    socket.emit("join-room", "admin-room");
    console.log("👋 Joined admin-room");

    if (type === "cast") {
      socket.on("screen-data", (d) => {
        const base64 = typeof d === "string" ? d : d?.data || "";
        setScreenData(`data:image/jpeg;base64,${base64}`);
        console.log("🖼️ Received screen-data");
      });
    }

    if (type === "video") {
      socket.on("video-data", (base64Data) => {
        const image = typeof base64Data === "string" ? base64Data : base64Data?.data || "";
        setVideoFrame(`data:image/jpeg;base64,${image}`);
        console.log("🎥 Received video-data");
      });
    }

    if (type === "audio") {
      socket.on("audio-data", (buffer) => {
        const blob = new Blob([buffer], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
        }
        console.log("🔊 Received audio-data");
      });
    }

    return () => {
      socket.off("screen-data");
      socket.off("video-data");
      socket.off("audio-data");
    };
  }, [type]);

  return (
    <div>
      <Navbar />
      <h2>Viewing: {type}</h2>

      {type === "cast" && (
        <img
          src={screenData}
          alt="Live Screen Frame"
          style={{ width: "640px", height: "360px", border: "1px solid gray" }}
        />
      )}

      {type === "video" && (
        <img
          src={videoFrame}
          alt="Live Video Frame"
          style={{ width: "640px", height: "360px", border: "1px solid gray" }}
        />
      )}

      {type === "audio" && <audio ref={audioRef} controls autoPlay src={audioURL} />}
    </div>
  );
};

export default Viewer;
