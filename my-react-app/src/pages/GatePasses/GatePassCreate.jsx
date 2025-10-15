import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/mockApi';


export default function GatePassCreate(){
const { user } = useAuth();
const [form, setForm] = useState({ reason:'', outDate:'', returnDate:'' });
const [status, setStatus] = useState(null);


const submit = async (e) =>{
e.preventDefault();
try{
const gp = await api.createGatePass({ studentId: user.id, studentName: user.name, ...form });
setStatus('Created — pending parent approval');
}catch(e){ setStatus('Error: '+e.message); }
};


return (
<div className="row justify-content-center">
<div className="col-lg-8">
<div className="card shadow-sm">
<div className="card-body">
<h4>Create Gate Pass</h4>
<form onSubmit={submit}>
<div className="mb-3">
<label className="form-label">Reason</label>
<textarea className="form-control" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} required />
</div>
<div className="row g-2">
<div className="col-md-6 mb-3">
<label className="form-label">Out Date</label>
<input type="date" className="form-control" value={form.outDate} onChange={e=>setForm({...form,outDate:e.target.value})} required />
</div>
<div className="col-md-6 mb-3">
<label className="form-label">Return Date</label>
<input type="date" className="form-control" value={form.returnDate} onChange={e=>setForm({...form,returnDate:e.target.value})} required />
</div>
</div>
<div className="d-flex justify-content-end">
<button className="btn btn-primary">Submit</button>
</div>
{status && <div className="mt-3 alert alert-info">{status}</div>}
</form>
</div>
</div>
</div>
</div>
);
}