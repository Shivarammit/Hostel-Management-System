import React, { useEffect, useState } from 'react';
import ProCard from '../../components/ProCard';
import { Link } from 'react-router-dom';

export default function RCDashboard() {
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState("");
  const [stuId, setStuId] = useState("");
  const [message, setMessage] = useState(null);

  // Fetch all gate passes needing RC approval
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/gatepasses')
      .then(res => res.json())
      .then(data => {
        setGatePasses(data.filter(row => row.status === "PendingRC" || row.status === "Pending"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Attendance marking handler
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!stuId || !attendance) {
      setMessage("Please enter student ID and attendance status.");
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/rc/update_attendance', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stu_id: Number(stuId),
          attendance,
          date: new Date().toISOString().slice(0, 10) // YYYY-MM-DD
        })
      });
      if (res.ok) {
        setMessage("Attendance updated!");
        setStuId("");
        setAttendance("");
      } else {
        setMessage("Failed to update attendance.");
      }
    } catch {
      setMessage("Failed to update attendance.");
    }
  };

  return (
    <div className="container my-4">
      <div className="row g-3">
        <div className="col-md-6">
          <ProCard title="Attendance">
            <form onSubmit={handleMarkAttendance} className="mb-3">
              <div className="mb-2">
                <input
                  type="number"
                  placeholder="Student ID"
                  value={stuId}
                  onChange={e => setStuId(e.target.value)}
                  className="form-control form-control-sm"
                  required
                />
              </div>
              <div className="mb-2">
                <select
                  className="form-control form-control-sm"
                  value={attendance}
                  onChange={e => setAttendance(e.target.value)}
                  required
                >
                  <option value="">Mark as...</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Mark Attendance
              </button>
              {message && <div className="text-success mt-2 small">{message}</div>}
            </form>
            <Link className="btn btn-outline-secondary btn-sm mt-2" to="/rc/attendance-list">
              View Attendance Records
            </Link>
          </ProCard>
        </div>
        <div className="col-md-6">
          <ProCard title="Room Allocation">
            <p>
              <Link className="btn btn-outline-primary" to="/admin/rooms">
                Manage Rooms
              </Link>
            </p>
          </ProCard>
        </div>
        <div className="col-12">
          <ProCard title="Gate Pass Approvals">
            {loading ? <div>Loading...</div> : (
              <div style={{maxHeight:200,overflowY:"auto"}}>
                <table className="table table-bordered table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Reason</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gatePasses.length === 0 && (
                      <tr><td colSpan={6}>No gate pass requests</td></tr>
                    )}
                    {gatePasses.map(gp => (
                      <tr key={gp.id}>
                        <td>{gp.stu_id}</td>
                        <td>{gp.reason}</td>
                        <td>{gp.from_date}</td>
                        <td>{gp.to_date}</td>
                        <td>{gp.status}</td>
                        <td>
                          <Link className="btn btn-primary btn-sm" to={`/gatepasses/${gp.id}`}>View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link className="btn btn-outline-secondary btn-sm mt-2" to="/gatepasses">
              Open Full Queue
            </Link>
          </ProCard>
        </div>
      </div>
    </div>
  );
}
