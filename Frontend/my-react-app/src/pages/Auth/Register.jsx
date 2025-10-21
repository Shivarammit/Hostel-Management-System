import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const [payload, setPayload] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const u = await register(payload);
      navigate(`/${u.role.toLowerCase()}`);
    } catch (err) {
      setError(err.message);
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
      maxWidth: '500px',
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
    formGroup: { marginBottom: '1rem' },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #ced4da',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
    },
    inputFocus: { borderColor: '#6610f2', boxShadow: '0 0 8px rgba(102,16,242,0.3)' },
    select: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #ced4da',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
    },
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
                  onChange={e => setPayload({ ...payload, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <label>Role</label>
                <select
                  style={styles.select}
                  value={payload.role}
                  onChange={e => setPayload({ ...payload, role: e.target.value })}
                >
                  <option>Student</option>
                  <option>Parent</option>
                  <option>RC</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                style={styles.input}
                placeholder="example@mail.com"
                value={payload.email}
                onChange={e => setPayload({ ...payload, email: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                style={styles.input}
                placeholder="Enter a strong password"
                value={payload.password}
                onChange={e => setPayload({ ...payload, password: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <button
                type="submit"
                style={styles.btn}
                onMouseEnter={e => Object.assign(e.currentTarget.style, styles.btnHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, styles.btn)}
              >
                Create Account
              </button>
              <a style={styles.footerLink} href="/login">Already registered?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
