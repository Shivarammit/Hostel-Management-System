import React, { useState, useEffect } from "react";
import { BASE_API } from "../../api";

export default function Rooms() {
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [rcList, setRcList] = useState([]);
  const [selectedRcId, setSelectedRcId] = useState("");

  // Fetch rooms
  useEffect(() => {
    fetch(`${BASE_API}/api/rooms`)
      .then((res) => res.json())
      .then((data) => setRooms(data.rooms || []))
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);
console.log(rooms);
  // Fetch RC list
  useEffect(() => {
    fetch(`${BASE_API}/admin/users/rc`)
      .then((res) => res.json())
      .then((data) => setRcList(data.rcs || []))
      .catch((err) => console.error("Error fetching RCs:", err));
  }, []);

  // Filter rooms by search
  const filteredRooms = rooms.filter((room) =>
    room.room_number.toLowerCase().includes(search.toLowerCase())
  );

  // Handle RC assignment
  const assignRcToRoom = async () => {
    if (!selectedRoom || !selectedRcId) {
      alert("Please select an RC first.");
      return;
    }

    try {
      const res = await fetch(`${BASE_API}/api/rooms/${selectedRoom.id}/assign_rc/${selectedRcId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        alert("RC assigned successfully!");
        // Update UI instantly
        setRooms((prev) =>
          prev.map((r) =>
            r.id === selectedRoom.id ? { ...r, rc_id: selectedRcId } : r
          )
        );
        setSelectedRoom({ ...selectedRoom, rc_id: selectedRcId });
      } else {
        alert("Failed to assign RC.");
      }
    } catch (err) {
      console.error("Error assigning RC:", err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px" }}>Rooms Dashboard</h2>

      {/* 🔍 Search Bar */}
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

      {/* 🏠 Rooms Display */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {filteredRooms.length === 0 && <p>No rooms found.</p>}
        {filteredRooms.map((r) => (
          <div
            key={r.id}
            onClick={() => {
              setSelectedRoom(r);
              setSelectedRcId(r.rc_id || "");
            }}
            style={{
              width: "120px",
              height: "120px",
              backgroundColor: r.availability === 0 ? "#ffb3b3" : "#b3ffb3",
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
            <div style={{ textAlign: "center" }}>
              <strong>{r.room_number}</strong>
              <div style={{ fontSize: "12px", color: "#555" }}>
                Beds: {r.availability}
                <br />
                RC ID: {r.rc_id || "—"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🪟 Room Modal */}
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
            <h3>Room {selectedRoom.room_number}</h3>
            <p><strong>Room ID:</strong> {selectedRoom.id}</p>
            <p><strong>RC ID:</strong> {selectedRoom.rc_id || "—"}</p>
            <p><strong>Beds Available:</strong> {selectedRoom.availability}</p>

            {/* 🧑‍🏫 RC Assignment Section */}
            <div style={{ marginTop: "20px" }}>
              <h4>Assign / Change RC</h4>
              <select
                value={selectedRcId}
                onChange={(e) => setSelectedRcId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select RC</option>
                {rcList.map((rc) => (
                  <option key={rc.id} value={rc.id}>
                    {rc.name} (ID: {rc.id})
                  </option>
                ))}
              </select>
              <button
                onClick={assignRcToRoom}
                style={{
                  marginTop: "10px",
                  padding: "10px 15px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Assign RC
              </button>
            </div>

            <hr />
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
