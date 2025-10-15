import React from 'react';
import { useAuth } from '../../contexts/AuthContext';


export default function Fees(){
const { user } = useAuth();


const downloadReceipt = () =>{
// create dummy PDF-like blob (simple text file renamed to .pdf) — replace with real PDF generation
const content = `Receipt\nName: ${user.name}\nAmount: ₹${user.feesDue || 0}\nDate: ${new Date().toLocaleDateString()}`;
const blob = new Blob([content], {type: 'application/pdf'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = 'receipt.pdf'; a.click();
URL.revokeObjectURL(url);
};


return (
<div className="row">
<div className="col-md-6">
<div className="card shadow-sm">
<div className="card-body">
<h5>Fee Summary</h5>
<p>Amount due: <strong>₹{user.feesDue || 0}</strong></p>
<button className="btn btn-outline-primary" onClick={downloadReceipt}>Download Receipt</button>
</div>
</div>
</div>
</div>
);
}