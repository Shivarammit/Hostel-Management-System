import React from 'react';
import ProCard from '../../components/ProCard';
import { useAuth } from '../../contexts/AuthContext';


export default function StudentDashboard(){
const { user } = useAuth();
return (
<div className="row g-3">
<div className="col-lg-4">
<ProCard title="Profile">
<p><strong>Name:</strong> {user.name}</p>
<p><strong>Email:</strong> {user.email}</p>
<p><strong>Room:</strong> {user.room || 'Not assigned'}</p>
</ProCard>
</div>
<div className="col-lg-4">
<ProCard title="Fee Status">
<p>Amount Due: <strong>₹{user.feesDue || 0}</strong></p>
<button className="btn btn-outline-primary btn-sm">Download Receipt</button>
</ProCard>
</div>
<div className="col-lg-4">
<ProCard title="Requests">
<p><a className="btn btn-primary btn-sm" href="/student/gatepasses">Create Gate Pass</a></p>
</ProCard>
</div>


<div className="col-12">
<ProCard title="Recent Notices">
<ul className="list-unstyled mb-0">
<li>Welcome to the hostel portal — keep your documents updated.</li>
<li>Mess schedule updated for the next week.</li>
</ul>
</ProCard>
</div>
</div>
);
}