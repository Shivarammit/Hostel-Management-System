import React, { useEffect, useState, useRef } from "react";
import ProCard from "../../components/ProCard";

export default function AdminDashboard() {
  const [feeReport, setFeeReport] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [hostelFeeData, setHostelFeeData] = useState([]);
  const [users, setUsers] = useState({ students: 0, rc: 0, parents: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [showHostelForm, setShowHostelForm] = useState(false);
  const [formData, setFormData] = useState({
    program: "",
    semester: "",
    amount: "",
    deadline: "",
    fine: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  // Refs for smooth scroll
  const usersRef = useRef(null);
  const feeRef = useRef(null);
  const attendanceRef = useRef(null);
   const takeattendanceRef = useRef(null);
  const hostelRef = useRef(null);
  const triggerRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [fee, attendance, hostelFee] = await Promise.all([
          fetch("http://localhost:8000/admin/reports/fee_payment").then((res) => res.json()),
          fetch("http://localhost:8000/admin/reports/attendance").then((res) => res.json()),
          fetch("http://localhost:8000/admin/reports/hostel_fee").then((res) => res.json()),
        ]);

        setFeeReport(fee.paid_fees || []);
        setAttendanceReport(attendance.attendance_report || []);
        setHostelFeeData(hostelFee.data || []);

        const [studentRes, rcRes, parentRes, adminRes] = await Promise.all([
          fetch("http://localhost:8000/admin/count/students").then((res) => res.json()),
          fetch("http://localhost:8000/admin/count/rc").then((res) => res.json()),
          fetch("http://localhost:8000/admin/count/parents").then((res) => res.json()),
          fetch("http://localhost:8000/admin/count/admins").then((res) => res.json()),
        ]);

        setUsers({
          students: studentRes.count || 0,
          rc: rcRes.count || 0,
          parents: parentRes.count || 0,
          admins: adminRes.count || 0,
        });
        console.log('attendance',attendance);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
      setLoading(false);
    }

    fetchStats();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit hostel fee form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResponseMsg("");
    console.log("reached");

    try {
      const created_time = new Date().toISOString().slice(0, 19).replace("T", " ");
      console.log("created",created_time)
      const res = await fetch("http://localhost:8000/admin/hostel_fee_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: formData.program,
          semester: parseInt(formData.semester),
          amount: parseFloat(formData.amount),
          deadline: formData.deadline,
          fine: parseFloat(formData.fine || 0)
        }),
      });

      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setResponseMsg("✅ Hostel semester fee details successfully updated!");
        setFormData({ program: "", semester: "", amount: "", deadline: "", fine: "",created:"" });
        setShowHostelForm(false);
      } else {
        setResponseMsg(`❌ Failed to update: ${data.detail || "Unknown error"}`);
      }
    } catch (err) {
      setResponseMsg("⚠️ Network error. Could not update fee details.");
    }

    setSubmitting(false);
  };

  // Download CSV
  const downloadCSV = (data, filename) => {
    if (!data.length) return alert("No data to download");
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));
    data.forEach((row) => {
      const values = headers.map((header) => `"${row[header] ?? ""}"`);
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <div style={styles.container}>
      {/* === INDEX NAVIGATION === */}
      <nav style={styles.nav}>
        <strong>Quick Navigation: </strong>
        <button onClick={() => scrollToSection(usersRef)} style={styles.navBtn}>Users</button>
        <button onClick={() => scrollToSection(feeRef)} style={styles.navBtn}>Fee Report</button>
        <button onClick={() => scrollToSection(attendanceRef)} style={styles.navBtn}>Attendance</button>
        <button onClick={() => scrollToSection(takeattendanceRef)} style={styles.navBtn}>Record Attendance</button>
        <button onClick={() => scrollToSection(hostelRef)} style={styles.navBtn}>Hostel Fee Report</button>
        <button onClick={() => scrollToSection(triggerRef)} style={styles.navBtn}>Trigger Hostel Fee</button>
      </nav>

      {/* USERS SECTION */}
      <section ref={usersRef} style={styles.section}>
        <ProCard title="Users Overview">
          <div>
            <div>Students: <strong>{users.students}</strong></div>
            <div>RCs: <strong>{users.rc}</strong></div>
            <div>Parents: <strong>{users.parents}</strong></div>
            <div>Admins: <strong>{users.admins}</strong></div>
          </div>
          <a href="/admin/users" style={styles.link}>Manage Users</a>
        </ProCard>
      </section>

      {/* FEE PAYMENT REPORT */}
      <section ref={feeRef} style={styles.section}>
        <ProCard title="Fee Payment Report">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feeReport.map((row, i) => (
                    <tr key={i}>
                      <td>{row.username}</td>
                      <td>{row.hostel_fee_amount}</td>
                      <td>{row.transaction_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={styles.footer}>
            <button onClick={() => downloadCSV(feeReport, "Fee_Report")} style={styles.btn}>Download CSV</button>
            <a href="/admin/reports/fee_payment" style={styles.viewAll}>See All</a>
          </div>
        </ProCard>
      </section>
        {/* ATTENDANCE REPORT */}
      <section ref={takeattendanceRef} style={styles.section}>
  <ProCard title="Take Attendance">
    <div className="text-center my-3">
      <button
        className="btn btn-primary"
        onClick={async () => {
          try {
            const res = await fetch("http://localhost:8000/start-attendance");
            const data = await res.json();
            alert(data.message || data.error);
          } catch (err) {
            console.error(err);
            alert("⚠️ Failed to start attendance recording.");
          }
        }}
      >
        🎥 Start Camera & Record Attendance
      </button>
      <p className="text-muted mt-2">
        Press <b>Enter</b> in the Python window to take attendance, <b>q</b> to quit.
      </p>
    </div>
  </ProCard>
</section>

      {/* ATTENDANCE REPORT */}
      <section ref={attendanceRef} style={styles.section}>
        <ProCard title="Attendance Report">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Attendance</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceReport.map((row, i) => (
                    <tr key={i}>
                      <td>{row.student_username}</td>
                      <td>{row.attendance_status}</td>
                      <td>{new Date(row.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={styles.footer}>
            <button onClick={() => downloadCSV(attendanceReport, "Attendance_Report")} style={styles.btn}>Download CSV</button>
            <a href="/admin/reports/attendance" style={styles.viewAll}>See All</a>
          </div>
        </ProCard>
      </section>

      {/* HOSTEL FEE REPORT */}
      <section ref={hostelRef} style={styles.section}>
        <ProCard title="Hostel Fee Report">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Semester</th>
                    <th>Fee (₹)</th>
                    <th>Deadline</th>
                    <th>Fine (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {hostelFeeData.map((row, i) => (
                    <tr key={i}>
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
            <button onClick={() => downloadCSV(hostelFeeData, "Hostel_Fee_Report")} style={styles.btn}>Download CSV</button>
            <a href="/admin/reports/hostel_fee" style={styles.viewAll}>See All</a>
          </div>
        </ProCard>
      </section>

      {/* TRIGGER HOSTEL FEE FORM */}
      <section ref={triggerRef} style={styles.section}>
        <ProCard title="Trigger Hostel Semester Fee Payment">
          {!showHostelForm ? (
            <button onClick={() => setShowHostelForm(true)} style={styles.btn}>
              Configure / Trigger Fee Details
            </button>
          ) : (
            <form onSubmit={handleFormSubmit} style={styles.form}>
              <label>Program</label>
              <select name="program" value={formData.program} onChange={handleInputChange} required>
                <option value="">Select Program</option>
                <option value="BE">BE</option>
                <option value="ME">ME</option>
                <option value="MBA">MBA</option>
              </select>

              <label>Semester</label>
              <input
                type="number"
                name="semester"
                min="1"
                max="8"
                placeholder="e.g., 5"
                value={formData.semester}
                onChange={handleInputChange}
                required
              />

              <label>Fee Amount (₹)</label>
              <input
                type="number"
                name="amount"
                placeholder="e.g., 15000"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />

              <label>Deadline</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} required />

              <label>Fine After Deadline (₹)</label>
              <input
                type="number"
                name="fine"
                placeholder="e.g., 500"
                value={formData.fine}
                onChange={handleInputChange}
              />

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                <button type="submit" style={styles.btn} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </button>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowHostelForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
          {responseMsg && <p style={{ marginTop: "10px", color: "#333" }}>{responseMsg}</p>}
        </ProCard>
      </section>
    </div>
  );
}

const styles = {
  container: { padding: "30px", backgroundColor: "#f9fafb", display: "flex", flexDirection: "column", gap: "30px" },
  nav: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    background: "#e5e7eb",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  navBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  section: { width: "100%" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    background: "#fff",
    borderRadius: "10px",
    padding: "15px",
    marginTop: "10px",
  },
  tableContainer: {
    maxHeight: "200px",
    overflowY: "auto",
    marginTop: "10px",
    borderRadius: "10px",
    backgroundColor: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
  },
  link: { display: "block", marginTop: "10px", color: "#007bff", textDecoration: "none" },
  btn: { background: "#2563eb", color: "white", padding: "6px 12px", border: "none", borderRadius: "6px", cursor: "pointer" },
  cancelBtn: { background: "#aaa", color: "white", padding: "6px 12px", border: "none", borderRadius: "6px", cursor: "pointer" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" },
  viewAll: { fontSize: "0.85rem", textDecoration: "none", color: "#555" },
};
