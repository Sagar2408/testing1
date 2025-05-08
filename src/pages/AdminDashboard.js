import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <h2>Admin Dashboard</h2>
      
      <button onClick={() => navigate("/viewer?type=screen")}>View Screen</button>
      <button onClick={() => navigate("/viewer?type=video")}>View Video</button>
      <button onClick={() => navigate("/viewer?type=audio")}>Listen Audio</button>
    </div>
  );
};

export default AdminDashboard;
