import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const Viewer = () => {
  const { type } = useParams();
  const [data, setData] = useState("");

  useEffect(() => {
    socket.emit("join-room", "admin-room");
    socket.on("screen-data", (d) => setData(`data:image/jpeg;base64,${d}`));
    return () => socket.off("screen-data");
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Viewing: {type}</h2>
      {type === "cast" && <img src={data} alt="Live Screen" />}
    </div>
  );
};

export default Viewer;
