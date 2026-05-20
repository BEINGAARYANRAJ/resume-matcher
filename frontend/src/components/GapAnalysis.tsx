export function GapAnalysis({ suggestions }: { suggestions: string[] }) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div style={{ marginTop: '12px', padding: '10px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a' }}>
      <h4 style={{ margin: '0 0 8px', color: '#92400e' }}>💡 Suggestions to improve your match:</h4>
      <ul style={{ margin: 0, paddingLeft: '18px' }}>
        {suggestions.map((s, i) => (
          <li key={i} style={{ fontSize: '13px', color: '#78350f', marginBottom: '4px' }}>{s}</li>
        ))}
      </ul>
    </div>
  )
}