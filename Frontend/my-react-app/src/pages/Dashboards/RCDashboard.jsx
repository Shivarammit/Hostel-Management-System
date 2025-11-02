// import React, { useEffect, useState } from 'react';
// import ProCard from '../../components/ProCard';
// import { useAuth } from '../../contexts/AuthContext';
// export default function RCDashboard() {
//   const {user}=useAuth();
//   console.log("uuuu",user.id);
//   const rc_id=user.id;
//   const [gatePasses, setGatePasses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [stuId, setStuId] = useState("");
//   const [attendanceReport,setAttendanceReport]=useState([]);
//   const [message, setMessage] = useState(null);
//   // Fetch all gate passes needing RC approval
//   useEffect(() => {
//     setLoading(true);
//     fetch(`http://localhost:8000/api/gatepasses/${rc_id}`)
//       .then(res => res.json())
//       .then(data => {
//         setGatePasses(data.filter(row => row.status === "PendingRC" || row.status === "Pending"));
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));

//       try {
//           const [ attendance] = await Promise.all([
//             fetch("http://localhost:8000/admin/reports/attendance").then((res) => res.json()),
//           ]);
//           setAttendanceReport(attendance.attendance_report || []);
//         }
//         catch(){

//         }
//   }, []);


  


// const handleGatepassAction = async (id,action) => {
//   console.log("id",rc_id);
//   try {
//     console.log("Helllo"); 
//     const res = await fetch(`http://localhost:8000/rc/gatepass/${id}/action`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ rc_id, action }),
//     });

//     const data = await res.json();
//     console.log("dataaaa",data);
    
//     if (res.ok) {
//       alert(data.message);
//       // Refresh gate pass list
//       setGatePasses(prev =>
//         prev.map(gp =>
//           gp.id === id
//             ? { ...gp, rc_ack: action === "accept" ? "Accepted" : "Rejected", status: action === "reject" ? "Rejected" : gp.status }
//             : gp
//         )
//       );
//     } else {
//       alert(data.detail || "Failed to update.");
//     }
//   } catch (err) {
//     console.log("err",err);
//     alert("Error updating gate pass.");
//   }
// };

//   return (
//     <div className="container my-4">
//       <div className="row g-3">
        
//        <div className="col-12">
//   <ProCard title="Gate Pass Approvals">
//     {loading ? (
//       <div>Loading...</div>
//     ) : (
//       <div style={{ maxHeight: 250, overflowY: "auto" }}>
//         <table className="table table-bordered table-sm mb-0 text-center align-middle">
//           <thead className="table-light">
//             <tr>
//               <th>ID</th>
//               <th>Student ID</th>
//               <th>Reason</th>
//               <th>From</th>
//               <th>To</th>
//               <th>Status</th>
//               <th>RC Ack</th>
//               <th>Parent Ack</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {gatePasses.length === 0 ? (
//               <tr><td colSpan={9}>No gate pass requests</td></tr>
//             ) : (
//               gatePasses.map(gp => {
                
//                 // ✅ Treat "Pending(RC Approval)" from parent as "Approved"
//                 const displayParentAck =
//                   gp.parent_ack === "Pending(RC Approval)" ? "Approved" : gp.parent_ack || "—";

//                 // ✅ Disable if already accepted or rejected by RC
//                 const isActionDisabled =
//                   gp.rc_ack === "Accepted" || gp.rc_ack === "Rejected" || gp.status === "Accepted";
//                 console.log("gp",gp);
//                 return (
//                   <tr key={gp.id}>
//                     <td>{gp.id}</td>
//                     <td>{gp.stu_id}</td>
//                     <td>{gp.reason}</td>
//                     <td>{gp.from_date}</td>
//                     <td>{gp.to_date}</td>
//                     <td>
//                       <span
//                         className={`badge ${
//                           gp.status === "Accepted"
//                             ? "bg-success"
//                             : gp.status === "Rejected"
//                             ? "bg-danger"
//                             : "bg-warning text-dark"
//                         }`}
//                       >
//                         {gp.status}
//                       </span>
//                     </td>
//                     <td>{gp.rc_ack || "—"}</td>
//                     <td>{displayParentAck}</td>
//                     <td>
//                       <button
//                         className="btn btn-success btn-sm me-1"
//                         disabled={isActionDisabled}
//                         onClick={() => handleGatepassAction(gp.id, "accept")}
//                       >
//                         Accept
//                       </button>
//                       <button
//                         className="btn btn-danger btn-sm"
//                         disabled={isActionDisabled}
//                         onClick={() => handleGatepassAction(gp.id,"reject")}
//                       >
//                         Reject
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     )}
//   </ProCard>
//   <section ref={attendanceRef} style={styles.section}>
//           <ProCard title="Attendance Report">
//             {loading ? (
//               <div>Loading...</div>
//             ) : (
//               <div style={styles.tableContainer}>
//                 <table style={styles.table}>
//                   <thead>
//                     <tr>
//                       <th>Student</th>
//                       <th>Attendance</th>
//                       <th>Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {attendanceReport.map((row, i) => (
//                       <tr key={i}>
//                         <td>{row.student_username}</td>
//                         <td>{row.attendance_status}</td>
//                         <td>{new Date(row.date).toLocaleDateString()}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//             <div style={styles.footer}>
//               <button onClick={() => downloadCSV(attendanceReport, "Attendance_Report")} style={styles.btn}>Download CSV</button>
//               <a href="/admin/reports/attendance" style={styles.viewAll}>See All</a>
//             </div>
//           </ProCard>
// </div>


