import React, { useState, useEffect } from "react";

export default function Rooms() {
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data.rooms || []));
  }, []);

  const filteredRooms = rooms.filter(
    (r) => r.roomNumber.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px" }}>Rooms Dashboard</h2>
      <input
        type="text"
        placeholder="Search by room number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          maxWidth: "300px",
          marginBottom: "30px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      {Array.from(new Set(filteredRooms.map((r) => r.hostel.hostelName))).map((hostelName) => (
        <div key={hostelName} style={{ marginBottom: "40px" }}>
          <h3 style={{ color: "#1E90FF", marginBottom: "15px" }}>{hostelName} Hostel</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            {filteredRooms
              .filter((r) => r.hostel.hostelName === hostelName)
              .map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoom(r)}
                  style={{
                    width: "120px",
                    height: "120px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <strong>{r.roomNumber}</strong>
                </div>
              ))}
          </div>
        </div>
      ))}
      {selectedRoom && (
        <div
          onClick={() => setSelectedRoom(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3>Room {selectedRoom.roomNumber}</h3>
            <p>
              <strong>Hostel</strong>: {selectedRoom.hostel.hostelName}
            </p>
            <p>
              <strong>RC</strong>: {selectedRoom.rcName}
            </p>
            <p>
              <strong>Beds</strong>: {selectedRoom.beds}
            </p>
            <p>
              <strong>Occupied</strong>: {selectedRoom.filled}
            </p>
            <hr />
            <h4>Students</h4>
            {selectedRoom.students.length === 0 ? (
              <p>No students assigned</p>
            ) : (
              <ul>
                {selectedRoom.students.map((s, idx) => (
                  <li key={idx}>
                    {s.name} ({s.phone})
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setSelectedRoom(null)}
              style={{
                marginTop: "10px",
                padding: "10px 15px",
                backgroundColor: "#1E90FF",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
