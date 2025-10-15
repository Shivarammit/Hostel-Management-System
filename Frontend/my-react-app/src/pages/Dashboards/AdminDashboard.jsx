import React from 'react';
import ProCard from '../../components/ProCard';


export default function AdminDashboard(){
return (
<div className="row g-3">
<div className="col-md-4"><ProCard title="Users">Manage users, create & edit accounts.</ProCard></div>
<div className="col-md-4"><ProCard title="Rooms">Create, edit rooms and allocate beds. <a href="/admin/rooms" className="d-block mt-2">Open Rooms</a></ProCard></div>
<div className="col-md-4"><ProCard title="Reports">Fee & attendance reports. <a href="/admin/reports" className="d-block mt-2">Generate Reports</a></ProCard></div>
</div>
);
}