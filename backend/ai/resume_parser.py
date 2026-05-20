# ai/resume_parser.py
# ── ALL imports at the top ──
import os
import json
import openai
import numpy as np
# pyrefly: ignore [missing-import]
from pdfminer.high_level import extract_text
# pyrefly: ignore [missing-import]
import docx
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
# pyrefly: ignore [missing-import]
from pinecone import Pinecone

# ── Initialize once ──
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_resume_text(file_path: str, file_type: str) -> str:
    if file_type == "pdf":
        return extract_text(file_path)
    elif file_type == "docx":
        doc = docx.Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])

def parse_resume_with_ai(raw_text: str) -> dict:
    prompt = f"""
    Extract structured information from this resume.
    Return ONLY valid JSON with these keys:
    - name, email, phone
    - skills: [list of technical/soft skills]
    - experience: [{{"title", "company", "duration", "description"}}]
    - education: [{{"degree", "institution", "year"}}]
    - summary: one-paragraph professional summary

    Resume text:
    {raw_text[:4000]}
    """
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    return json.loads(response.choices[0].message.content)

def embed_and_store(resume_id: str, skills_text: str):
    embedding = model.encode(skills_text).tolist()
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index = pc.Index("resume-matcher")
    index.upsert([(resume_id, embedding)])
    return embedding

def calculate_match_score(resume_skills: list, job_skills: list) -> float:
    resume_text = ", ".join(resume_skills)
    job_text    = ", ".join(job_skills)
    resume_vec  = model.encode([resume_text])
    job_vec     = model.encode([job_text])
    score = cosine_similarity(resume_vec, job_vec)[0][0]
    return round(float(score) * 100, 1)

def generate_gap_analysis(resume_skills, job_skills, job_title) -> dict:
    matched = [s for s in job_skills if s.lower() in
               [r.lower() for r in resume_skills]]
    missing = [s for s in job_skills if s not in matched]
    prompt = f"""
    A candidate is applying for: {job_title}
    They have these skills: {resume_skills}
    They are missing: {missing}

    Return as JSON with keys: suggestions (list), time_estimates (list), verdict (string)
    """
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    result = json.loads(response.choices[0].message.content)
    result["matched_skills"] = matched
    result["missing_skills"] = missing
    return result