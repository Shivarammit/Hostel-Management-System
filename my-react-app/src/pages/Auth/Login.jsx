import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


export default function Login(){
const [email,setEmail] = useState('');
const [password,setPassword] = useState('');
const [error,setError] = useState(null);
const { login } = useAuth();
const navigate = useNavigate();


const onSubmit = async (e) =>{
e.preventDefault();
setError(null);
try{
const u = await login(email,password);
navigate(`/${u.role.toLowerCase()}`);
}catch(err){ setError(err.message); }
};


return (
<div className="auth-page row justify-content-center">
<div className="col-md-6">
<div className="card shadow-sm border-0">
<div className="card-body p-4">
<h3 className="mb-3">Login</h3>
<form onSubmit={onSubmit}>
<div className="mb-3">
<label className="form-label">Email</label>
<input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required />
</div>
<div className="mb-3">
<label className="form-label">Password</label>
<input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required />
</div>
{error && <div className="alert alert-danger">{error}</div>}
<div className="d-flex justify-content-between align-items-center">
<button className="btn btn-primary">Sign in</button>
<a className="small" href="/register">New? Register</a>
</div>
</form>
</div>
</div>
</div>
</div>
);
}