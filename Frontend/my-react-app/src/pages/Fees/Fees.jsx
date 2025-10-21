import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Fees() {
  const { user } = useAuth();

  // Dummy state for fee details — replace with real data if available
  const [feeDetails] = useState({
    studentId: user.id || 'S12345',
    semester: user.semester || '3rd',
    fee: user.feesDue || 0,
    paid: user.paid || false,
    paymentTime: user.paymentTime || null // e.g., '2025-10-18 10:30 AM'
  });

  const downloadReceipt = () => {
    const content = `Fee Receipt
Name: ${user.name}
Student ID: ${feeDetails.studentId}
Semester: ${feeDetails.semester}
Fee: ₹${feeDetails.fee}
Status: ${feeDetails.paid ? 'Paid' : 'Not Paid'}
Time of Payment: ${feeDetails.paymentTime || 'N/A'}
Date: ${new Date().toLocaleDateString()}`;
    
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipt.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="row">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5>Fee Details</h5>
            <p><strong>Student ID:</strong> {feeDetails.studentId}</p>
            <p><strong>Semester:</strong> {feeDetails.semester}</p>
            <p><strong>Fee:</strong> ₹{feeDetails.fee}</p>
            <p><strong>Status:</strong> {feeDetails.paid ? 'Paid' : 'Not Paid'}</p>
            <p><strong>Time of Payment:</strong> {feeDetails.paymentTime || 'N/A'}</p>
            <button className="btn btn-outline-primary" onClick={downloadReceipt}>
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
