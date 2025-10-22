import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function GatePassList() {
  const user = useAuth();
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/gatepasses");
    const data = await res.json();
    let filtered;
    if (user.role === "Parent") {
      filtered = data.filter((gp) => gp.status === "PendingParent");
    } else if (user.role === "RC") {
      filtered = data.filter((gp) => gp.status === "PendingRC");
    } else {
      filtered = data;
    }
    setGatePasses(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    if (user.role === "Parent") {
      await fetch(`http://localhost:8000/api/gatepasses/${id}/parent-approve`, {
        method: "POST",
      });
    } else if (user.role === "RC") {
      await fetch(`http://localhost:8000/api/gatepasses/${id}/rc-approve`, {
        method: "POST",
      });
    }
    fetchData();
  };

  const handleReject = async (id) => {
    await fetch(`http://localhost:8000/api/gatepasses/${id}/reject`, {
      method: "POST",
    });
    fetchData();
  };

  if (loading)
    return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-3">
        {user.role === "Parent" ? "Parent Gate Pass Approvals" :
        user.role === "RC" ? "RC Gate Pass Approvals" : "All Gate Passes"}
      </h3>
      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center">
          <thead className="table-primary">
            <tr>
              <th>Student</th>
              <th>Reason</th>
              <th>From</th>
              <th>To</th>
              <th>Parent</th>
              <th>RC</th>
              <th>Status</th>
              {(user.role === "Parent" || user.role === "RC") && (
                <th>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {gatePasses.length === 0 ? (
              <tr>
                <td colSpan="8">No gate passes available</td>
              </tr>
            ) : (
              gatePasses.map((gp) => (
                <tr key={gp.id}>
                  <td>{gp.studentName}</td>
                  <td>{gp.reason}</td>
                  <td>{gp.fromDate}</td>
                  <td>{gp.toDate}</td>
                  <td>{gp.parentApproved ? "Approved" : gp.status === "Rejected" ? "Rejected" : "Pending"}</td>
                  <td>{gp.rcApproved ? "Approved" : gp.status === "Rejected" ? "Rejected" : gp.status === "Pending-RC" ? "Pending" : ""}</td>
                  <td><strong>{gp.status}</strong></td>
                  {(user.role === "Parent" || user.role === "RC") && (
                    <td>
                      <button onClick={() => handleApprove(gp.id)} className="btn btn-success btn-sm me-2">Approve</button>
                      <button onClick={() => handleReject(gp.id)} className="btn btn-danger btn-sm">Reject</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
