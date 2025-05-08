import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Viewer from "./pages/Viewer";

const App = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/executive/dashboard" element={<ExecutiveDashboard />} />
    <Route path="/viewer" element={<Viewer />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default App;
