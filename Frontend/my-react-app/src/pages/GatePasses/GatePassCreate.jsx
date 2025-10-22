  import React, { useState, useEffect } from "react";
  import { useAuth } from "../../contexts/AuthContext";

  export default function GatePassCreate() {
    const user = useAuth();
    const [reason, setReason] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [gatePasses, setGatePasses] = useState([]);

    const fetchGatePasses = async () => {
      const res = await fetch("http://localhost:8000/api/gatepasses");
      const data = await res.json();
      const myPasses = data.filter((g) => g.studentId === user.id);
      setGatePasses(myPasses);
    };

    useEffect(() => { fetchGatePasses(); }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!reason || !fromDate || !toDate) {
        alert("Please fill all fields");
        return;
      }
      setSubmitting(true);
      try {
        await fetch("http://localhost:8000/api/gatepasses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: user.id,
            reason,
            fromDate,     // must be yyyy-mm-dd
            toDate        // must be yyyy-mm-dd
          }),
        });
        alert("Gate pass created successfully");
        setReason("");
        setFromDate("");
        setToDate("");
        fetchGatePasses();
      } catch (err) {
        alert(err.message || "Failed to create gate pass");
      }
      setSubmitting(false);
    };


    return (
      <div className="container mt-4">
        <h3 className="mb-3 text-center">Create Gate Pass</h3>
        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
          <div className="mb-3">
            <label className="form-label">Reason</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="form-control" placeholder="Enter reason for gate pass" />
          </div>
          <div className="mb-3">
            <label className="form-label">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="form-control" />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? "Creating..." : "Create Gate Pass"}
          </button>
        </form>
        <h4 className="mt-5 mb-3 text-center">My Gate Pass Requests</h4>
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center">
            <thead className="table-primary">
              <tr>
                <th>Reason</th>
                <th>From</th>
                <th>To</th>
                <th>Parent</th>
                <th>RC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {gatePasses.length === 0 ? (
                <tr>
                  <td colSpan="6">No gate pass requests yet</td>
                </tr>
              ) : (
                gatePasses.map((gp) => (
                  <tr key={gp.id}>
                    <td>{gp.reason}</td>
                    <td>{gp.fromDate}</td>
                    <td>{gp.toDate}</td>
                    <td>{gp.parentApproved ? "Approved" : gp.status === "Rejected" ? "Rejected" : "Pending"}</td>
                    <td>{gp.rcApproved ? "Approved" : gp.status === "Rejected" ? "Rejected" : gp.status === "Pending-RC" ? "Pending" : ""}</td>
                    <td><strong>{gp.status}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
