import BASE_URL from "../api";
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email" placeholder="Email"
        value={email} onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <input
        type="password" placeholder="Password"
        value={password} onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <button
        onClick={handleLogin}
        style={{ width: '100%', padding: 10, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
      >
        Login
      </button>
      <p style={{ marginTop: 12, textAlign: 'center' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}