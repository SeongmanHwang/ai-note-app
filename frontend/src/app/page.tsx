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
        
        if (request.type === 'qa') {
          result = await openaiService.generateQA(request.content, request.prompt || '');
        } else if (request.type === 'critical-thinking') {
          result = await openaiService.generateCriticalThinking(request.content, request.prompt || '');
        } else if (request.type === 'summary') {
          result = await openaiService.generateSummary(request.content, request.prompt || '');
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
      case 'qa':
        return `
          <p><strong>질문:</strong> ${request.content}</p>
          <p>이 질문에 대한 답변을 제공하기 위해 정확한 정보를 검토하고 있습니다. 실제 AI 서비스에서는 더 정확하고 상세한 답변을 제공할 수 있습니다.</p>
          <p><em>※ 이는 목업 응답입니다. 실제 API 키를 설정하면 더 정확한 답변을 받을 수 있습니다.</em></p>
        `;
      
      case 'critical-thinking':
        return `
          <h4>비판적 분석</h4>
          <p><strong>주제:</strong> ${request.content}</p>
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
        `;
      
      case 'summary':
        return `
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
