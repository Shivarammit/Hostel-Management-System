import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { BASE_API } from "../../api";

export default function GatePassList() {
  const user = useAuth();
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`${BASE_API}/api/gatepasses`);
    const data = await res.json();
    let filtered;
    if (user.role === "Parent") {
      filtered = data.filter((gp) => gp.status === "Pending(Parent Approval)");
    } else if (user.role === "RC") {
      filtered = data.filter((gp) => gp.status === "Pending(RC Approval)");
    } else {
      filtered = data;
    }
    console.log("fileteers", filtered);
    setGatePasses(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    if (user.role === "Parent") {
      await fetch(`${BASE_API}/api/gatepasses/${id}/parent-approve`, {
        method: "POST",
      });
    } else if (user.role === "RC") {
      await fetch(`${BASE_API}/api/gatepasses/${id}/rc-approve`, {
        method: "POST",
      });
    }
    fetchData();
  };

  const handleReject = async (id) => {
    await fetch(`${BASE_API}/api/gatepasses/${id}/reject`, {
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
                  <td>{gp.status}</td>
                 {/* <td>
  {gp.parent_ack === "Pending"
    ? "Pending"
    : gp.parent_ack === "Approved"
    ? "Approved"
    : gp.parent_ack}
</td>

<td>
  {gp.rc_ack === "Pending"
    ? "Pending"
    : gp.rc_ack === "Approved"
    ? "Approved"
    : gp.rc_ack}
</td> */}

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
