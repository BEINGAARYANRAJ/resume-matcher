export function ScoreCircle({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {/* Background circle */}
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      {/* Animated score circle */}
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke="#6366f1"
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      {/* Score text */}
      <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#111">
        {score}%
      </text>
    </svg>
  )
}