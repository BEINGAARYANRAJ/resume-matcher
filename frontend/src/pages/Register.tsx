import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    setLoading(true)
    try {
      await client.post('/api/auth/register', { email, password, full_name: fullName })
      setMessage('success')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.card}>
        <div style={styles.logo}>🚀</div>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.sub}>Start matching your resume to dream jobs</p>

        {message === 'success' ? (
          <div style={styles.success}>✅ Account created! Redirecting...</div>
        ) : message ? (
          <div style={styles.error}>{message}</div>
        ) : null}

        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRegister()}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{...styles.btn, opacity: loading ? 0.7 : 1}}
        >
          {loading ? 'Creating account...' : 'Get started →'}
        </button>

        <p style={styles.link}>
          Already have an account?{' '}
          <Link to="/login" style={styles.linkA}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
  },
  glow: {
    position: 'fixed',
    top: '-20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(14,14,20,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    backdropFilter: 'blur(20px)',
    animation: 'fadeUp 0.5s ease both',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  logo: { fontSize: '2rem', marginBottom: '1.25rem' },
  title: {
    fontFamily: "'Clash Display', sans-serif",
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '6px',
  },
  sub: { color: '#6b7280', fontSize: '14px', marginBottom: '1.75rem' },
  success: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    color: '#6ee7b7',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '14px',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '14px',
  },
  btn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 700,
    marginTop: '4px',
    animation: 'pulse-glow 3s ease infinite',
  },
  link: { textAlign: 'center' as const, marginTop: '1.25rem', fontSize: '14px', color: '#6b7280' },
  linkA: { color: '#a78bfa', textDecoration: 'none', fontWeight: 600 },
}