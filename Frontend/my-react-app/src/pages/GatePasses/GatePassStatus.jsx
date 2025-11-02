  import React, { useState, useEffect } from "react";
  import { useAuth } from "../../contexts/AuthContext";
import { BASE_API } from "../../api";

  export default function GatePassStatus() {
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

    


    return (
      <div className="container mt-4">
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
