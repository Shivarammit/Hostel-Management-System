import React, { useEffect, useState } from "react";
import { BASE_API } from "../../api";

export default function ListAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_API}/admin/reports/attendance`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch attendance report");
        return res.json();
      })
      .then((data) => {
        setRecords(data.attendance_report || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching attendance report:", err);
        setLoading(false);
      });
  }, []);

  // 🧾 Function to download table data as CSV
  const downloadCSV = () => {
    if (records.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headers = [
      "Attendance ID",
      "Student Username",
      "Email",
      "Phone",
      "Semester",
      "RC Username",
      "Status",
      "Date",
    ];

    const csvRows = [
      headers.join(","),
      ...records.map((r) =>
        [
          r.attendance_id,
          `"${r.student_username || ""}"`,
          `"${r.student_email || ""}"`,
          `"${r.student_phone || ""}"`,
          r.semester || "",
          `"${r.rc_username || ""}"`,
          r.attendance_status || "",
          new Date(r.date).toLocaleString(),
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_report.csv";
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
    present: {
      color: "green",
      fontWeight: "600",
    },
    absent: {
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
        <h2 style={styles.title}>📋 Attendance Report</h2>
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

      {/* Attendance Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Attendance ID</th>
            <th style={styles.th}>Student Username</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Semester</th>
            <th style={styles.th}>RC Username</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((r) => (
              <tr key={r.attendance_id}>
                <td style={styles.td}>{r.attendance_id}</td>
                <td style={styles.td}>{r.student_username || "—"}</td>
                <td style={styles.td}>{r.student_email || "—"}</td>
                <td style={styles.td}>{r.student_phone || "—"}</td>
                <td style={styles.td}>{r.semester || "—"}</td>
                <td style={styles.td}>{r.rc_username || "—"}</td>
                <td
                  style={{
                    ...styles.td,
                    ...(r.attendance_status === "Present"
                      ? styles.present
                      : styles.absent),
                  }}
                >
                  {r.attendance_status}
                </td>
                <td style={styles.td}>
                  {new Date(r.date).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={styles.noData}>
                No attendance records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
