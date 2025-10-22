import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  // If you want user to select role:
  const [role, setRole] = useState('student');
  // Set to 'student', 'parent', 'rc', 'admin' as needed

  // Map role to backend endpoint
  const getLoginUrl = (role) => {
    switch (role) {
      case "student": return "http://localhost:8000/student/login";
      case "parent": return "http://localhost:8000/parent/login";
      case "rc": return "http://localhost:8000/rc/login";
      case "admin": return "http://localhost:8000/admin/login";
      default: return "http://localhost:8000/student/login";
    }
  };

  const onSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    await login(email, password, role);  // pass role from select input
    navigate(`/${role}dashboard`);
  } catch (err) {
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f0f4ff, #ffffff)',
      padding: '1rem'
    },
    card: {
      width: '100%',
      maxWidth: '450px',
      borderRadius: '1rem',
      boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
    },
    header: {
      background: 'linear-gradient(90deg, #007bff, #6610f2)',
      color: 'white',
      textAlign: 'center',
      padding: '1rem',
      fontSize: '1.5rem',
      fontWeight: '700'
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #ced4da',
      outline: 'none',
      marginBottom: '1rem',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
    },
    inputFocus: { borderColor: '#6610f2', boxShadow: '0 0 8px rgba(102,16,242,0.3)' },
    btn: {
      background: 'linear-gradient(90deg, #007bff, #6610f2)',
      color: 'white',
      border: 'none',
      padding: '0.6rem 1.8rem',
      fontWeight: '600',
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    btnHover: { transform: 'translateY(-3px)', boxShadow: '0 8px 18px rgba(0,0,0,0.2)' },
    error: { marginBottom: '1rem', color: 'white', background: '#dc3545', padding: '0.5rem', borderRadius: '0.5rem', textAlign: 'center' },
    footerLink: { fontSize: '0.9rem', textDecoration: 'none', color: '#6610f2' }
  };


  return (
    <div style={styles.page}>
      <div
        style={styles.card}
        onMouseEnter={e => Object.assign(e.currentTarget.style, styles.cardHover)}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: '0 15px 35px rgba(0,0,0,0.15)' })}
      >
        <div style={styles.header}>Login</div>
        <div style={{ padding: '2rem' }}>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={onSubmit}>
            {/* Optionally let user select their role */}
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="rc">RC</option>
              <option value="admin">Admin</option>
            </select>
            <input
              type="text"
              placeholder="username"
              value={email}
              style={styles.input}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              style={styles.input}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <button
                type="submit"
                style={styles.btn}
                disabled={loading}
                onMouseEnter={e => Object.assign(e.currentTarget.style, styles.btnHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, styles.btn)}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
              <a style={styles.footerLink} href="/register">New Register?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
