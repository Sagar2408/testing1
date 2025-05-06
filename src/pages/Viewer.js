import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

const socket = io("https://casttesting.onrender.com");

const Viewer = () => {
  const { type } = useParams();
  const [screenData, setScreenData] = useState("");
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    socket.emit("join-room", "admin-room");

    if (type === "cast") {
      socket.on("screen-data", (d) => {
        const base64 = typeof d === "string" ? d : d?.data || "";
        setScreenData(`data:image/jpeg;base64,${base64}`);
      });
    }

    if (type === "audio") {
      socket.on("audio-data", (audioBlob) => {
        const blob = new Blob([audioBlob], { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        audioRef.current.play();
      });
    }

    if (type === "video") {
      socket.on("video-data", (videoBlob) => {
        const blob = new Blob([videoBlob], { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        videoRef.current.src = url;
        videoRef.current.play();
      });
    }

    return () => {
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
