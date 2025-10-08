import openai
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from app.core.config import settings
import json

class AIService:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)
    
    async def generate_summary(self, content: str, custom_prompt: str = "") -> Dict[str, Any]:
        """정보 요약 기능"""
        try:
            # 웹 검색을 통한 추가 정보 수집
            search_results = await self._search_web(content)
            
            # OpenAI를 통한 요약 생성
            prompt = f"""
다음 내용을 요약하고, 관련 정보를 추가해주세요:

내용: {content}

{f"추가 지시사항: {custom_prompt}" if custom_prompt else ""}

웹 검색 결과:
{search_results}

요약을 HTML 형식으로 작성해주세요. 주요 포인트는 <li> 태그로, 제목은 <h4> 태그로 감싸주세요.
출처가 있는 경우 <strong>출처:</strong> 라고 표시해주세요.
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "당신은 전문적인 문서 요약 AI입니다. 한국어로 명확하고 정확한 요약을 제공합니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            summary_content = response.choices[0].message.content
            
            return {
                "content": summary_content,
                "metadata": {
                    "sources": self._extract_sources(search_results),
                    "confidence": 0.85,
                    "prompt": custom_prompt
                }
            }
            
        except Exception as e:
            # API 키가 없는 경우 목업 응답 반환
            return self._generate_mock_summary(content, custom_prompt)
    
    async def generate_brainstorm(self, topic: str, custom_prompt: str = "") -> Dict[str, Any]:
        """브레인스토밍 기능"""
        try:
            prompt = f"""
다음 주제에 대해 창의적이고 혁신적인 아이디어를 제안해주세요:

주제: {topic}

{f"추가 지시사항: {custom_prompt}" if custom_prompt else ""}

다양한 관점에서 3-5개의 구체적인 아이디어를 제안하고, 각 아이디어에 대해 간단한 설명을 추가해주세요.
HTML 형식으로 작성하며, 아이디어는 <div class="bg-blue-50 p-3 rounded"> 형태로 감싸주세요.
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "당신은 창의적인 브레인스토밍 AI입니다. 혁신적이고 실용적인 아이디어를 제안합니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1200,
                temperature=0.7
            )
            
            brainstorm_content = response.choices[0].message.content
            
            return {
                "content": brainstorm_content,
                "metadata": {
                    "confidence": 0.8,
                    "prompt": custom_prompt
                }
            }
            
        except Exception as e:
            return self._generate_mock_brainstorm(topic, custom_prompt)
    
    async def generate_publish_format(self, content: str, custom_prompt: str = "") -> Dict[str, Any]:
        """출판 형식 변환 기능"""
        try:
            prompt = f"""
다음 내용을 전문적인 출판물 형태로 다듬어주세요:

내용: {content}

{f"추가 지시사항: {custom_prompt}" if custom_prompt else ""}

출판물에 적합한 구조와 형식을 제안하고, 가독성을 높이는 방법을 포함해주세요.
HTML 형식으로 작성하며, 제안사항은 <ol> 또는 <ul> 태그로 정리해주세요.
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "당신은 전문적인 편집자 AI입니다. 출판물에 적합한 형식과 구조를 제안합니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.4
            )
            
            publish_content = response.choices[0].message.content
            
            return {
                "content": publish_content,
                "metadata": {
                    "confidence": 0.9,
                    "prompt": custom_prompt
                }
            }
            
        except Exception as e:
            return self._generate_mock_publish(content, custom_prompt)
    
    async def _search_web(self, query: str) -> str:
        """웹 검색 (시뮬레이션)"""
        # 실제로는 Google Search API, Bing Search API 등을 사용
        # 현재는 목업 데이터 반환
        return f"'{query}'에 대한 웹 검색 결과 시뮬레이션"
    
    def _extract_sources(self, search_results: str) -> List[str]:
        """검색 결과에서 출처 추출"""
        # 실제로는 검색 결과 파싱
        return ["웹 검색 결과 1", "웹 검색 결과 2"]
    
    def _generate_mock_summary(self, content: str, custom_prompt: str) -> Dict[str, Any]:
        """목업 요약 생성"""
        return {
            "content": f"""
            <h4>요약</h4>
            <p>입력하신 내용에 대한 요약입니다:</p>
            <ul>
                <li>주요 포인트 1: {content[:50]}...</li>
                <li>주요 포인트 2: 관련된 중요한 정보</li>
                <li>주요 포인트 3: 추가 고려사항</li>
            </ul>
            <p><strong>결론:</strong> 이 주제에 대해 더 자세히 알아보시려면 관련 자료를 참고하시기 바랍니다.</p>
            <p><strong>출처:</strong> 웹 검색 결과 1, 웹 검색 결과 2</p>
            """,
            "metadata": {
                "sources": ["웹 검색 결과 1", "웹 검색 결과 2"],
                "confidence": 0.85,
                "prompt": custom_prompt
            }
        }
    
    def _generate_mock_brainstorm(self, topic: str, custom_prompt: str) -> Dict[str, Any]:
        """목업 브레인스토밍 생성"""
        return {
            "content": f"""
            <h4>브레인스토밍 아이디어</h4>
            <p><strong>주제:</strong> {topic}</p>
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
                "prompt": custom_prompt
            }
        }
    
    def _generate_mock_publish(self, content: str, custom_prompt: str) -> Dict[str, Any]:
        """목업 출판 형식 생성"""
        return {
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
                "prompt": custom_prompt
            }
        }
