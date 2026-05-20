// MatchCard.tsx
import { ScoreCircle } from './ScoreCircle'
import { SkillBadge } from './SkillBadge'
import { GapAnalysis } from './GapAnalysis'

interface Job {
  title: string
  company: string
  url: string
}

interface MatchCardProps {
  job: Job
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  suggestions: string[]
}

function MatchCard({ job, score, matchedSkills, missingSkills, suggestions }: MatchCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{job.title} @ {job.company}</h3>
        <ScoreCircle score={score} /> {/* animated circle */}
      </div>
      <div className="skills-row">
        {matchedSkills.map((s) => <SkillBadge key={s} skill={s} type="match" />)}
        {missingSkills.map((s) => <SkillBadge key={s} skill={s} type="gap" />)}
      </div>
      <GapAnalysis suggestions={suggestions} />
      <a href={job.url} target="_blank">Apply →</a>
    </div>
  )
}

export default MatchCard