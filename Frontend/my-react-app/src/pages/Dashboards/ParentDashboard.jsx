import React, { useEffect, useState } from "react";

// Example Bootstrap-style card wrapper (replace/className as needed)
function Card({ title, children }) {
  return (
    <div className="card p-3 mb-4">
      <h5>{title}</h5>
      {children}
    </div>
  );
}

export default function ParentDashboard() {
  const [studentId, setStudentId] = useState(""); // Set this after login or via prop/state
  const [feeRecords, setFeeRecords] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // You may want to retrieve student's ID from context/session
  useEffect(() => {
    // Set actual studentId when parent logs in
    setStudentId("STUDENT_ID_HERE"); // <-- Replace or get from context
  }, []);

  useEffect(() => {
    if (!studentId) return;
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [records, passes] = await Promise.all([
          fetch(`http://localhost:8000/parent/student_records/${studentId}`).then(res => res.json()),
          fetch("http://localhost:8000/api/gatepasses").then(res => res.json()),
        ]);
        setFeeRecords(records.fee_records || []);
        setAttendanceRecords(records.attendance_records || []);
        // Filter gate passes for this student
        setGatePasses((passes || []).filter(gp => gp.stu_id === Number(studentId)));
      } catch (e) {
        setError("Failed to fetch records.");
      }
      setLoading(false);
    }
    fetchAll();
  }, [studentId]);

  return (
    <div className="container my-4">
      <h2>Parent Dashboard</h2>
      <p className="text-muted">Welcome! View your child's hostel info and gate passes below.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div>Loading...</div>}

      {!loading && (
        <>
          <Card title="Fee Records">
            <table className="table table-bordered table-sm mb-0">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {feeRecords.length === 0 && <tr><td colSpan="2">No fee records</td></tr>}
                {feeRecords.map((row, i) => (
                  <tr key={i}>
                    <td>{row.amount}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Attendance">
            <table className="table table-bordered table-sm mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 && <tr><td colSpan="2">No attendance records</td></tr>}
                {attendanceRecords.map((row, i) => (
                  <tr key={i}>
                    <td>{row.date}</td>
                    <td>{row.attendance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Gate Pass Requests">
            <table className="table table-bordered table-sm mb-0">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {gatePasses.length === 0 && <tr><td colSpan="5">No gate passes</td></tr>}
                {gatePasses.map(gp => (
                  <tr key={gp.id}>
                    <td>{gp.reason}</td>
                    <td>{gp.status}</td>
                    <td>{gp.from_date}</td>
                    <td>{gp.to_date}</td>
                    <td>
                      {gp.status === "Pending" && (
                        <>
                          <button className="btn btn-success btn-sm me-1">Approve</button>
                          <button className="btn btn-danger btn-sm">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
