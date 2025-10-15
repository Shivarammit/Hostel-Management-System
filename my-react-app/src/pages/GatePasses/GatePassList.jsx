import React, { useEffect, useState } from 'react';
import { api } from '../../api/mockApi';
import { useAuth } from '../../contexts/AuthContext';


export default function GatePassList(){
const { user } = useAuth();
const [list,setList] = useState([]);


async function load(){
const l = await api.fetchGatePasses();
setList(l);
}
useEffect(()=>{ load(); },[]);


const onParentAction = async (id,approve) =>{
// Parent approves moves to RC approval
await api.updateGatePass(id,{ status: approve ? 'PendingRC' : 'RejectedByParent' });
load();
};
const onRCAction = async (id,approve) =>{
await api.updateGatePass(id,{ status: approve ? 'Approved' : 'RejectedByRC' });
load();
};


return (
<div>
<h4>Gate Pass Queue</h4>
<div className="list-group">
{list.length===0 && <div className="text-muted">No gate pass requests</div>}
{list.map(gp=> (
<div className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start" key={gp.id}>
<div>
<h6 className="mb-1">{gp.studentName}</h6>
<small className="text-muted">{new Date(gp.createdAt).toLocaleString()}</small>
<p className="mb-1">{gp.reason}</p>
<div><strong>Status:</strong> {gp.status}</div>
</div>
<div className="mt-2 mt-md-0">
{/* Buttons depend on role */}
{user.role === 'Parent' && gp.status === 'PendingParent' && (
<>
<button onClick={()=>onParentAction(gp.id,true)} className="btn btn-sm btn-success me-1">Approve</button>
<button onClick={()=>onParentAction(gp.id,false)} className="btn btn-sm btn-danger">Reject</button>
</>
)}
{user.role === 'RC' && gp.status === 'PendingRC' && (
<>
<button onClick={()=>onRCAction(gp.id,true)} className="btn btn-sm btn-success me-1">Approve</button>
<button onClick={()=>onRCAction(gp.id,false)} className="btn btn-sm btn-danger">Reject</button>
</>
)}
{user.role === 'Admin' && (
<small className="d-block text-muted">Admin can view</small>
)}
</div>
</div>
))}
</div>
</div>
);
}