from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.resume import Resume
import os, json
from groq import Groq
from pdfminer.high_level import extract_text as extract_pdf
import docx as python_docx

router = APIRouter()
client_ai = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_text(file_path: str, ext: str) -> str:
    if ext == ".pdf":
        return extract_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        doc = python_docx.Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    return ""

def parse_with_gpt(raw_text: str) -> dict:
    prompt = f"""Extract information from this resume and return ONLY valid JSON:
{{
  "skills": ["skill1", "skill2"],
  "experience": [{{"title": "Job Title", "company": "Company", "duration": "2020-2022"}}],
  "education": [{{"degree": "B.Tech", "institution": "University", "year": "2020"}}],
  "summary": "Professional summary in 2 sentences"
}}
Resume:
{raw_text[:4000]}"""

    response = client_ai.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )
    return json.loads(response.choices[0].message.content)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(400, detail="Only PDF and DOCX allowed")

    os.makedirs("uploads", exist_ok=True)
    save_path = f"uploads/{user_id}_{file.filename}"
    with open(save_path, "wb") as f:
        f.write(await file.read())

    raw_text = extract_text(save_path, ext)

    try:
        parsed = parse_with_gpt(raw_text)
    except Exception as e:
        print(f"GPT parsing failed: {e}")
        parsed = {"skills": [], "experience": [], "education": [], "summary": ""}

    resume = Resume(
        user_id=user_id,
        filename=file.filename,
        raw_text=raw_text,
        parsed_skills=parsed.get("skills", []),
        parsed_experience=parsed.get("experience", []),
        parsed_education=parsed.get("education", []),
        summary=parsed.get("summary", "")
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume uploaded successfully",
        "resume_id": resume.id,
        "filename": file.filename,
        "skills": parsed.get("skills", []),
        "summary": parsed.get("summary", "")
    }