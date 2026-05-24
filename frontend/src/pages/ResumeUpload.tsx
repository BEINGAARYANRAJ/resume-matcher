import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import client from '../api/client'

export default function ResumeUpload() {
  const [status, setStatus] = useState<'idle'|'uploading'|'done'|'error'>('idle')
  const [filename, setFilename] = useState('')
  const navigate = useNavigate()

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setStatus('uploading')
    setFilename(file.name)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await client.post('/api/resume/upload', form)
      setStatus('done')
      setTimeout(() => navigate(`/matches/${res.data.resume_id || 1}`), 1500)
    } catch {
      setStatus('error')
    }
  }, [navigate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    disabled: status !== 'idle',
  })

  return (
    <div style={styles.page}>
      <div style={styles.topGlow} />

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>⚡ ResumeMatcher</span>
        <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }} style={styles.logout}>
          Sign out
        </button>
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.badge}>AI-Powered Job Matching</div>
        <h1 style={styles.title}>
          Upload your resume,<br/>
          <span style={styles.gradient}>find your dream job</span>
        </h1>
        <p style={styles.sub}>
          Our AI analyzes your resume and matches you with the best job opportunities in seconds
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        style={{
          ...styles.dropzone,
          ...(isDragActive ? styles.dropzoneActive : {}),
          ...(status === 'done' ? styles.dropzoneDone : {}),
          ...(status === 'error' ? styles.dropzoneError : {}),
        }}
      >
        <input {...getInputProps()} />

        {status === 'idle' && (
          <>
            <div style={styles.dropIcon}>{isDragActive ? '📂' : '📄'}</div>
            <p style={styles.dropTitle}>
              {isDragActive ? 'Drop it here!' : 'Drop your resume here'}
            </p>
            <p style={styles.dropSub}>PDF or DOCX · Max 10MB</p>
            <div style={styles.dropBtn}>Browse files</div>
          </>
        )}

        {status === 'uploading' && (
          <>
            <div style={styles.spinner}>⏳</div>
            <p style={styles.dropTitle}>Analyzing "{filename}"</p>
            <p style={styles.dropSub}>AI is reading your resume...</p>
            <div style={styles.progressBar}>
              <div style={styles.progressFill} />
            </div>
          </>
        )}

        {status === 'done' && (
          <>
            <div style={styles.dropIcon}>✅</div>
            <p style={styles.dropTitle}>Resume analyzed!</p>
            <p style={styles.dropSub}>Finding your best job matches...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.dropIcon}>❌</div>
            <p style={styles.dropTitle}>Upload failed</p>
            <p style={styles.dropSub}>Please try again with a PDF or DOCX file</p>
          </>
        )}
      </div>

      {/* Features */}
      <div style={styles.features}>
        {[
          { icon: '🤖', title: 'AI Analysis', desc: 'GPT extracts your skills and experience' },
          { icon: '🎯', title: 'Smart Matching', desc: 'Semantic similarity scoring' },
          { icon: '💡', title: 'Gap Analysis', desc: 'Know exactly what skills to learn' },
        ].map((f, i) => (
          <div key={i} style={styles.featureCard}>
            <span style={styles.featureIcon}>{f.icon}</span>
            <strong style={styles.featureTitle}>{f.title}</strong>
            <span style={styles.featureDesc}>{f.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '0 1.5rem 4rem',
    maxWidth: '760px',
    margin: '0 auto',
  },
  topGlow: {
    position: 'fixed',
    top: 0, left: '50%',
    transform: 'translateX(-50%)',
    width: '800px', height: '400px',
    background: 'radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '3rem',
  },
  logo: {
    fontFamily: "'Clash Display', sans-serif",
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#fff',
  },
  logout: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#9ca3af',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '2.5rem',
    animation: 'fadeUp 0.5s ease both',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(108,99,255,0.15)',
    border: '1px solid rgba(108,99,255,0.3)',
    color: '#a78bfa',
    borderRadius: '100px',
    padding: '4px 14px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  title: {
    fontFamily: "'Clash Display', sans-serif",
    fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#fff',
    marginBottom: '1rem',
  },
  gradient: {
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  sub: {
    color: '#6b7280',
    fontSize: '16px',
    maxWidth: '480px',
    margin: '0 auto',
    lineHeight: 1.7,
  },
  dropzone: {
    border: '2px dashed rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '3rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'rgba(14,14,20,0.6)',
    transition: 'all 0.2s',
    marginBottom: '2rem',
    animation: 'fadeUp 0.5s 0.1s ease both',
  },
  dropzoneActive: {
    border: '2px dashed #a78bfa',
    background: 'rgba(108,99,255,0.08)',
  },
  dropzoneDone: {
    border: '2px dashed #10b981',
    background: 'rgba(16,185,129,0.08)',
  },
  dropzoneError: {
    border: '2px dashed #ef4444',
    background: 'rgba(239,68,68,0.08)',
  },
  dropIcon: { fontSize: '3rem', marginBottom: '1rem' },
  dropTitle: {
    fontFamily: "'Clash Display', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '6px',
  },
  dropSub: { color: '#6b7280', fontSize: '14px', marginBottom: '1.25rem' },
  dropBtn: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 700,
  },
  spinner: { fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' },
  progressBar: {
    width: '200px',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    margin: '1rem auto 0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '60%',
    background: 'linear-gradient(90deg, #6c63ff, #a78bfa)',
    borderRadius: '2px',
    animation: 'progress 1.5s ease infinite',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    animation: 'fadeUp 0.5s 0.2s ease both',
  },
  featureCard: {
    background: 'rgba(14,14,20,0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  featureIcon: { fontSize: '1.5rem' },
  featureTitle: { color: '#fff', fontSize: '14px', fontWeight: 700 },
  featureDesc: { color: '#6b7280', fontSize: '13px', lineHeight: 1.5 },
}