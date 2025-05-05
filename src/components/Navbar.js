import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav style={{ padding: "10px", background: "#007bff", color: "white" }}>
      <span style={{ marginRight: "20px" }}>CAST CRM</span>
      {role && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
};

export default Navbar;
