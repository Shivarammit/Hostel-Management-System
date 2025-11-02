  import React, { useState, useEffect } from "react";
  import { useAuth } from "../../contexts/AuthContext";
import { BASE_API } from "../../api";

  export default function GatePassCreate() {
    const {user} = useAuth();
    const [reason, setReason] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [gatePasses, setGatePasses] = useState([]);



    const fetchGatePasses = async () => {
      const res = await fetch(`${BASE_API}/api/gatepasses`);
      const data = await res.json();
      console.log("pass",data);
      let myPasses;
      console.log("uu",user.id)
      if(data){
      myPasses = data.filter((data1) =>  data1.stu_id === user.id);}
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
        console.log("req",user.id,reason,fromDate,toDate);
        await fetch(`${BASE_API}/api/gatepasses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: user.id,
            reason,
            fromDate:fromDate,     // must be yyyy-mm-dd
            toDate:toDate       // must be yyyy-mm-dd
            
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
                    <td>{gp.from_date}</td>
                    <td>{gp.to_date}</td>
                     <td>
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
</td>
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
