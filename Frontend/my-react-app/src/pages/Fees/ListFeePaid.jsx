import React, { useEffect, useState } from "react";

export default function FeePaidList() {
  const [paidFees, setPaidFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/admin/reports/fee_payment")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setPaidFees(data.paid_fees || []);
      
        setLoading(false);
         console.log("Paid",data);
      })
      .catch((err) => {
        console.error("Error fetching fee data:", err);
        setLoading(false);
      });
     
  }, []);

  // 🧾 Download report as CSV
  const downloadCSV = () => {
    if (paidFees.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headers = [
      "Student ID",
      "Username",
      "Email",
      "Phone",
      "Semester",
      "Fee Amount",
      "Transaction Amount",
      "Status",
      "Transaction Time",
    ];

    const csvRows = [
      headers.join(","),
      ...paidFees.map((fee) =>
        [
          fee.student_id,
          `"${fee.username || ""}"`,
          `"${fee.email || ""}"`,
          `"${fee.phone || ""}"`,
          fee.semester || "",
          fee.fee_amount || "",
          fee.transaction_amount || "",
          fee.transaction_status || "",
          new Date(fee.transaction_time).toLocaleString(),
        ].join(",")
      ),
    ];
console.log("paid",paidFees)
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fee_payment_report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const styles = {
    container: {
      padding: "20px",
      backgroundColor: "#fafafa",
      borderRadius: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
      margin: "20px auto",
      maxWidth: "95%",
      fontFamily: "Arial, sans-serif",
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: {
      color: "#222",
      fontSize: "1.5rem",
      fontWeight: "600",
    },
    button: {
      backgroundColor: "#1E90FF",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "8px 15px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "background 0.2s",
    },
    buttonHover: {
      backgroundColor: "#187bcd",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
    },
    th: {
      background: "#f1f1f1",
      fontWeight: "bold",
      padding: "12px",
      borderBottom: "1px solid #ddd",
      textAlign: "center",
      fontSize: "14px",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #ddd",
      textAlign: "center",
      fontSize: "14px",
    },
    paid: {
      color: "green",
      fontWeight: "600",
    },
    unpaid: {
      color: "red",
      fontWeight: "600",
    },
    loading: {
      textAlign: "center",
      marginTop: "50px",
      fontSize: "18px",
    },
    noData: {
      textAlign: "center",
      fontStyle: "italic",
      color: "#666",
      padding: "20px 0",
    },
  };

  if (loading) return <p style={styles.loading}>Loading...</p>;

  return (
    <div style={styles.container}>
      {/* Header with Title + Download Button */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>💰 Fee Payment Report</h2>
        <button
          style={styles.button}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = styles.button.backgroundColor)
          }
          onClick={downloadCSV}
        >
          ⬇️ Download CSV
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Student ID</th>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Semester</th>
            <th style={styles.th}>Course</th>
            <th style={styles.th}>Deadline</th>
            <th style={styles.th}>Fee Amount</th>
            <th style={styles.th}>Fine(per day)</th>
            <th style={styles.th}>Paid</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Transaction Time</th>
            
          </tr>
        </thead>
        <tbody>
          {paidFees.length > 0 ? (
            paidFees.map((fee, i) => (
              
              <tr key={i}>
                <td style={styles.td}>{i+1}</td>
                <td style={styles.td}>{fee.student_id}</td>
                <td style={styles.td}>{fee.username}</td>
                <td style={styles.td}>{fee.email}</td>
                <td style={styles.td}>{fee.semester}</td>
                <td style={styles.td}>{fee.fee_program}</td>
                <td style={styles.td}>{fee.deadline}</td>
                <td style={styles.td}>₹{fee.hostel_fee_amount}</td>
                <td style={styles.td}>{fee.fine}</td>
                <td style={styles.td}>₹{fee.paid_amount}</td>


                <td
                  style={{
                    ...styles.td,
                    ...(fee.transaction_status === "Paid"
                      ? styles.paid
                      : styles.unpaid),
                  }}
                >
                  {fee.transaction_status}
                </td>
                <td style={styles.td}>
                  {new Date(fee.transaction_time).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={styles.noData} colSpan="9">
                No paid records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
