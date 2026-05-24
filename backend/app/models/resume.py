from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String)
    raw_text = Column(Text)
    parsed_skills = Column(JSON)
    parsed_experience = Column(JSON)
    parsed_education = Column(JSON)
    summary = Column(Text)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())