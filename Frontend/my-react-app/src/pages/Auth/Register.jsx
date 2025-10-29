// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function Register() {
//   const [payload, setPayload] = useState({
//     name: '',
//     email: '',
//     password: '',
//     role: 'Student',
//     semester:1,
//     phone:''
//   });
//   let role_out;
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   // Map role to registration API endpoint
//   const getRegisterUrl = (role) => {
//     role_out=role;
//     switch (role.toLowerCase()) {
//       case 'student':
//         return 'http://localhost:8000/student/register';
//       case 'parent':
//         return 'http://localhost:8000/parent/register';
//       case 'rc':
//         return 'http://localhost:8000/rc/register';
//       case 'admin':
//         return 'http://localhost:8000/admin/register';
//       default:
//         return 'http://localhost:8000/student/register';
//     }
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//      try {
//       const res = await fetch('http://localhost:8000/student/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           username: payload.name,   // your backend expects "username"
//           password: payload.password,
//           email: payload.email,
//           phone: payload.phone,
//           semester: Number(payload.semester)
//         })
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         let msg = "Registration failed";
//         if (Array.isArray(data.detail)) {
//           msg = data.detail[0].msg;
//         } else if (data.detail) {
//           msg = data.detail;
//         }
//         setError(msg); // ✅ string only
//       } else {
//         switch (role_out) {
//       case 'student':
//         alert("Student registered successfully!");
//         navigate('/studentdashboard');
//       case 'parent':
//         alert("Parent registered successfully!");
//         navigate('/parentdashboard');
//       case 'rc':
//        alert("RC registered successfully!");
//         navigate('/rcdashboard');
//       case 'admin':
//        alert("Admin registered successfully!");
//         navigate('/admindashboard');
//       default:
//         alert("Student registered successfully!");
//         navigate('/studentdashboard');
//     }
        
//       }
//     } catch (err) {
//       setError("Network error, please try again.");
//     }

//     setLoading(false);
//   };

//   const styles = {
//     page: {
//       minHeight: '100vh',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       background: 'linear-gradient(135deg, #f0f4ff, #ffffff)',
//       padding: '1rem',
//     },
//     card: {
//       width: '100%',
//       maxWidth: '500px',
//       borderRadius: '1rem',
//       boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
//       overflow: 'hidden',
//       transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//     },
//     cardHover: {
//       transform: 'translateY(-5px)',
//       boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
//     },
//     header: {
//       background: 'linear-gradient(90deg, #007bff, #6610f2)',
//       color: 'white',
//       textAlign: 'center',
//       padding: '1rem',
//       fontSize: '1.5rem',
//       fontWeight: '700',
//     },
//     formGroup: { marginBottom: '1rem' },
//     input: {
//       width: '100%',
//       padding: '0.5rem 0.75rem',
//       borderRadius: '0.5rem',
//       border: '1px solid #ced4da',
//       outline: 'none',
//       transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
//     },
//     inputFocus: {
//       borderColor: '#6610f2',
//       boxShadow: '0 0 8px rgba(102,16,242,0.3)',
//     },
//     select: {
//       width: '100%',
//       padding: '0.5rem 0.75rem',
//       borderRadius: '0.5rem',
//       border: '1px solid #ced4da',
//       outline: 'none',
//       transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
//     },
//     btn: {
//       background: 'linear-gradient(90deg, #007bff, #6610f2)',
//       color: 'white',
//       border: 'none',
//       padding: '0.6rem 1.8rem',
//       fontWeight: '600',
//       borderRadius: '50px',
//       cursor: 'pointer',
//       transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//     },
//     btnHover: {
//       transform: 'translateY(-3px)',
//       boxShadow: '0 8px 18px rgba(0,0,0,0.2)',
//     },
//     error: {
//       marginBottom: '1rem',
//       color: 'white',
//       background: '#dc3545',
//       padding: '0.5rem',
//       borderRadius: '0.5rem',
//       textAlign: 'center',
//     },
//     footerLink: { fontSize: '0.9rem', textDecoration: 'none', color: '#6610f2' },
//   };

