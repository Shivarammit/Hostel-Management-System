import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/pro.css"; // for animations + gradient

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
    <div className="home-page">
      {/* 🔹 Hero Section */}
      <section className="hero-section text-white text-center py-5">
        <div className="container py-5">
          <h1 className="fw-bold display-4 animate-fadeIn">
            Welcome to <span className="text-warning">MIT Hostel</span>
          </h1>
          <p className="lead mt-3 mb-4 animate-fadeIn">
            Experience comfort, safety, and a community that feels like home.
          </p>

          {!user ? (
            <div className="d-flex justify-content-center gap-3 animate-slideUp">
              <button
                className="btn btn-light px-4 fw-semibold shadow-sm"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn btn-warning px-4 fw-semibold shadow-sm"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          ) : (
            <h5 className="fw-semibold mt-4 text-light animate-fadeIn">
              You are logged in — Welcome back!
            </h5>
          )}
        </div>
      </section>

      
      {/* 🔹 Hostel Gallery */}
      <section className="container my-5">
        <h2 className="text-center mb-4 fw-bold text-primary">Hostel Gallery</h2>
        <div className="row g-4">
          {hostelImages.map((img, index) => (
            <div className="col-md-3 col-sm-6" key={index}>
              <div className="card border-0 shadow-sm gallery-card h-100">
                <img
                  src={img}
                  alt={`Hostel ${index + 1}`}
                  className="card-img-top rounded-4 hover-zoom"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body text-center">
                  <h6 className="fw-semibold text-muted">Hostel {index + 1}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Rooms Section */}
      <section className="rooms-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold text-primary">Our Rooms</h2>
          <div className="row g-4">
            {roomImages.map((img, index) => (
              <div className="col-md-3 col-sm-6" key={index}>
                <div className="card border-0 shadow-sm room-card h-100">
                  <img
                    src={img}
                    alt={`Room ${index + 1}`}
                    className="card-img-top rounded-4 hover-zoom"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body text-center">
                    <h6 className="fw-semibold text-muted">Room Type {index + 1}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 🔹 About Section */}
      <section className="about-section py-5 text-white" style={{ background: 'linear-gradient(90deg, #007bff, #6610f2)' }}>
        <div className="container text-center">
          <h2 className="mb-4 fw-bold animate-fadeIn">About MIT Hostel</h2>
          <p className="lead animate-slideUp">
            MIT Hostel provides a safe, clean, and vibrant environment for students. Our hostels are equipped with modern amenities, spacious rooms, and a friendly atmosphere that promotes learning and community.
          </p>
          <p className="animate-slideUp">
            Our mission is to ensure every student feels at home, while fostering personal growth and independence.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Home;
