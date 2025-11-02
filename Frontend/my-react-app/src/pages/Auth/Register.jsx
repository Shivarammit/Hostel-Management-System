import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [payload, setPayload] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    semester: 1,
    phone: '',
    student_id: '',
    image: null, // Will hold a Blob from camera
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const getRegisterUrl = (role) => {
    switch (role.toLowerCase()) {
      case 'student':
        return 'http://localhost:8000/student/register';
      case 'parent':
        return 'http://localhost:8000/parent/register';
      case 'rc':
        return 'http://localhost:8000/rc/register';
      case 'admin':
        return 'http://localhost:8000/admin/register';
      default:
        return 'http://localhost:8000/student/register';
    }
  };

  // ✅ Start camera
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied', err);
      setError('Unable to access camera.');
    }
  };

  // ✅ Capture image from camera
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, 300, 300);
    canvas.toBlob((blob) => {
      setPayload({ ...payload, image: blob });
      setShowCamera(false);
      // Stop camera stream after capture
      const stream = video.srcObject;
      const tracks = stream?.getTracks();
      tracks?.forEach((track) => track.stop());
    }, 'image/jpeg');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = getRegisterUrl(payload.role);
      let res;
      if (payload.role === 'Student') {
        const formData = new FormData();
        formData.append('username', payload.name);
        formData.append('password', payload.password);
        formData.append('email', payload.email);
        formData.append('phone', payload.phone);
        formData.append('semester', payload.semester);
        formData.append('program', payload.program);
        formData.append('image', payload.image,`${payload.name}.jpg`);

        res = await fetch(url, { method: 'POST', body: formData });
      } else {
        const bodyData = {
          username: payload.name,
          password: payload.password,
          phone: payload.phone,
        };
        if (payload.role === 'Parent') {
          bodyData.student_id = Number(payload.student_id);
        } else {
          bodyData.email = payload.email;
        }
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
        });
      }

      const data = await res.json();
      console.log("data",data)
      if (!res.ok) {
        let msg = 'Registration failed';
        if (Array.isArray(data.detail)) msg = data.detail[0].msg;
        else if (data.detail) msg = data.detail;
        setError(msg);
      } else {
        alert(`${payload.role} Id: ${data.id} registered successfully!`);
        switch (payload.role.toLowerCase()) {
          case 'student':
            navigate('/studentdashboard');
            break;
          case 'parent':
            navigate('/parentdashboard', { state: { student_id: data.user?.student_id } });
            break;
          case 'rc':
            navigate('/rcdashboard');
            break;
          case 'admin':
            navigate('/admindashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Network error, please try again.');
    }

    setLoading(false);
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f0f4ff, #ffffff)',
      padding: '1rem',
    },
    card: {
      width: '100%',
      maxWidth: '500px',
      borderRadius: '1rem',
      boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    header: {
      background: 'linear-gradient(90deg, #007bff, #6610f2)',
      color: 'white',
      textAlign: 'center',
      padding: '1rem',
      fontSize: '1.5rem',
      fontWeight: '700',
    },
    formGroup: { marginBottom: '1rem' },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #ced4da',
    },
    select: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #ced4da',
    },
    btn: {
      background: 'linear-gradient(90deg, #007bff, #6610f2)',
      color: 'white',
      border: 'none',
      padding: '0.6rem 1.8rem',
      fontWeight: '600',
      borderRadius: '50px',
      cursor: 'pointer',
    },
    error: {
      marginBottom: '1rem',
      color: 'white',
      background: '#dc3545',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>Create Your Account</div>
        <div style={{ padding: '2rem' }}>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={onSubmit}>
            {/* Basic fields remain unchanged */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 48%' }}>
                <label>Name</label>
                <input
                  style={styles.input}
                  placeholder="Your full name"
                  value={payload.name}
                  onChange={(e) => setPayload({ ...payload, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <label>Role</label>
                <select
                  style={styles.select}
                  value={payload.role}
                  onChange={(e) => setPayload({ ...payload, role: e.target.value })}
                >
                  <option>Student</option>
                  <option>Parent</option>
                  <option>RC</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>

            {payload.role !== 'Parent' && (
              <div style={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  placeholder="example@mail.com"
                  value={payload.email}
                  onChange={(e) => setPayload({ ...payload, email: e.target.value })}
                  required
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                style={styles.input}
                placeholder="Enter a strong password"
                value={payload.password}
                onChange={(e) => setPayload({ ...payload, password: e.target.value })}
                required
              />
            </div>

            {payload.role === 'Student' && (
              <>
             
<div style={styles.formGroup}>
  <label>Course</label>
  <select
    style={styles.input}
    value={payload.program}
    onChange={(e) => {
      const selectedCourse = e.target.value;
      setPayload({
        ...payload,
        program: selectedCourse,
        semester: "", // reset semester when course changes
      });
    }}
    required
  >
    <option value="">Select course</option>
    <option value="BE">BE</option>
    <option value="MBA">MBA</option>
    <option value="ME">ME</option>
  </select>
</div>

<div style={styles.formGroup}>
  <label>Semester</label>
  <select
    style={styles.input}
    value={payload.semester}
    onChange={(e) => setPayload({ ...payload, semester: e.target.value })}
    required
    disabled={!payload.program} // disable until course is selected
  >
    <option value="">Select semester</option>
    {payload.program === "BE" &&
      Array.from({ length: 8 }, (_, i) => (
        <option key={i + 1} value={i + 1}>
          {i + 1}
        </option>
      ))}
    {(payload.program === "MBA" || payload.program === "ME") &&
      Array.from({ length: 4 }, (_, i) => (
        <option key={i + 1} value={i + 1}>
          {i + 1}
        </option>
      ))}
  </select>
</div>

                {/* ✅ CAMERA CAPTURE SECTION */}
                <div style={styles.formGroup}>
                  <label>Capture Image</label>
                  {!payload.image && (
                    <button type="button" style={styles.btn} onClick={startCamera}>
                      Open Camera
                    </button>
                  )}
                  {payload.image && (
                    <p style={{ color: 'green' }}>✅ Image captured successfully!</p>
                  )}
                </div>

                {showCamera && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <video ref={videoRef} width="300" height="300" autoPlay />
                    <br />
                    <button
                      type="button"
                      style={{ ...styles.btn, marginTop: '0.5rem' }}
                      onClick={captureImage}
                    >
                      Capture
                    </button>
                    <canvas
                      ref={canvasRef}
                      width="300"
                      height="300"
                      style={{ display: 'none' }}
                    ></canvas>
                  </div>
                )}
              </>
            )}

            {payload.role === 'Parent' && (
              <div style={styles.formGroup}>
                <label>Student ID</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Enter student ID"
                  value={payload.student_id}
                  onChange={(e) => setPayload({ ...payload, student_id: e.target.value })}
                  required
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label>Mobile Number</label>
              <input
                type="tel"
                style={styles.input}
                placeholder="Mobile number"
                value={payload.phone}
                onChange={(e) => setPayload({ ...payload, phone: e.target.value })}
                required
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.5rem',
              }}
            >
              <button type="submit" style={styles.btn} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <a style={{ color: '#6610f2' }} href="/login">
                Already registered?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
