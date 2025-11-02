import React, { useState, useEffect } from "react";
import { BASE_API } from "../../api";

export default function Reports() {
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [gatepasses, setGatepasses] = useState([]);

  useEffect(() => {
    fetch(`${BASE_API}/admin/reports/attendance`)
      .then((res) => res.json())
      .then((data) => setAttendance(data.attendance || []));
    fetch(`${BASE_API}/admin/reports/feepayment`)
      .then((res) => res.json())
      .then((data) => setFees(data.feereport || []));
    fetch(`${BASE_API}/api/reports/gatepasses`)
      .then((res) => res.json())
      .then((data) => setGatepasses(data.gatepasses || []));
  }, []);

  const downloadReport = (title, data, headers) => {
    const content = [
      headers.join(","),
      ...data.map((item) =>
        headers.map((h) => item[h] ?? "").join(",")
      ),
    ].join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title.replace(/\s/g, "_") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h4>Reports</h4>
      <div className="mb-4">
        <h5>Attendance Report</h5>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>RC Phone</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.studentId + a.date}>
                <td>{a.studentId}</td>
                <td>{a.name}</td>
                <td>{a.rcPhone}</td>
                <td>{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="btn btn-outline-primary"
          onClick={() =>
            downloadReport(
              "AttendanceReport",
              attendance,
              ["studentId", "name", "rcPhone", "date"]
            )
          }
        >
          Download Attendance
        </button>
      </div>
      <div className="mb-4">
        <h5>Fee Report</h5>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Semester</th>
              <th>Amount</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.studentId}>
                <td>{f.studentId}</td>
                <td>{f.name}</td>
                <td>{f.semester}</td>
                <td>{f.amount}</td>
                <td>{f.paid ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="btn btn-outline-primary"
          onClick={() =>
            downloadReport(
              "FeeReport",
              fees,
              ["studentId", "name", "semester", "amount", "paid"]
            )
          }
        >
          Download Fee Report
        </button>
      </div>
      <div className="mb-4">
        <h5>Gatepass Applications</h5>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Student</th>
              <th>Date</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {gatepasses.map((g) => (
              <tr key={g.id}>
                <td>{g.student}</td>
                <td>{g.date}</td>
                <td>{g.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="btn btn-outline-primary"
          onClick={() =>
            downloadReport(
              "GatepassReport",
              gatepasses,
              ["student", "date", "room"]
            )
          }
        >
          Download Gatepass Report
        </button>
      </div>
    </div>
  );
}
