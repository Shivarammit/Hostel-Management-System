import React, { useEffect, useState } from "react";
import ProCard from '../../components/ProCard';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [feesDue, setFeesDue] = useState(0);
  const [room, setRoom] = useState("Not assigned");

  useEffect(() => {
    if (!user || !user.student_id) return;

    // Fetch student profile info (adjust backend endpoint as needed)
    fetch(`http://localhost:8000/rc/view_records/${user.student_id}`)
      .then(res => res.json())
      .then(data => {
        // You can append or merge additional profile data here
        setFeesDue(data.fee_records.reduce((sum, fee) => fee.status === 'pending' ? sum + fee.amount : sum, 0));
        // Room info can also be fetched or passed directly in `user`
      });

    // Fetch room info if not included in user
    fetch(`http://localhost:8000/api/rooms`)
      .then(res => res.json())
      .then(data => {
        const rooms = data.rooms || [];
        for (const r of rooms) {
          if (r.students.some(s => s.id === user.student_id)) {
            setRoom(r.room_number);
            break;
          }
        }
      });
  }, [user]);

  const downloadReceipt = async () => {
    if (!user || !user.student_id) return alert("User ID missing");
    const res = await fetch(`http://localhost:8000/student/fee_receipt/${user.student_id}`);
    if (res.ok) {
      const data = await res.json();
      alert(`Receipt downloaded: Amount ₹${data.receipt.amount}`);
      // Replace alert with actual file download handling if needed
    } else {
      alert("No receipt found");
    }
  };

  if (!user) return <div>Please login to view your dashboard.</div>;

  return (
    <div className="row g-3">
      <div className="col-lg-4">
        <ProCard title="Profile">
          <p><strong>Name:</strong> {user.username || "Unknown"}</p>
          <p><strong>Email:</strong> {user.email || "Unknown"}</p>
          <p><strong>Room:</strong> {room}</p>
        </ProCard>
      </div>
      <div className="col-lg-4">
        <ProCard title="Fee Status">
          <p>Amount Due: <strong>₹{feesDue}</strong></p>
          <button className="btn btn-outline-primary btn-sm" onClick={downloadReceipt}>
            Download Receipt
          </button>
        </ProCard>
      </div>
      <div className="col-lg-4">
        <ProCard title="Requests">
          <p><a className="btn btn-primary btn-sm" href="/student/gatepasses">Create Gate Pass</a></p>
        </ProCard>
      </div>

      <div className="col-12">
        <ProCard title="Recent Notices">
          <ul className="list-unstyled mb-0">
            <li>Welcome to the hostel portal — keep your documents updated.</li>
            <li>Mess schedule updated for the next week.</li>
          </ul>
        </ProCard>
      </div>
    </div>
  );
}
