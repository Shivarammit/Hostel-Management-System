import React, { useEffect, useState } from "react";
import { api } from "../../api/mockApi";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weekData, setWeekData] = useState({});
  const [weekKey, setWeekKey] = useState("");

  const getWeekKey = (dateStr) => {
    const d = new Date(dateStr);
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${week}`;
  };

  useEffect(() => {
    async function load() {
      const s = await api.fetchStudents();
      setStudents(s);
      const wk = getWeekKey(date);
      setWeekKey(wk);
      const data = await api.getAttendanceWeek(wk);
      setWeekData(data);
    }
    load();
  }, [date]);

  const toggle = (id) => setRecords((r) => ({ ...r, [id]: !r[id] }));

  const save = async () => {
    await api.markAttendance(date, records);
    alert("Attendance saved");
    const wk = getWeekKey(date);
    const data = await api.getAttendanceWeek(wk);
    setWeekData(data);
    setRecords({});
  };

  const weekDates = (() => {
    const d = new Date(date);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }).map((_, i) => {
      const newDate = new Date(monday);
      newDate.setDate(monday.getDate() + i);
      return newDate.toISOString().slice(0, 10);
    });
  })();

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Weekly Attendance — {weekKey}</h4>
      <div className="mb-3">
        <label className="form-label fw-semibold">Select Date:</label>
        <input
          type="date"
          className="form-control w-auto d-inline-block"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* --- Table for weekly attendance --- */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center">
          <thead className="table-dark">
            <tr>
              <th>Student Name</th>
              <th>Room</th>
              {weekDates.map((d) => (
                <th key={d}>{d.slice(5)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.room}</td>
                {weekDates.map((d) => {
                  const rec = weekData[d] || {};
                  const present = rec[s.id];
                  return (
                    <td
                      key={d}
                      style={{
                        backgroundColor: present ? "#c8f7c5" : "#f8d7da",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (d === date) toggle(s.id);
                      }}
                    >
                      {d === date
                        ? records[s.id]
                          ? "✔️"
                          : "❌"
                        : present
                        ? "✔️"
                        : "❌"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-3">
        <button className="btn btn-primary" onClick={save}>
          Save Today's Attendance
        </button>
      </div>
    </div>
  );
}
