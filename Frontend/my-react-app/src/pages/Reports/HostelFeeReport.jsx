import React, { useEffect, useState } from "react";
import { BASE_API } from "../../api";

export default function HostelFeeReport() {
  const [hostelFees, setHostelFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHostelFee() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_API}/admin/reports/hostel_fee`);
        const data = await res.json();
        setHostelFees(data.data || []);
      } catch (err) {
        console.error("Error fetching hostel fee report:", err);
      }
      setLoading(false);
    }

    fetchHostelFee();
  }, []);

  // Download CSV
  const downloadCSV = () => {
    if (!hostelFees.length) return alert("No data available to download");
    const csvRows = [];
    const headers = Object.keys(hostelFees[0]);
    csvRows.push(headers.join(","));
    hostelFees.forEach((row) => {
      const values = headers.map((header) => `"${row[header] ?? ""}"`);
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Hostel_Fee_Report.csv";
    link.click();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🏠 Hostel Fee Report</h2>

      {loading ? (
        <p>Loading...</p>
      ) : hostelFees.length === 0 ? (
        <p>No hostel fee records found.</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Program</th>
                <th>Semester</th>
                <th>Fee (₹)</th>
                <th>Deadline</th>
                <th>Fine (₹)</th>
              </tr>
            </thead>
            <tbody>
              {hostelFees.map((row, index) => (
                <tr key={index}>
                  <td>{row.id}</td>
                  <td>{row.program}</td>
                  <td>{row.sem}</td>
                  <td>{row.fee}</td>
                  <td>{row.deadline}</td>
                  <td>{row.fine || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.footer}>
        <button onClick={downloadCSV} style={styles.btn}>Download CSV</button>
        <button onClick={() => window.history.back()} style={styles.cancelBtn}>← Back</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  heading: {
    marginBottom: "20px",
    fontSize: "1.5rem",
    color: "#111827",
  },
  tableContainer: {
    overflowY: "auto",
    maxHeight: "70vh",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  btn: {
    background: "#2563eb",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#6b7280",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
