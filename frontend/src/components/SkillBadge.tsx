export function SkillBadge({ skill, type }: { skill: string; type: 'match' | 'gap' }) {
  const styles = {
    match: { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
    gap:   { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }
  }

  return (
    <span style={{
      ...styles[type],
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
      margin: '2px'
    }}>
      {type === 'match' ? '✅' : '❌'} {skill}
    </span>
  )
}