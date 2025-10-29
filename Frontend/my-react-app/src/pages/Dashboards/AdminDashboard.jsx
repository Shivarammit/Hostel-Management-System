import React, { useEffect, useState } from 'react';
import ProCard from '../../components/ProCard';

export default function AdminDashboard() {
  const [feeReport, setFeeReport] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [users, setUsers] = useState({ students: 0, rc: 0, parents: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      try {
        // Fetch reports
        const [fee, attendance] = await Promise.all([
          fetch('http://localhost:8000/admin/reports/fee_payment').then(res => res.json()),
          fetch('http://localhost:8000/admin/reports/attendance').then(res => res.json()),
        ]);

        setFeeReport(fee.fee_report || []);
        setAttendanceReport(attendance.attendance_report || []);

        // Fetch user counts
        const [studentRes, rcRes, parentRes, adminRes] = await Promise.all([
          fetch("http://localhost:8000/admin/count/students").then(res => res.json()),
          fetch("http://localhost:8000/admin/count/rc").then(res => res.json()),
          fetch("http://localhost:8000/admin/count/parents").then(res => res.json()),
          fetch("http://localhost:8000/admin/count/admins").then(res => res.json()),
        ]);

        setUsers({
          students: studentRes.count || 0,
          rc: rcRes.count || 0,
          parents: parentRes.count || 0,
          admins: adminRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }

      setLoading(false);
    }

    fetchStats();
  }, []);

  return (
    <div className="container my-4">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <ProCard title="Users">
            Manage users
            <div className="mt-3">
              <div>Students: <strong>{users.students}</strong></div>
              <div>RCs: <strong>{users.rc}</strong></div>
              <div>Parents: <strong>{users.parents}</strong></div>
              <div>Admins: <strong>{users.admins}</strong></div>
              <a href="/admin/users" className="d-block mt-2">Manage Users</a>
            </div>
          </ProCard>
        </div>

        <div className="col-md-4">
          <ProCard title="Rooms">
            Create, edit rooms and allocate beds.
            <a href="/admin/rooms" className="d-block mt-2">Open Rooms</a>
          </ProCard>
        </div>

        <div className="col-md-4">
          <ProCard title="Reports">
            Fee & attendance reports.
            <a href="/admin/reports" className="d-block mt-2">Generate Reports</a>
          </ProCard>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <ProCard title="Fee Payment Status">
            {loading ? <div>Loading...</div> : (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>Student</th><th>Amount</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeReport.map(row =>
                      <tr key={row.id || Math.random()}>
                        <td>{row.username}</td>
                        <td>{row.amount}</td>
                        <td>{row.status}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <a href="/admin/reports/fee_payment" className="d-block text-end small mt-1">See All</a>
          </ProCard>
        </div>

        <div className="col-md-6">
          <ProCard title="Attendance Report">
            {loading ? <div>Loading...</div> : (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>Student</th><th>Attendance</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceReport.map(row =>
                      <tr key={row.id || Math.random()}>
                        <td>{row.username}</td>
                        <td>{row.attendance}</td>
                        <td>{row.date}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <a href="/admin/reports/attendance" className="d-block text-end small mt-1">See All</a>
          </ProCard>
        </div>
      </div>
    </div>
  );
}
