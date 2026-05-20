# ai/job_fetcher.py
import os
import json
import requests
import openai

def fetch_jobs(query: str, location: str = "Remote") -> list:
    url = "https://jsearch.p.rapidapi.com/search"
    headers = {
        "X-RapidAPI-Key": os.getenv("JSEARCH_API_KEY"),
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    params = {"query": f"{query} in {location}", "num_pages": "2"}
    response = requests.get(url, headers=headers, params=params)
    jobs = response.json().get("data", [])
    return [
        {
            "title":       j.get("job_title", ""),
            "company":     j.get("employer_name", ""),
            "description": j.get("job_description", ""),
            "url":         j.get("job_apply_link", ""),
            "location":    j.get("job_city", "Remote")
        }
        for j in jobs
    ]

def extract_job_skills(description: str) -> list:
    prompt = f"""
    From this job description, extract a JSON list of required skills.
    Only return the JSON array, nothing else.
    Description: {description[:2000]}
    """
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)

