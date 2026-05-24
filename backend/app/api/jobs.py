from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.resume import Resume
import os, json, httpx
from groq import Groq

router = APIRouter()
client_ai = Groq(api_key=os.getenv("GROQ_API_KEY"))

def fetch_jobs(query: str) -> list:
    try:
        headers = {
            "X-RapidAPI-Key": os.getenv("JSEARCH_API_KEY"),
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }
        params = {"query": query, "num_pages": "1", "date_posted": "month"}
        response = httpx.get(
            "https://jsearch.p.rapidapi.com/search",
            headers=headers, params=params, timeout=10
        )
        jobs = response.json().get("data", [])
        return [{
            "title": j.get("job_title", ""),
            "company": j.get("employer_name", ""),
            "location": j.get("job_city") or "Remote",
            "description": j.get("job_description", "")[:1000],
            "source_url": j.get("job_apply_link", ""),
            "salary_min": j.get("job_min_salary"),
            "salary_max": j.get("job_max_salary"),
        } for j in jobs[:10]]
    except Exception as e:
        print(f"Job fetch failed: {e}")
        return []

def extract_job_skills(description: str) -> list:
    try:
        prompt = f"""Extract required technical skills from this job description.
Return ONLY a JSON array with no markdown, no backticks, no extra text.
Example: ["Python", "React", "AWS", "Docker"]

Job description:
{description[:1500]}"""
        response = client_ai.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=200
        )
        text = response.choices[0].message.content.strip()
        start = text.find('[')
        end = text.rfind(']') + 1
        if start == -1 or end == 0:
            return []
        return json.loads(text[start:end])
    except Exception as e:
        print(f"Skill extraction failed: {e}")
        return []

def calculate_score(resume_skills: list, job_skills: list) -> float:
    if not resume_skills or not job_skills:
        return 0.0
    resume_lower = {s.lower() for s in resume_skills}
    matched = sum(1 for s in job_skills if s.lower() in resume_lower or
                  any(s.lower() in r or r in s.lower() for r in resume_lower))
    return round((matched / len(job_skills)) * 100, 1)

def get_gaps(resume_skills: list, job_skills: list) -> dict:
    resume_lower = {s.lower() for s in resume_skills}
    matched = [s for s in job_skills if s.lower() in resume_lower or
               any(s.lower() in r or r in s.lower() for r in resume_lower)]
    missing = [s for s in job_skills if s not in matched]
    return {"matched": matched, "missing": missing}

def ai_suggestions(job_title: str, missing: list, score: float) -> dict:
    if not missing:
        return {"verdict": "Strong Match", "suggestions": [], "quick_win": "Apply now!"}
    try:
        prompt = f"""You are a career coach. A candidate is applying for: {job_title}
Missing skills: {missing[:5]}
Match score: {score}%

Return ONLY valid JSON with no markdown, no backticks:
{{"verdict": "Strong Match", "suggestions": ["tip1", "tip2", "tip3"], "quick_win": "fastest improvement action"}}"""
        response = client_ai.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=300
        )
        text = response.choices[0].message.content.strip()
        start = text.find('{')
        end = text.rfind('}') + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON in response")
        return json.loads(text[start:end])
    except Exception as e:
        print(f"AI suggestions failed: {e}")
        return {
            "verdict": "Good Match",
            "suggestions": [f"Learn {s}" for s in missing[:3]],
            "quick_win": f"Start with {missing[0] if missing else 'key skills'}"
        }

@router.get("/match/{resume_id}")
def match_jobs(
    resume_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, detail="Resume not found")

    skills = resume.parsed_skills or []
    print(f"Resume skills: {skills}")

    query = " ".join(skills[:3]) + " developer" if skills else "software developer"
    jobs = fetch_jobs(query)

    if not jobs:
        jobs = [
            {"title": "Software Engineer", "company": "Google", "location": "Remote",
             "description": "Python React SQL AWS Docker experience needed", "source_url": "https://careers.google.com"},
            {"title": "Full Stack Developer", "company": "Microsoft", "location": "Hyderabad",
             "description": "JavaScript React Node.js TypeScript REST APIs", "source_url": "https://careers.microsoft.com"},
            {"title": "Backend Engineer", "company": "Amazon", "location": "Remote",
             "description": "Python FastAPI Docker Kubernetes AWS microservices", "source_url": "https://amazon.jobs"},
        ]

    results = []
    for job in jobs:
        job_skills = extract_job_skills(job["description"])
        print(f"Job: {job['title']} | Skills: {job_skills}")
        score = calculate_score(skills, job_skills)
        gaps = get_gaps(skills, job_skills)
        analysis = ai_suggestions(job["title"], gaps["missing"], score)
        results.append({
            "job": job,
            "score": score,
            "matched_skills": gaps["matched"],
            "missing_skills": gaps["missing"],
            "ai_analysis": analysis
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"matches": results, "total": len(results)}