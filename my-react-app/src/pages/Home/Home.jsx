import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/pro.css"; // optional custom styles

import Amaravathi from "../../Images/Hostels/Amaravathi.jpg";
import Kurinchi from "../../Images/Hostels/Kurinchi.jpg";
import Marutham from "../../Images/Hostels/Marutham.jpg";
import MitHostels from "../../Images/Hostels/Mit_hostels.jpg";

import Room1 from "../../Images/Rooms/Room1.jpg";
import Room2 from "../../Images/Rooms/Room2.jpg";
import Room3 from "../../Images/Rooms/Room3.jpg";
import Room4 from "../../Images/Rooms/Room4.jpg";

function Home({ user }) {
  const navigate = useNavigate();

   const hostelImages = [Amaravathi, Kurinchi, Marutham, MitHostels];




const roomImages = [Room1, Room2, Room3, Room4];


  return (
    <div className="home-page bg-light">
      {/* 🔹 Hero Section */}
      <section className="text-center py-5 bg-primary text-white">
        <div className="container">
          <h1 className="fw-bold display-5">Welcome to MIT Hostel</h1>
          <p className="lead mt-3 mb-4">
            Comfortable rooms, clean environment, and a friendly atmosphere for all students.
          </p>

          {/* Only show login/register if user is NOT logged in */}
          {!user ? (
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-light px-4 fw-semibold"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn btn-warning px-4 fw-semibold"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <h5 className="fw-semibold">You are logged in 🎉 — Welcome back!</h5>
            </div>
          )}
        </div>
      </section>

      {/* 🔹 Hostel Gallery */}
      <section className="container my-5">
        <h2 className="text-center mb-4 fw-bold text-primary">Hostel Gallery</h2>
        <div className="row g-4">
          {hostelImages.map((img, index) => (
            <div className="col-md-3 col-sm-6" key={index}>
              <div className="card shadow-sm border-0 gallery-card">
                <img
                  src={img}
                  alt={`Hostel ${index + 1}`}
                  className="card-img-top rounded"
                  style={{ height: "200px", objectFit: "cover" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Rooms Section */}
      <section className="bg-light py-5">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold text-primary">Our Rooms</h2>
          <div className="row g-4">
            {roomImages.map((img, index) => (
              <div className="col-md-4" key={index}>
                <div className="card shadow-sm border-0">
                  <img
                    src={img}
                    alt={`Room ${index + 1}`}
                    className="card-img-top rounded-top"
                    style={{ height: "220px", objectFit: "cover" }}
                  />
                  <div className="card-body text-center">
                   
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
