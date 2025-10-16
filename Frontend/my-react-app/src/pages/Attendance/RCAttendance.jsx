import React, { useEffect, useState } from 'react';
import { api } from '../../api/mockApi';

export default function RCAttendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  // Load students and attendance
  useEffect(() => {
    async function load() {
      const s = await api.fetchStudents();
      setStudents(s);
      const att = await api.getAttendance(date);
      setRecords(att);
      setLoading(false);
    }
    load();
  }, [date]);

  // Toggle present/absent
  const toggle = (id) => setRecords(r => ({ ...r, [id]: !r[id] }));

  // Save attendance
  const save = async () => {
    await api.markAttendance(date, records);
    alert('Attendance saved successfully');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h4>Mark Attendance — {date}</h4>
      <div className="mb-3">
        <input
          type="date"
          className="form-control w-auto"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Student Name</th>
            <th>Room</th>
            <th>Present</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={s.id}>
              <td>{idx + 1}</td>
              <td>{s.name}</td>
              <td>{s.room}</td>
              <td>
                <input
                  type="checkbox"
                  checked={!!records[s.id]}
                  onChange={() => toggle(s.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-primary" onClick={save}>Save Attendance</button>
    </div>
  );
}
