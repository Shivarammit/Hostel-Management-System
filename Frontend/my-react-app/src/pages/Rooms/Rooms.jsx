import React, { useState } from 'react';


export default function Rooms(){
const [rooms,setRooms] = useState([ {id:1,name:'A-101',beds:3,occupied:2}, {id:2,name:'B-102',beds:2,occupied:1}]);
const [newRoom,setNewRoom] = useState('');


const add = ()=>{ if(!newRoom) return; setRooms(r=>[...r,{id:Date.now(),name:newRoom,beds:2,occupied:0}]); setNewRoom(''); };
const del = (id)=> setRooms(r=>r.filter(x=>x.id!==id));


return (
<div>
<h4>Rooms</h4>
<div className="mb-3 d-flex gap-2">
<input className="form-control w-auto" placeholder="Room name" value={newRoom} onChange={e=>setNewRoom(e.target.value)} />
<button className="btn btn-primary" onClick={add}>Add</button>
</div>
<div className="row">
{rooms.map(r=> (
<div className="col-md-4" key={r.id}>
<div className="card mb-3">
<div className="card-body">
<h6>{r.name}</h6>
<p className="small mb-1">Beds: {r.beds}</p>
<p className="small mb-1">Occupied: {r.occupied}</p>
<button className="btn btn-sm btn-danger" onClick={()=>del(r.id)}>Delete</button>
</div>
</div>
</div>
))}
</div>
</div>
);
}