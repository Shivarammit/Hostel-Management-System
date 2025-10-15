import React from 'react';


export default function Reports(){
return (
<div>
<h4>Reports</h4>
<p>Export attendance, fees and room allocation reports (CSV / PDF) — placeholder UI.</p>
<div className="d-flex gap-2">
<button className="btn btn-outline-primary">Export Attendance (CSV)</button>
<button className="btn btn-outline-secondary">Export Fees (PDF)</button>
</div>
</div>
);
}