import React from 'react';
import ProCard from '../../components/ProCard';


export default function RCDashboard(){
return (
<div className="row g-3">
<div className="col-md-6">
<ProCard title="Attendance">
<p><a className="btn btn-primary" href="/rc/attendance">Mark attendance</a></p>
</ProCard>
</div>
<div className="col-md-6">
<ProCard title="Room Allocation">
<p><a className="btn btn-outline-primary" href="/admin/rooms">Manage Rooms</a></p>
</ProCard>
</div>


<div className="col-12">
<ProCard title="Gate Pass Approvals">
<p><a className="btn btn-primary" href="/gatepasses">Open Gate Pass Queue</a></p>
</ProCard>
</div>
</div>
);
}