//   </div>
//   );
// }


import React, { useEffect, useState } from "react";
import ProCard from "../../components/ProCard";
import { useAuth } from "../../contexts/AuthContext";

export default function RCDashboard() {
  const { user } = useAuth();
  const rc_id = user?.id;
  const [gatePasses, setGatePasses] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Gate Pass & Attendance Data
  useEffect(() => {
    if (!rc_id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('gatepass');
        // Fetch gate passes related to this RC
        const gateRes = await fetch(`http://localhost:8000/api/gatepasses/${rc_id}`);
        const gateData = await gateRes.json();
        console.log(gateData);
        setGatePasses(
          (gateData || []).filter(
            (row) => row.status === "Pending(RC Approval)"
          )
        );

        // Fetch attendance reports for this RC only
        const attRes = await fetch(
          `http://localhost:8000/admin/reports/attendance?rc_id=${rc_id}`
        );
        const attData = await attRes.json();

        setAttendanceReport(attData.attendance_report || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rc_id]);

  // ✅ Handle Gate Pass Action
  const handleGatepassAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:8000/rc/gatepass/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rc_id, action }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        // ✅ Update local state to reflect change immediately
      setGatePasses((prev) =>
        prev.map((gp) =>
          gp.id === id
            ? {
                ...gp,
                rc_ack: action === "accept" ? "Accepted" : "Rejected",
                status:
                  action === "accept"
                    ? "Approved"
                    : action === "reject"
                    ? "Rejected"
                    : gp.status,
              }
            : gp
        )
      );
      console.log("astat",gp.status)
      } else {
        alert(data.detail || "Failed to update.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Download Attendance CSV
  const downloadCSV = (data, filename) => {
    if (!data.length) return alert("No data to download");
    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <div className="container my-4">
      <div className="row g-3">
        {/* 🚪 Gate Pass Approvals */}
        <div className="col-12">
          <ProCard title="Gate Pass Approvals">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div style={{ maxHeight: 250, overflowY: "auto" }}>
                <table className="table table-bordered table-sm mb-0 text-center align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Student ID</th>
                      <th>Reason</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                      <th>RC Ack</th>
                      <th>Parent Ack</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gatePasses.length === 0 ? (
                      <tr>
                        <td colSpan={9}>No gate pass requests</td>
                      </tr>
                    ) : (
                      gatePasses.map((gp) => {
                        const displayParentAck =
                          gp.parent_ack === "Pending(RC Approval)"
                            ? "Approved"
                            : gp.parent_ack || "—";
                        const isActionDisabled =
                          gp.rc_ack === "Accepted" ||
                          gp.rc_ack === "Rejected" ||
                          gp.status === "Accepted";
                        return (
                          <tr key={gp.id}>
                            <td>{gp.id}</td>
                            <td>{gp.stu_id}</td>
                            <td>{gp.reason}</td>
                            <td>{gp.from_date}</td>
                            <td>{gp.to_date}</td>
                            <td>
                              <span
                                className={`badge ${
                                  gp.status === "Accepted"
                                    ? "bg-success"
                                    : gp.status === "Rejected"
                                    ? "bg-danger"
                                    : "bg-warning text-dark"
                                }`}
                              >
                                {gp.status}
                              </span>
                            </td>
                            <td>{gp.rc_ack || "—"}</td>
                            <td>{displayParentAck}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm me-1"
                                disabled={isActionDisabled}
                                onClick={() =>
                                  handleGatepassAction(gp.id, "accept")
                                }
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={isActionDisabled}
                                onClick={() =>
                                  handleGatepassAction(gp.id, "reject")
                                }
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </ProCard>
        </div>

        {/* 🧾 Attendance Report */}
        <div className="col-12">
          <ProCard title="Attendance Report">
            {loading ? (
              <div>Loading...</div>
            ) : attendanceReport.length === 0 ? (
              <p>No attendance records for this RC.</p>
            ) : (
              <div style={{ maxHeight: 250, overflowY: "auto" }}>
                <table className="table table-bordered table-sm text-center align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Attendance</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceReport.map((row, i) => (
                      <tr key={i}>
                        <td>{row.student_username}</td>
                        <td>{row.attendance_status}</td>
                        <td>
                          {new Date(row.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="d-flex justify-content-between mt-2">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() =>
                  downloadCSV(attendanceReport, "Attendance_Report")
                }
              >
                Download CSV
              </button>
             
            </div>
          </ProCard>
        </div>
        
      </div>
    </div>
  );
}
