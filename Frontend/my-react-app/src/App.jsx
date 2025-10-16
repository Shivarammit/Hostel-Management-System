import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import AdminDashboard from "./pages/Dashboards/AdminDashboard";
import RCDashboard from "./pages/Dashboards/RCDashboard";
import ParentDashboard from "./pages/Dashboards/ParentDashboard";
import StudentDashboard from "./pages/Dashboards/StudentDashboard";

import GatePassList from "./pages/GatePasses/GatePassList";
import GatePassCreate from "./pages/GatePasses/GatePassCreate";

import Attendance from "./pages/Attendance/Attendance";
import RCAttendance from "./pages/Attendance/RCAttendance";

import Fees from "./pages/Fees/Fees";
import Rooms from "./pages/Rooms/Rooms";
import Reports from "./pages/Reports/Reports";

import RoleNavBar from "./components/RoleNavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home/Home";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/pro.css";

// -------------------------------------------------
// MAIN APP COMPONENT
// -------------------------------------------------
function App() {
  const { user } = useAuth();
  const location = useLocation();

  // Hide navbar & footer only on login/register pages
  const hideNavAndFooter =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-root bg-light min-vh-100 d-flex flex-column">
      {/* 🔹 Navbar - Visible only when logged in and not on login/register */}
      {!hideNavAndFooter && user && <RoleNavBar />}

      {/* 🔹 Page Content */}
      <main className="container-fluid px-0 flex-grow-1">
        <Routes>
          {/* ----------- HOME PAGE (Always visible) ----------- */}
          <Route path="/" element={<Home user={user} />} />

          {/* ----------- AUTH ----------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ----------- STUDENT ----------- */}
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={["Student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/gatepasses"
            element={
              <ProtectedRoute roles={["Student"]}>
                <GatePassCreate />
              </ProtectedRoute>
            }
          />

          <Route
  path="/rc/attendance"
  element={
    <ProtectedRoute roles={["RC"]}>
      <RCAttendance />
    </ProtectedRoute>
  }
/>

          {/* ----------- PARENT ----------- */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute roles={["Parent"]}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />

          {/* ----------- RESIDENTIAL COUNSELLOR (RC) ----------- */}
          <Route
            path="/rc"
            element={
              <ProtectedRoute roles={["RC"]}>
                <RCDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rc/attendance"
            element={
              <ProtectedRoute roles={["RC"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />

          {/* ----------- ADMIN ----------- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <Rooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* ----------- GATE PASSES (for RC, Parent, Admin) ----------- */}
          <Route
            path="/gatepasses"
            element={
              <ProtectedRoute roles={["RC", "Parent", "Admin"]}>
                <GatePassList />
              </ProtectedRoute>
            }
          />

          {/* ----------- FEES (Student, Parent, Admin) ----------- */}
          <Route
            path="/fees"
            element={
              <ProtectedRoute roles={["Student", "Parent", "Admin"]}>
                <Fees />
              </ProtectedRoute>
            }
          />

          {/* ----------- 404 PAGE ----------- */}
          <Route
            path="*"
            element={
              <div className="text-center mt-5">
                <h3 className="text-danger fw-bold">404 — Page Not Found</h3>
                <p className="text-muted">The page you’re looking for doesn’t exist.</p>
              </div>
            }
          />
        </Routes>
      </main>

      {/* 🔹 Footer - Hide on login/register */}
      {!hideNavAndFooter && (
        <footer className="footer bg-dark text-light text-center py-3 mt-auto">
          <small>© {new Date().getFullYear()} Hostel Management System</small>
        </footer>
      )}
    </div>
  );
}

export default App;
