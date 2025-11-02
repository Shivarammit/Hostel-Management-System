import React, { createContext, useContext, useState, useEffect } from "react";
import {BASE_API} from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("hms_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("hms_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hms_user");
    }
  }, [user]);

  // Accepts username, password, and role to call corresponding endpoint
  const login = async (username, password, role) => {
  setLoading(true);
  try {
    const endpoint = getEndpointForRole(role);
    console.log("end",endpoint);
    const res = await fetch(`${BASE_API}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    console.log("data", data);
    // setUser(data);

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }
    // Assuming the backend returns a full user object like:
    // { username: "...", email: "...", role: "...", token: "..." }
    data.user.role=role;
    setUser(data.user);  // store the full user object
    console.log("Logged in user:",  data);

    return data;  // return the full user object
  } finally {
    setLoading(false);
  }
};



  // Maps UI role to backend route
  const getEndpointForRole = (role) => {
    switch (role) {
      case "student":
        return "student/login";
      case "parent":
        return "parent/login";
      case "rc":
        return "rc/login";
      case "admin":
        return "admin/login";
      default:
        return "student/login";
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
