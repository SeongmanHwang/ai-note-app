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
        if request.type == "summary":
            result = {
                "content": f"""
                <h4>요약</h4>
                <p>입력하신 내용에 대한 요약입니다:</p>
                <ul>
                    <li>주요 포인트 1: {request.content[:50]}...</li>
                    <li>주요 포인트 2: 관련된 중요한 정보</li>
                    <li>주요 포인트 3: 추가 고려사항</li>
                </ul>
                <p><strong>결론:</strong> 이 주제에 대해 더 자세히 알아보시려면 관련 자료를 참고하시기 바랍니다.</p>
                """,
                "metadata": {
                    "sources": ["웹 검색 결과 1", "웹 검색 결과 2"],
                    "confidence": 0.85,
                    "prompt": request.prompt,
                }
            }
        elif request.type == "brainstorm":
            result = {
                "content": f"""
                <h4>브레인스토밍 아이디어</h4>
                <p><strong>주제:</strong> {request.content}</p>
                <div class="space-y-2">
                    <div class="bg-blue-50 p-3 rounded">
                        <strong>💡 아이디어 1:</strong> 혁신적인 접근 방식
                    </div>
                    <div class="bg-green-50 p-3 rounded">
                        <strong>🌟 아이디어 2:</strong> 창의적인 해결책
                    </div>
                    <div class="bg-purple-50 p-3 rounded">
                        <strong>🚀 아이디어 3:</strong> 실용적인 구현 방안
                    </div>
                </div>
                <p class="mt-3 text-sm text-gray-600">이 아이디어들을 바탕으로 더 구체적인 계획을 세워보세요!</p>
                """,
                "metadata": {
                    "confidence": 0.8,
                    "prompt": request.prompt,
                }
            }
        elif request.type == "publish":
            result = {
                "content": f"""
                <h4>출판 형식 제안</h4>
                <p>다음과 같은 구조로 정리하면 전문적인 문서가 될 것입니다:</p>
                <ol>
                    <li><strong>제목:</strong> 명확하고 매력적인 제목</li>
                    <li><strong>서론:</strong> 배경 및 목적</li>
                    <li><strong>본문:</strong> 세부 내용을 논리적으로 구성</li>
                    <li><strong>결론:</strong> 요약 및 향후 방향</li>
                </ol>
                <div class="mt-3 p-3 bg-yellow-50 rounded">
                    <strong>💡 팁:</strong> 각 섹션에 적절한 제목을 추가하고, 목록과 인용을 활용하면 가독성이 향상됩니다.
                </div>
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
