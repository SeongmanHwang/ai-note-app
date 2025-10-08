'use client';

import { useState, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Link from '@tiptap/extension-link';
import { EditorContent } from '@tiptap/react';
import { AIMemo, AIRequest, EditorState } from '@/types';
import { apiClient } from '@/lib/api';
import { OpenAIService } from '@/lib/openai';
import { useAPIKey } from '@/hooks/useAPIKey';
import Toolbar from '@/components/Toolbar';
import AIPanel from '@/components/AIPanel';

export default function Home() {
  const [documentTitle, setDocumentTitle] = useState('새 문서');
  const [aiMemos, setAiMemos] = useState<AIMemo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<{ from: number; to: number } | null>(null);
  
  const { apiKey, hasValidAPIKey } = useAPIKey();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '여기에 내용을 작성하세요...',
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      ListItem,
      BulletList,
      OrderedList,
      Blockquote,
      CodeBlock,
      HorizontalRule,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-800 underline',
        },
      }),
    ],
    content: '<p>안녕하세요! AI 노트 앱에 오신 것을 환영합니다.</p><p>좌측에서 문서를 작성하고, 우측에서 AI의 도움을 받아보세요.</p>',
    onSelectionUpdate: ({ editor }) => {
      const selection = editor.state.selection.empty 
        ? null 
        : { from: editor.state.selection.from, to: editor.state.selection.to };
      setCurrentSelection(selection);
    },
    editorProps: {
      attributes: {
        class: 'editor-content min-h-screen p-6 focus:outline-none',
      },
    },
  });

  const handleGenerateMemo = useCallback(async (request: AIRequest) => {
    if (!editor) return;

    setIsLoading(true);
    
    // 디버깅을 위한 로그
    console.log('API 키 상태:', { 
      hasValidAPIKey, 
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : '없음',
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyValid: apiKey && apiKey.startsWith('sk-') && apiKey.length >= 20
    });
    
    try {
      let result: { content: string; metadata: any };

      if (hasValidAPIKey && apiKey) {
        console.log('실제 OpenAI API 호출 시작...');
        // 실제 OpenAI API 호출
        const openaiService = new OpenAIService(apiKey);
        
        if (request.type === 'summary') {
          result = await openaiService.generateSummary(request.content, request.prompt || '');
        } else if (request.type === 'brainstorm') {
          result = await openaiService.generateBrainstorm(request.content, request.prompt || '');
        } else if (request.type === 'publish') {
          result = await openaiService.generatePublishFormat(request.content, request.prompt || '');
        } else {
          throw new Error('지원하지 않는 AI 메모 타입입니다.');
        }
        console.log('OpenAI API 응답 받음:', result);
      } else {
        console.log('목업 응답 사용...');
        // API 키가 없으면 목업 응답
        result = {
          content: generateMockResponse(request),
          metadata: {
            sources: request.type === 'summary' ? ['웹 검색 결과 1', '웹 검색 결과 2'] : undefined,
            confidence: 0.85,
            prompt: request.prompt,
          }
        };
        
        // 목업 응답은 2초 지연
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const newMemo: AIMemo = {
        id: Date.now().toString(),
        documentId: 'current-document',
        type: request.type,
        content: result.content,
        anchorPosition: currentSelection?.from,
        createdAt: new Date(),
        memo_metadata: result.metadata,
      };
      
      setAiMemos(prev => [newMemo, ...prev]);
      
    } catch (error) {
      console.error('AI 메모 생성 실패:', error);
      alert(`AI 메모 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editor, currentSelection, hasValidAPIKey, apiKey]);

  const handleDeleteMemo = useCallback((memoId: string) => {
    setAiMemos(prev => prev.filter(memo => memo.id !== memoId));
  }, []);

  const generateMockResponse = (request: AIRequest): string => {
    switch (request.type) {
      case 'summary':
        return `
          <h4>요약</h4>
          <p>입력하신 내용에 대한 요약입니다:</p>
          <ul>
            <li>주요 포인트 1: ${request.content.slice(0, 50)}...</li>
            <li>주요 포인트 2: 관련된 중요한 정보</li>
            <li>주요 포인트 3: 추가 고려사항</li>
          </ul>
          <p><strong>결론:</strong> 이 주제에 대해 더 자세히 알아보시려면 관련 자료를 참고하시기 바랍니다.</p>
        `;
      
      case 'brainstorm':
        return `
          <h4>브레인스토밍 아이디어</h4>
          <p><strong>주제:</strong> ${request.content}</p>
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
        `;
      
      case 'publish':
        return `
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
        `;
      
      default:
        return '<p>AI 응답을 생성했습니다.</p>';
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">에디터를 로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="split-screen">
      {/* 에디터 패널 */}
      <div className="editor-panel">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="text-xl font-bold bg-transparent border-none outline-none w-full"
            placeholder="문서 제목을 입력하세요..."
          />
        </div>

        {/* 툴바 */}
        <Toolbar editor={editor} />

        {/* 에디터 */}
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* AI 패널 */}
      <div className="ai-panel">
        <AIPanel
          memos={aiMemos}
          onGenerateMemo={handleGenerateMemo}
          onDeleteMemo={handleDeleteMemo}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
