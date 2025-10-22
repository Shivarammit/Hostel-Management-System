import React, { useEffect, useState } from "react";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    // Fetch students
    fetch("http://localhost:8000/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []));
    // Fetch attendance for selected date
    fetch(`http://localhost:8000/rc/view_records/${date}`)
      .then((res) => res.json())
      .then((data) => setRecords(data.attendance_records || {}));
  }, [date]);

  const toggle = (stu_id) => {
    setRecords({ ...records, [stu_id]: !records[stu_id] });
  };

  const save = async () => {
    await Promise.all(
      students.map(async (s) => {
        await fetch("http://localhost:8000/rc/update_attendance", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            stu_id: s.id,
            attendance: records[s.id] ? "present" : "absent",
            date,
          }),
        });
      })
    );
    alert("Attendance saved");
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Attendance on {date}</h4>
      <input
        type="date"
        className="form-control w-auto d-inline-block"
        value={date}
        onChange={e => setDate(e.target.value)}
      />
      <table className="table table-bordered table-hover align-middle text-center mt-4">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Present</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
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
      <button className="btn btn-primary mt-3" onClick={save}>
        Save Attendance
      </button>
    </div>
  );
}
