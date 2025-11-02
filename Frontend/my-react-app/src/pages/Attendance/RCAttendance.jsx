import React, { useEffect, useState } from 'react';
import { BASE_API } from "../../api";

export default function RCAttendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch student list
      const studentsRes = await fetch(`${BASE_API}/api/students`);
      const studentsData = await studentsRes.json();
      setStudents(studentsData.students || []);

      // Fetch attendance for selected date
      const attendanceRes = await fetch(`${BASE_API}/rc/view_records/${date}`);
      const attendanceData = await attendanceRes.json();
      // Convert attendance array to record map { stu_id: true/false }
      const recordMap = {};
      (attendanceData.attendance_records || []).forEach((record) => {
        recordMap[record.stu_id] = record.attendance === 'present';
      });
      setRecords(recordMap);
      setLoading(false);
    }
    load();
  }, [date]);

  const toggle = (id) => setRecords((r) => ({ ...r, [id]: !r[id] }));

  const save = async () => {
    await Promise.all(
      students.map((student) =>
        fetch(`${BASE_API}/rc/update_attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stu_id: student.id,
            attendance: records[student.id] ? 'present' : 'absent',
            date,
          }),
        })
      )
    );
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
          onChange={(e) => setDate(e.target.value)}
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

      <button className="btn btn-primary" onClick={save}>
        Save Attendance
      </button>
    </div>
  );
}
