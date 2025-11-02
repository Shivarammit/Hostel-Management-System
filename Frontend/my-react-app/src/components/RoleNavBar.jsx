import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function RoleNavBar() {
  const { user, logout } = useAuth();

  return (
<nav className="navbar navbar-expand-lg navbar-dark custom-navbar px-3">
      <Link className="navbar-brand fw-bold" to="/">
        HostelMS
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">
              Home
            </Link>
          </li>

          {user?.role === "Admin" && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/rooms">Rooms</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/reports">Reports</Link>
              </li>
            </>
          )}

          {user?.role === "RC" && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/rc">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/rc/attendance">Attendance</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/gatepasses">Gate Passes</Link>
              </li>
            </>
          )}

          {user?.role === "Student" && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/student">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/student/gatepasses">Apply Gate Pass</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/fees">Fees</Link>
              </li>
            </>
          )}

          {user?.role === "Parent" && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/parent">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/fees">Fees</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/gatepasses">Gate Passes</Link>
              </li>
            </>
          )}
        </ul>

        {/* Right side - User info & Logout */}
        {user && (
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
            Welcome  {user.username}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default RoleNavBar;
