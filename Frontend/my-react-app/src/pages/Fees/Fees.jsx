import React, { useEffect, useState } from "react";

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`http://localhost:8000/rc/view_records/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setFees(data.fee_records || []);
        setLoading(false);
      });
  }, [studentId]);

  const handlePay = async (feeId) => {
    setPaymentStatus("Processing...");
    const res = await fetch("http://localhost:8000/student/pay_fee", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        student_id: studentId,
        amount: fees.find(f => f.id === feeId).amount,
      }),
    });
    if (res.ok) {
      setPaymentStatus("Payment successful!");
      setFees(fees.map(f => (f.id === feeId ? {...f, status: "paid"} : f)));
    } else {
      setPaymentStatus("Payment failed. Try again.");
    }
  };

  if (loading)
    return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: 20 }}>Fees Dashboard</h2>
      <label>
        Student ID 
        <input
          type="text"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
          style={{ marginBottom: 20, marginLeft: 10 }}
        />
      </label>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Fee ID</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Amount</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Status</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee) => (
            <tr key={fee.id}>
              <td style={{ border: "1px solid #ccc", padding: 10 }}>{fee.id}</td>
              <td style={{ border: "1px solid #ccc", padding: 10 }}>{fee.amount}</td>
              <td style={{ border: "1px solid #ccc", padding: 10 }}>{fee.status}</td>
              <td style={{ border: "1px solid #ccc", padding: 10 }}>
                {fee.status !== "paid" ? (
                  <button
                    style={{
                      padding: "8px 14px",
                      background: "#2ecc40",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => handlePay(fee.id)}
                  >
                    Pay
                  </button>
                ) : "Paid"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20, color: "#1E90FF", fontWeight: "bold" }}>
        {paymentStatus}
      </div>
    </div>
  );
}
