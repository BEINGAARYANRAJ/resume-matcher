from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    filename = file.filename
    # Save file info to DB or process it here
    return {
        "message": "Resume uploaded successfully",
        "filename": filename,
        "size": len(contents)
    }