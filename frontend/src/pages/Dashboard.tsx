import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      <p>Welcome! Upload your resume to get started.</p>

      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <button
          onClick={() => navigate('/upload')}
          style={{ padding: '12px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}
        >
          📄 Upload Resume
        </button>
        <button
          onClick={() => navigate('/matches')}
          style={{ padding: '12px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}
        >
          💼 View Job Matches
        </button>
      </div>
    </div>
  )
}