//   return (
//     <div style={styles.page}>
//       <div
//         style={styles.card}
//         onMouseEnter={(e) =>
//           Object.assign(e.currentTarget.style, styles.cardHover)
//         }
//         onMouseLeave={(e) =>
//           Object.assign(e.currentTarget.style, {
//             transform: 'none',
//             boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
//           })
//         }
//       >
//         <div style={styles.header}>Create Your Account</div>
//         <div style={{ padding: '2rem' }}>
//           {error && <div style={styles.error}>{error}</div>}
//           <form onSubmit={onSubmit}>
//             <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
//               <div style={{ flex: '1 1 48%' }}>
//                 <label>Name</label>
//                 <input
//                   style={styles.input}
//                   placeholder="Your full name"
//                   value={payload.name}
//                   onChange={(e) =>
//                     setPayload({ ...payload, name: e.target.value })
//                   }
//                   required
//                 />
//               </div>
//               <div style={{ flex: '1 1 48%' }}>
//                 <label>Role</label>
//                 <select
//                   style={styles.select}
//                   value={payload.role}
//                   onChange={(e) =>
//                     setPayload({ ...payload, role: e.target.value })
//                   }
//                 >
//                   <option>Student</option>
//                   <option>Parent</option>
//                   <option>RC</option>
//                   <option>Admin</option>
//                 </select>
//               </div>
//             </div>
//             <div style={styles.formGroup}>
//               <label>Email</label>
//               <input
//                 type="email"
//                 style={styles.input}
//                 placeholder="example@mail.com"
//                 value={payload.email}
//                 onChange={(e) =>
//                   setPayload({ ...payload, email: e.target.value })
//                 }
//                 required
//               />
//             </div>
//             <div style={styles.formGroup}>
//               <label>Password</label>
//               <input
//                 type="password"
//                 style={styles.input}
//                 placeholder="Enter a strong password"
//                 value={payload.password}
//                 onChange={(e) =>
//                   setPayload({ ...payload, password: e.target.value })
//                 }
//                 required
//               />
//             </div>
//             <div style={styles.formGroup}>
//               <label>Semester</label>
//               <input
//                 type="number"
//                 style={styles.input}
//                 placeholder="Enter current semester"
//                 value={payload.semester}
//                 onChange={(e) =>
//                   setPayload({ ...payload, semester: e.target.value })
//                 }
//                 required
//               />
//             </div>
//             <div style={styles.formGroup}>
//               <label>Mobile number</label>
//               <input
//                 type="tel"
//                 style={styles.input}
//                 placeholder="Mobile number"
//                 value={payload.phone}
//                 onChange={(e) =>
//                   setPayload({ ...payload, phone: e.target.value })
//                 }
//                 required
//               />
//             </div>
//             <div
//               style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginTop: '1.5rem',
//               }}
//             >
//               <button
//                 type="submit"
//                 style={styles.btn}
//                 disabled={loading}
//                 onMouseEnter={(e) =>
//                   Object.assign(e.currentTarget.style, styles.btnHover)
//                 }
//                 onMouseLeave={(e) =>
//                   Object.assign(e.currentTarget.style, styles.btn)
//                 }
//               >
//                 {loading ? 'Creating Account...' : 'Create Account'}
//               </button>
//               <a style={styles.footerLink} href="/login">
//                 Already registered?
//               </a>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// 

import React, { useState } from 'react';
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
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to get API endpoint
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = getRegisterUrl(payload.role);

      // Build the payload dynamically based on the role
      const bodyData = {
        username: payload.name,
        password: payload.password,
        phone: payload.phone,
      };

      if (payload.role === 'Student') {
        bodyData.semester = Number(payload.semester);
      } else if (payload.role === 'Parent') {
        bodyData.student_id = Number(payload.student_id);
      }
      if(payload.role != 'Parent'){
        bodyData.email= payload.email
      }
      console.log("pa", payload);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      console.log("data",data);
      if (!res.ok) {
        let msg = 'Registration failed';
        if (Array.isArray(data.detail)) {
          msg = data.detail[0].msg;
        } else if (data.detail) {
          msg = data.detail;
        }
        setError(msg);
      } else {
        alert(`${payload.role} registered successfully!`);
        switch (payload.role.toLowerCase()) {
          case 'student':
            navigate('/studentdashboard');
            break;
          case 'parent':
            navigate('/parentdashboard');
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
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 48%' }}>
                <label>Name</label>
                <input
                  style={styles.input}
                  placeholder="Your full name"
                  value={payload.name}
                  onChange={(e) =>
                    setPayload({ ...payload, name: e.target.value })
                  }
                  required
                />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <label>Role</label>
                <select
                  style={styles.select}
                  value={payload.role}
                  onChange={(e) =>
                    setPayload({ ...payload, role: e.target.value })
                  }
                >
                  <option>Student</option>
                  <option>Parent</option>
                  <option>RC</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>
{payload.role != 'Parent' && (
            <div style={styles.formGroup}>
              <label>Email</label>
               <input
                type="email"
                style={styles.input}
                placeholder="example@mail.com"
                value={payload.email}
                onChange={(e) =>
                  setPayload({ ...payload, email: e.target.value })
                }
                required
              />
            </div>)}

            <div style={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                style={styles.input}
                placeholder="Enter a strong password"
                value={payload.password}
                onChange={(e) =>
                  setPayload({ ...payload, password: e.target.value })
                }
                required
              />
            </div>

            {/* Conditionally Render Fields Based on Role */}
            {payload.role === 'Student' && (
              <div style={styles.formGroup}>
                <label>Semester</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Enter current semester"
                  value={payload.semester}
                  onChange={(e) =>
                    setPayload({ ...payload, semester: e.target.value })
                  }
                  required
                />
              </div>
            )}

            {payload.role === 'Parent' && (
              <div style={styles.formGroup}>
                <label>Student ID</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Enter student ID"
                  value={payload.student_id}
                  onChange={(e) =>
                    setPayload({ ...payload, student_id: e.target.value })
                  }
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
                onChange={(e) =>
                  setPayload({ ...payload, phone: e.target.value })
                }
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
