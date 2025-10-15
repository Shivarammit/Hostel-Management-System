import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


export default function Register(){
const [payload,setPayload] = useState({name:'',email:'',password:'',role:'Student'});
const [error,setError] = useState(null);
const { register } = useAuth();
const navigate = useNavigate();


const onSubmit = async (e) =>{
e.preventDefault(); setError(null);
try{
const u = await register(payload);
navigate(`/${u.role.toLowerCase()}`);
}catch(err){ setError(err.message); }
};


return (
<div className="auth-page row justify-content-center">
<div className="col-md-8 col-lg-6">
<div className="card shadow-sm border-0">
<div className="card-body p-4">
<h3 className="mb-3">Register</h3>
<form onSubmit={onSubmit}>
<div className="row">
<div className="col-md-6 mb-3">
<label className="form-label">Name</label>
<input className="form-control" value={payload.name} onChange={e=>setPayload({...payload,name:e.target.value})} required />
</div>
<div className="col-md-6 mb-3">
<label className="form-label">Role</label>
<select className="form-select" value={payload.role} onChange={e=>setPayload({...payload,role:e.target.value})}>
<option>Student</option>
<option>Parent</option>
<option>RC</option>
<option>Admin</option>
</select>
</div>
</div>
<div className="mb-3">
<label className="form-label">Email</label>
<input className="form-control" value={payload.email} onChange={e=>setPayload({...payload,email:e.target.value})} required />
</div>
<div className="mb-3">
<label className="form-label">Password</label>
<input type="password" className="form-control" value={payload.password} onChange={e=>setPayload({...payload,password:e.target.value})} required />
</div>
{error && <div className="alert alert-danger">{error}</div>}
<div className="d-flex justify-content-between align-items-center">
<button className="btn btn-success">Create account</button>
<a className="small" href="/login">Already registered?</a>
</div>
</form>
</div>
</div>
</div>
</div>
);
}