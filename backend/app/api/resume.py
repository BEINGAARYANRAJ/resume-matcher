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
    prompt = f"""Extract information from this resume. Return ONLY valid JSON with no markdown, no backticks, no extra text before or after.
Format exactly like this:
{{"skills": ["Python", "React"], "experience": [{{"title": "Engineer", "company": "Google", "duration": "2021-2023"}}], "education": [{{"degree": "B.Tech", "institution": "IIT", "year": "2021"}}], "summary": "Experienced developer with 2 years experience."}}

Resume text:
{raw_text[:4000]}"""

    response = client_ai.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1000
    )
    text = response.choices[0].message.content.strip()
    start = text.find('{')
    end = text.rfind('}') + 1
    if start == -1 or end == 0:
        raise ValueError("No JSON found in response")
    return json.loads(text[start:end])

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
    print(f"Extracted text length: {len(raw_text)}")

    try:
        parsed = parse_with_gpt(raw_text)
        print(f"Parsed skills: {parsed.get('skills', [])}")
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