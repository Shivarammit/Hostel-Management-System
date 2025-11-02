import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { BASE_API } from "../../api";

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
  
const location = useLocation();
const { student_id } = location.state || {};
  const [feeRecords, setFeeRecords] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


 function approve(id) {
  fetch(`${BASE_API}/parent/approve_gatepass`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      approval_id: id,
      approved: true,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.msg);
      setGatePasses((prev) =>
        prev.map((gp) =>
          gp.id === id ? { ...gp, status: "Pending(RC Approval)", parent_ack: "Approved" } : gp
        )
      );
    })
    .catch((err) => console.error("Error approving gatepass:", err));
}

function reject(id) {
  fetch(`${BASE_API}/parent/approve_gatepass`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      approval_id: id,
      approved: false,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.msg);
      // Refresh gatepass list
      setGatePasses((prev) =>
        prev.map((gp) =>
          gp.id === id ? { ...gp, status: "Rejected", parent_ack: "Rejected" } : gp
        )
      );
    })
    .catch((err) => console.error("Error rejecting gatepass:", err));
}


  useEffect(() => {
    console.log("parent top");
    if (!student_id) return;
    console.log("parent");
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [records] = await Promise.all([
          fetch(`${BASE_API}/parent/student_records/${student_id}`).then(res => res.json()),
        ]);
        console.log(records);
        setFeeRecords(records.fee_records || []);
        setAttendanceRecords(records.attendance_records || []);
        console.log("status", records.status);
        // Filter gate passes for this student
        setGatePasses(records.approval || []);
      } catch (e) {
        setError("Failed to fetch records.");
      }
      setLoading(false);
    }
    fetchAll();
  }, [student_id]);

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
                    
{console.log("sttaus",gp)}
    <td>
  {gp.parent_ack === "Pending" ? (
    <>
      <button
        className="btn btn-success btn-sm me-1"
        onClick={() => approve(gp.id)}
      >
        Approve
      </button>
      <button
        className="btn btn-danger btn-sm"
        onClick={() => reject(gp.id)}
      >
        Reject
      </button>
    </>
  ) : gp.status === "Approved" ? (
    <button className="btn btn-success btn-sm" disabled>
      Approved
    </button>
  ) : gp.status === "Rejected" ? (
    <button className="btn btn-danger btn-sm" disabled>
      Rejected
    </button>
  ) : gp.rc_ack === "Pending" ? (
    <button className="btn btn-warning btn-sm" disabled>
      Pending
    </button>
  ) : null}
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
