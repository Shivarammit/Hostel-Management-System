import React,{useState} from 'react';


export default function Reports(){
    // Dummy data for attendance
  const [attendance] = useState([
    { studentId: 'S101', name: 'Alice', rcPhone: '1234567890', date: '2025-10-18' },
    { studentId: 'S102', name: 'Bob', rcPhone: '0987654321', date: '2025-10-18' }
  ]);

  // Dummy data for fee reports
  const [fees] = useState([
    { studentId: 'S101', name: 'Alice', semester: '3rd', amount: 5000, paid: true },
    { studentId: 'S102', name: 'Bob', semester: '3rd', amount: 5000, paid: false }
  ]);

  // Dummy data for gatepass applications
  const [gatepasses] = useState([
    { student: 'Alice', date: '2025-10-18', room: 'A-101' },
    { student: 'Bob', date: '2025-10-18', room: 'B-102' }
  ]);
const downloadReport = (title, data, headers) => {
  const content = [headers.join(',')]
    .concat(
      data.map(item => headers.map(h => item[h] ?? '').join(','))
    )
    .join('\n');

  const blob = new Blob([content], { type: 'text/csv' }); // changed to CSV
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.csv`; // .csv extension
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
            {attendance.map(a => (
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
          onClick={() => downloadReport('Attendance_Report', attendance, ['studentId', 'name', 'rcPhone', 'date'])}
        >
          Download Attendance
        </button>
      </div>

      {/* Fee Section */}
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
            {fees.map(f => (
              <tr key={f.studentId}>
                <td>{f.studentId}</td>
                <td>{f.name}</td>
                <td>{f.semester}</td>
                <td>₹{f.amount}</td>
                <td>{f.paid ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="btn btn-outline-primary"
          onClick={() => downloadReport('Fee_Report', fees, ['studentId', 'name', 'semester', 'amount', 'paid'])}
        >
          Download Fee Report
        </button>
      </div>

      {/* Gatepass Section */}
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
            {gatepasses.map(g => (
              <tr key={g.student + g.date}>
                <td>{g.student}</td>
                <td>{g.date}</td>
                <td>{g.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="btn btn-outline-primary"
          onClick={() => downloadReport('Gatepass_Report', gatepasses, ['student', 'date', 'room'])}
        >
          Download Gatepass Report
        </button>
      </div>
    </div>
);
}