import React from 'react';
import ProCard from '../../components/ProCard';
import { Link } from 'react-router-dom';

export default function RCDashboard() {
  return (
    <div className="row g-3">
      <div className="col-md-6">
        <ProCard title="Attendance">
          <p>
            <Link className="btn btn-primary" to="/rc/attendance">
              Mark Attendance
            </Link>
          </p>
        </ProCard>
      </div>
      <div className="col-md-6">
        <ProCard title="Room Allocation">
          <p>
            <Link className="btn btn-outline-primary" to="/admin/rooms">
              Manage Rooms
            </Link>
          </p>
        </ProCard>
      </div>

      <div className="col-12">
        <ProCard title="Gate Pass Approvals">
          <p>
            <Link className="btn btn-primary" to="/gatepasses">
              Open Gate Pass Queue
            </Link>
          </p>
        </ProCard>
      </div>
    </div>
  );
}
