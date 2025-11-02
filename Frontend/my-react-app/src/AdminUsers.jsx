import React, { useEffect, useState } from "react";
import ProCard from "./components/ProCard";
import {BASE_API} from "./api";

export default function AdminUsers() {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [rcs, setRcs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search states
  const [search, setSearch] = useState({
    students: "",
    parents: "",
    rcs: "",
    admins: "",
  });
  const [filterField, setFilterField] = useState({
    students: "username",
    parents: "username",
    rcs: "name",
    admins: "username",
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const [studentRes, parentRes, rcRes, adminRes] = await Promise.all([
          fetch(`${BASE_API}/admin/users/students`).then((res) => res.json()),
          fetch(`${BASE_API}/admin/users/parents`).then((res) => res.json()),
          fetch(`${BASE_API}/admin/users/rc`).then((res) => res.json()),
          fetch(`${BASE_API}/admin/users/admins`).then((res) => res.json()),
        ]);

        setStudents(studentRes.students || []);
        setParents(parentRes.parents || []);
        setRcs(rcRes.rcs || []);
        setAdmins(adminRes.admins || []);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filterData = (data, query, field) => {
    if (!query) return data;
    const q = query.toLowerCase().trim();
    return data.filter((item) => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(q);
    });
  };

  if (loading) return <div className="container my-4">Loading...</div>;

  return (
    <div className="container my-4">
      <h2 className="mb-4">Users Management</h2>

      {/* 🧑 Students Section */}
      <ProCard title="Students">
        <div className="d-flex mb-2 gap-2">
          <select
            value={filterField.students}
            onChange={(e) => setFilterField({ ...filterField, students: e.target.value })}
            className="form-select"
            style={{ width: "180px" }}
          >
            <option value="id">ID</option>
            <option value="username">Username</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="semester">Semester</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            value={search.students}
            onChange={(e) => setSearch({ ...search, students: e.target.value })}
          />
        </div>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>ID</th><th>Username</th><th>Email</th><th>Phone</th><th>Semester</th><th>Room ID</th>
              </tr>
            </thead>
            <tbody>
              {filterData(students, search.students, filterField.students).map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.username}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.semester}</td>
                  <td>{s.room_id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProCard>

      {/* 👨‍👩‍👧 Parents Section */}
      <ProCard title="Parents">
        <div className="d-flex mb-2 gap-2">
          <select
            value={filterField.parents}
            onChange={(e) => setFilterField({ ...filterField, parents: e.target.value })}
            className="form-select"
            style={{ width: "180px" }}
          >
            <option value="id">ID</option>
            <option value="student_id">Student ID</option>
            <option value="username">Username</option>
            <option value="phone">Phone</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            value={search.parents}
            onChange={(e) => setSearch({ ...search, parents: e.target.value })}
          />
        </div>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>ID</th><th>Student ID</th><th>Username</th><th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {filterData(parents, search.parents, filterField.parents).map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.student_id}</td>
                  <td>{p.username}</td>
                  <td>{p.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProCard>

     
     {/* 🧑‍🏫 RC Section */}
<ProCard title="RCs">
  <div style={{ maxHeight: 300, overflowY: "auto" }}>
    <table className="table table-bordered table-sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Rooms</th>
        </tr>
      </thead>
      <tbody>
        {rcs.map((r) => (
          <tr key={r.id}>
            <td>{r.id}</td>
            <td>{r.name}</td>
            <td>{r.email}</td>
            <td>{r.phone}</td>
            <td>
              {r.rooms && r.rooms.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {r.rooms.map((room) => (
                    <span
                      key={room.room_id}
                      style={{
                        backgroundColor:
                          room.availability > 0 ? "#b3ffb3" : "#ffb3b3",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        border: "1px solid #ccc",
                        display: "inline-block",
                      }}
                    >
                      {room.room_number} ({room.room_id})
                    </span>
                  ))}
                </div>
              ) : (
                <span>—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</ProCard>


      {/* 🧑‍💼 Admin Section */}
      <ProCard title="Admins">
        <div className="d-flex mb-2 gap-2">
          <select
            value={filterField.admins}
            onChange={(e) => setFilterField({ ...filterField, admins: e.target.value })}
            className="form-select"
            style={{ width: "180px" }}
          >
            <option value="id">ID</option>
            <option value="username">Username</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            value={search.admins}
            onChange={(e) => setSearch({ ...search, admins: e.target.value })}
          />
        </div>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>ID</th><th>Username</th><th>Email</th><th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {filterData(admins, search.admins, filterField.admins).map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.username}</td>
                  <td>{a.email}</td>
                  <td>{a.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProCard>
    </div>
  );
}
