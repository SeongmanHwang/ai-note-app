from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.ai_memo import AIMemo, AIMemoCreate, AIMemoUpdate, AIRequest, AIResponse
from app.models.ai_memo import AIMemo as AIMemoModel
from app.models.document import Document as DocumentModel
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai-memos", tags=["ai-memos"])

@router.get("/document/{document_id}", response_model=List[AIMemo])
async def get_ai_memos(document_id: int, db: Session = Depends(get_db)):
    """문서의 AI 메모 목록 조회"""
    ai_memos = db.query(AIMemoModel).filter(AIMemoModel.document_id == document_id).all()
    return ai_memos

@router.post("/generate", response_model=AIResponse)
async def generate_ai_memo(request: AIRequest, db: Session = Depends(get_db)):
    """AI 메모 생성"""
    # API 키는 프론트엔드에서 직접 OpenAI API를 호출하도록 변경
    # 백엔드는 데이터베이스 저장만 담당
    try:
        # 목업 응답 생성 (실제 AI 호출은 프론트엔드에서)
        if request.type == "qa":
            result = {
                "content": f"""
                <p><strong>질문:</strong> {request.content}</p>
                <p>이 질문에 대한 답변을 제공하기 위해 정확한 정보를 검토하고 있습니다. 실제 AI 서비스에서는 더 정확하고 상세한 답변을 제공할 수 있습니다.</p>
                <p><em>※ 이는 목업 응답입니다. 실제 API 키를 설정하면 더 정확한 답변을 받을 수 있습니다.</em></p>
                """,
                "metadata": {
                    "confidence": 0.9,
                    "prompt": request.prompt,
                }
            }
        elif request.type == "critical-thinking":
            result = {
                "content": f"""
                <h4>비판적 분석</h4>
                <p><strong>주제:</strong> {request.content}</p>
                <div class="bg-blue-50 p-3 rounded mb-2">
                    <strong>• 객관적 평가:</strong> 주제에 대한 균형잡힌 관점
                </div>
                <div class="bg-green-50 p-3 rounded mb-2">
                    <strong>• 장점:</strong> 긍정적인 측면들
                </div>
                <div class="bg-red-50 p-3 rounded mb-2">
                    <strong>• 단점:</strong> 개선이 필요한 부분들
                </div>
                <div class="bg-yellow-50 p-3 rounded mb-2">
                    <strong>• 개선방안:</strong> 구체적인 제안사항
                </div>
                """,
                "metadata": {
                    "confidence": 0.85,
                    "prompt": request.prompt,
                }
            }
        elif request.type == "summary":
            result = {
                "content": f"""
                <h2>정리된 문서</h2>
                <h3>개요</h3>
                <p>입력하신 내용을 HTML 표준에 맞춰 정리했습니다.</p>
                <h3>주요 내용</h3>
                <ul>
                    <li>핵심 포인트 1</li>
                    <li>핵심 포인트 2</li>
                    <li>핵심 포인트 3</li>
                </ul>
                <p><em>※ 실제 AI 서비스에서는 더 체계적이고 구조화된 정리를 제공합니다.</em></p>
                """,
                "metadata": {
                    "confidence": 0.9,
                    "prompt": request.prompt,
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid AI memo type")
        
        # 임시로 document_id = 1 사용 (실제로는 인증된 사용자의 문서)
        ai_memo_data = AIMemoCreate(
            document_id=1,
            type=request.type,
            content=result["content"],
            memo_metadata=result["metadata"]
        )
        
        db_ai_memo = AIMemoModel(**ai_memo_data.dict())
        db.add(db_ai_memo)
        db.commit()
        db.refresh(db_ai_memo)
        
        return AIResponse(
            success=True,
            data={"memo": db_ai_memo}
        )
        
    except Exception as e:
        return AIResponse(
            success=False,
            error=str(e)
        )

@router.put("/{memo_id}", response_model=AIMemo)
async def update_ai_memo(
    memo_id: int,
    memo_update: AIMemoUpdate,
    db: Session = Depends(get_db)
):
    """AI 메모 업데이트"""
    db_memo = db.query(AIMemoModel).filter(AIMemoModel.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="AI memo not found")
    
    update_data = memo_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_memo, field, value)
    
    db.commit()
    db.refresh(db_memo)
    return db_memo

@router.delete("/{memo_id}")
async def delete_ai_memo(memo_id: int, db: Session = Depends(get_db)):
    """AI 메모 삭제"""
    db_memo = db.query(AIMemoModel).filter(AIMemoModel.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="AI memo not found")
    
    db.delete(db_memo)
    db.commit()
    return {"message": "AI memo deleted successfully"}
