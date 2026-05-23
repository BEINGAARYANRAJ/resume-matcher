import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'   // ← use client not axios

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await client.post('/api/auth/register', {
        email,
        password,
        full_name: fullName 
      })
      setMessage('Registration successful! Redirecting...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h2>Register</h2>
      {message && (
        <p style={{ color: message.includes('successful') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <button
        onClick={handleRegister}
        style={{
          width: '100%', padding: 10,
          background: '#22c55e', color: '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer'
        }}
      >
        Register
      </button>
      <p style={{ marginTop: 12, textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}