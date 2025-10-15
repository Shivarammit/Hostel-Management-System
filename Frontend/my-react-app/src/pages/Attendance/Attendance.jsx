import React, { useEffect, useState } from 'react';
import { api } from '../../api/mockApi';


export default function Attendance(){
const [students,setStudents] = useState([]);
const [records,setRecords] = useState({});
const [date,setDate] = useState(new Date().toISOString().slice(0,10));


useEffect(()=>{ async function load(){ const s = await api.fetchStudents(); setStudents(s); } load(); },[]);


const toggle = (id) => setRecords(r=>({...r,[id]: !r[id]}));
const save = async () =>{ await api.markAttendance(date,records); alert('Saved'); };


return (
<div>
<h4>Mark Attendance — {date}</h4>
<div className="mb-3"><input type="date" className="form-control w-auto" value={date} onChange={e=>setDate(e.target.value)} /></div>
<div className="list-group">
{students.map(s=> (
<div key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
<div>
<strong>{s.name}</strong>
<div className="small text-muted">{s.room}</div>
</div>
<div>
<div className="form-check form-switch">
<input className="form-check-input" type="checkbox" checked={!!records[s.id]} onChange={()=>toggle(s.id)} id={`a${s.id}`} />
<label className="form-check-label small" htmlFor={`a${s.id}`}>{records[s.id] ? 'Present' : 'Absent'}</label>
</div>
</div>
</div>
))}
</div>
<div className="mt-3"><button className="btn btn-primary" onClick={save}>Save Attendance</button></div>
</div>
);
}