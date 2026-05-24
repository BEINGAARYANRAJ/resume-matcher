import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'

interface Match {
  job: { title: string; company: string; location: string; source_url: string; description: string }
  score: number
  matched_skills: string[]
  missing_skills: string[]
}

export default function JobMatches() {
  const { resumeId } = useParams()
  const navigate = useNavigate()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get(`/api/jobs/match/${resumeId}`)
      .then(r => { setMatches(r.data.matches || []); setLoading(false) })
      .catch(() => { setError('Failed to load matches'); setLoading(false) })
  }, [resumeId])

  const scoreColor = (s: number) => s >= 70 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444'
  const scoreLabel = (s: number) => s >= 70 ? 'Strong Match' : s >= 50 ? 'Good Match' : 'Weak Match'

  return (
    <div style={styles.page}>
      <div style={styles.glow} />

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>⚡ ResumeMatcher</span>
        <div style={styles.headerRight}>
          <button onClick={() => navigate('/upload')} style={styles.btn2}>Upload New</button>
          <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }} style={styles.btnOut}>Sign out</button>
        </div>
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Your Job Matches</h1>
        <p style={styles.sub}>
          {loading ? 'Finding your best matches...' : `Found ${matches.length} matches for your resume`}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.loadingBox}>
          <div style={styles.loadingIcon}>🔍</div>
          <p style={styles.loadingTitle}>Analyzing your resume...</p>
          <p style={styles.loadingSub}>Fetching real jobs and scoring matches with AI</p>
          <div style={styles.progressBar}><div style={styles.progressFill} /></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <p>❌ {error}</p>
          <button onClick={() => navigate('/upload')} style={styles.retryBtn}>Try Again</button>
        </div>
      )}

      {/* No matches */}
      {!loading && !error && matches.length === 0 && (
        <div style={styles.emptyBox}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
          <p style={{ color: '#fff', fontWeight: 600, marginBottom: '8px' }}>No matches found yet</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '1.5rem' }}>Try uploading a more detailed resume</p>
          <button onClick={() => navigate('/upload')} style={styles.retryBtn}>Upload Resume</button>
        </div>
      )}

      {/* Match cards */}
      {!loading && matches.map((m, i) => (
        <div key={i} style={styles.card}>
          {/* Score badge */}
          <div style={{ ...styles.scoreBadge, background: `${scoreColor(m.score)}20`, border: `1px solid ${scoreColor(m.score)}40` }}>
            <span style={{ ...styles.scoreNum, color: scoreColor(m.score) }}>{Math.round(m.score)}%</span>
            <span style={{ ...styles.scoreLabel, color: scoreColor(m.score) }}>{scoreLabel(m.score)}</span>
          </div>

          {/* Job info */}
          <div style={styles.jobInfo}>
            <h2 style={styles.jobTitle}>{m.job.title}</h2>
            <div style={styles.jobMeta}>
              <span style={styles.metaItem}>🏢 {m.job.company || 'Company'}</span>
              <span style={styles.metaItem}>📍 {m.job.location || 'Remote'}</span>
            </div>

            {/* Skills */}
            <div style={styles.skillsRow}>
              {(m.matched_skills || []).slice(0, 4).map((s, j) => (
                <span key={j} style={styles.skillGreen}>✓ {s}</span>
              ))}
              {(m.missing_skills || []).slice(0, 3).map((s, j) => (
                <span key={j} style={styles.skillRed}>✗ {s}</span>
              ))}
            </div>

            {/* Apply button */}
            {m.job.source_url && (
              <a href={m.job.source_url} target="_blank" rel="noreferrer" style={styles.applyBtn}>
                Apply Now →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  glow: {
    position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: '800px', height: '400px',
    background: 'radial-gradient(ellipse, rgba(108,99,255,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '2.5rem',
  },
  logo: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#fff' },
  headerRight: { display: 'flex', gap: '8px' },
  btn2: {
    background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
    color: '#a78bfa', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
  },
  btnOut: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#9ca3af', padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
  },
  hero: { marginBottom: '2rem', animation: 'fadeUp 0.5s ease both' },
  title: { fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '6px' },
  sub: { color: '#6b7280', fontSize: '15px' },
  loadingBox: {
    background: 'rgba(14,14,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px', padding: '3rem', textAlign: 'center', marginBottom: '1.5rem',
  },
  loadingIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  loadingTitle: { color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px' },
  loadingSub: { color: '#6b7280', fontSize: '14px', marginBottom: '1.5rem' },
  progressBar: {
    width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px', margin: '0 auto', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', width: '40%',
    background: 'linear-gradient(90deg, #6c63ff, #a78bfa)',
    borderRadius: '2px', animation: 'progress 1.5s ease infinite',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#fca5a5',
  },
  emptyBox: {
    background: 'rgba(14,14,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px', padding: '3rem', textAlign: 'center',
  },
  retryBtn: {
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', color: '#fff',
    border: 'none', padding: '10px 24px', borderRadius: '10px',
    fontSize: '14px', fontWeight: 700, marginTop: '1rem', cursor: 'pointer',
  },
  card: {
    background: 'rgba(14,14,20,0.7)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem',
    display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
    animation: 'fadeUp 0.4s ease both',
    transition: 'border-color 0.2s',
  },
  scoreBadge: {
    flexShrink: 0, borderRadius: '12px', padding: '12px 16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '80px',
  },
  scoreNum: { fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Syne', sans-serif" },
  scoreLabel: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' },
  jobInfo: { flex: 1 },
  jobTitle: { color: '#fff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', fontFamily: "'Syne', sans-serif" },
  jobMeta: { display: 'flex', gap: '1rem', marginBottom: '12px', flexWrap: 'wrap' as const },
  metaItem: { color: '#6b7280', fontSize: '13px' },
  skillsRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginBottom: '14px' },
  skillGreen: {
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
    color: '#6ee7b7', borderRadius: '100px', padding: '3px 10px', fontSize: '12px', fontWeight: 600,
  },
  skillRed: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#fca5a5', borderRadius: '100px', padding: '3px 10px', fontSize: '12px', fontWeight: 600,
  },
  applyBtn: {
    display: 'inline-block', background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    color: '#fff', padding: '8px 18px', borderRadius: '8px',
    fontSize: '13px', fontWeight: 700, textDecoration: 'none',
  },
}