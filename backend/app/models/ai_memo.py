from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AIMemo(Base):
    __tablename__ = "ai_memos"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    type = Column(String, nullable=False)  # 'summary', 'brainstorm', 'publish'
    content = Column(Text, nullable=False)
    anchor_position = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    memo_metadata = Column(JSON, nullable=True)  # sources, confidence, prompt 등
    
    # Relationships
    document = relationship("Document", back_populates="ai_memos")
