// File: src/components/Routes.js

import React from "react";
import { Routes, Route } from "react-router-dom";
import ManagerDashboard from "../app/manager-dashboard/page"; // Your dashboard component
import Login from "../app/login/page"; // Your login component

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ManagerDashboard />} />
      <Route path="/login" element={<Login />} />
<<<<<<< HEAD
      <Route path="/callback" element={<GoogleCallbackPage />} />
=======
<<<<<<< HEAD
=======
      <Route path="/callback" element={<GoogleCallbackPage />} />
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
      {/* Add more routes here */}
    </Routes>
  );
}