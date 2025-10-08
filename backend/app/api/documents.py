from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.document import Document, DocumentCreate, DocumentUpdate, DocumentWithMemos
from app.models.document import Document as DocumentModel
from app.models.ai_memo import AIMemo

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("/", response_model=List[Document])
async def get_documents(db: Session = Depends(get_db)):
    """문서 목록 조회"""
    documents = db.query(DocumentModel).all()
    return documents

@router.get("/{document_id}", response_model=DocumentWithMemos)
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """특정 문서 조회 (AI 메모 포함)"""
    document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.post("/", response_model=Document)
async def create_document(document: DocumentCreate, db: Session = Depends(get_db)):
    """새 문서 생성"""
    db_document = DocumentModel(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@router.put("/{document_id}", response_model=Document)
async def update_document(
    document_id: int, 
    document_update: DocumentUpdate, 
    db: Session = Depends(get_db)
):
    """문서 업데이트"""
    db_document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    update_data = document_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_document, field, value)
    
    db.commit()
    db.refresh(db_document)
    return db_document

@router.delete("/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    """문서 삭제"""
    db_document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(db_document)
    db.commit()
    return {"message": "Document deleted successfully"}
