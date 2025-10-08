from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class AIMemoBase(BaseModel):
    type: str  # 'qa', 'critical-thinking', 'summary'
    content: str
    anchor_position: Optional[int] = None

class AIMemoCreate(AIMemoBase):
    document_id: int
    memo_metadata: Optional[Dict[str, Any]] = None

class AIMemoUpdate(BaseModel):
    content: Optional[str] = None
    memo_metadata: Optional[Dict[str, Any]] = None

class AIMemo(AIMemoBase):
    id: int
    document_id: int
    created_at: datetime
    memo_metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class AIRequest(BaseModel):
    type: str  # 'qa', 'critical-thinking', 'summary'
    content: str
    context: Optional[str] = None
    prompt: Optional[str] = None

class AIResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
