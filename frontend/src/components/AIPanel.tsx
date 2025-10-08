'use client';

import { useState } from 'react';
import { AIMemo, AIRequest } from '@/types';
import { Brain, FileText, Lightbulb, Loader2, Plus, X, Key, AlertCircle } from 'lucide-react';
import { useAPIKey } from '@/hooks/useAPIKey';
import APIKeyModal from './APIKeyModal';

interface AIPanelProps {
  memos: AIMemo[];
  onGenerateMemo: (request: AIRequest) => Promise<void>;
  onDeleteMemo: (memoId: string) => void;
  isLoading: boolean;
}

export default function AIPanel({ 
  memos, 
  onGenerateMemo, 
  onDeleteMemo, 
  isLoading 
}: AIPanelProps) {
  const [selectedType, setSelectedType] = useState<'qa' | 'critical-thinking' | 'summary'>('qa');
  const [customPrompt, setCustomPrompt] = useState('');
  const [context, setContext] = useState('');
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  
  const { apiKey, hasValidAPIKey, saveAPIKey } = useAPIKey();

  const handleGenerate = async () => {
    if (!context.trim()) return;

    if (!hasValidAPIKey) {
      setShowAPIKeyModal(true);
      return;
    }

    await onGenerateMemo({
      type: selectedType,
      content: context,
      prompt: customPrompt || undefined,
    });

    setContext('');
    setCustomPrompt('');
  };

  const getMemoIcon = (type: string) => {
    switch (type) {
      case 'qa': return <Brain className="w-4 h-4" />;
      case 'critical-thinking': return <Lightbulb className="w-4 h-4" />;
      case 'summary': return <FileText className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getMemoTitle = (type: string) => {
    switch (type) {
      case 'qa': return '질의응답';
      case 'critical-thinking': return '비판 및 창의적 사고';
      case 'summary': return '요약 및 정리';
      default: return 'AI 메모';
    }
  };

  return (
    <div className="ai-panel h-full flex flex-col">
      {/* AI 기능 선택 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">AI 도우미</h3>
          <div className="flex items-center space-x-2">
            {hasValidAPIKey ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Key className="w-4 h-4" />
                <span className="text-xs">API 키 설정됨</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">API 키 필요</span>
              </div>
            )}
            <button
              onClick={() => setShowAPIKeyModal(true)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
            >
              {hasValidAPIKey ? '수정' : '설정'}
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기능 선택
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedType('qa')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedType === 'qa'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>질의응답</span>
              </button>
              <button
                onClick={() => setSelectedType('critical-thinking')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedType === 'critical-thinking'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>비판적 사고</span>
              </button>
              <button
                onClick={() => setSelectedType('summary')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedType === 'summary'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>요약정리</span>
              </button>
            </div>
          </div>

          {/* 컨텍스트 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedType === 'qa' 
                ? '질문' 
                : selectedType === 'critical-thinking'
                ? '분석할 주제'
                : '정리할 내용'
              }
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={selectedType === 'qa' 
                ? '궁금한 질문을 입력하세요...' 
                : selectedType === 'critical-thinking'
                ? '비판적으로 분석하고 싶은 주제나 질문을 입력하세요...'
                : '정리하고 싶은 내용을 입력하세요...'
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* 커스텀 프롬프트 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedType === 'qa' 
                ? '추가 지시사항 (선택사항)' 
                : selectedType === 'critical-thinking'
                ? '분석 관점 (선택사항)'
                : '정리 방향 (선택사항)'
              }
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={selectedType === 'qa' 
                ? '예: 간단하게, 자세하게, 전문적인 톤으로 등...'
                : selectedType === 'critical-thinking'
                ? '예: 경제적 관점에서, 사회적 관점에서, 기술적 관점에서 등...'
                : '예: 간단하게, 자세하게, 논리적 순서로 등...'
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !context.trim()}
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>
              {isLoading ? '생성 중...' : `${getMemoTitle(selectedType)} 생성`}
            </span>
          </button>
        </div>
      </div>

      {/* AI 메모 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {memos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>AI가 생성한 메모가 여기에 표시됩니다.</p>
              <p className="text-sm mt-1">위에서 기능을 선택하고 내용을 입력해보세요.</p>
            </div>
          ) : (
            memos.map((memo) => (
              <div key={memo.id} className="ai-memo-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getMemoIcon(memo.type)}
                    <h4 className="font-semibold text-gray-800">
                      {getMemoTitle(memo.type)}
                    </h4>
                  </div>
                  <button
                    onClick={() => onDeleteMemo(memo.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div 
                  className="text-sm text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: memo.content }}
                />
                
                {memo.memo_metadata?.sources && memo.memo_metadata.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">출처:</p>
                    <div className="flex flex-wrap gap-1">
                      {memo.memo_metadata.sources.map((source, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-400">
                  {new Date(memo.createdAt).toLocaleString('ko-KR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* API 키 설정 모달 */}
      <APIKeyModal
        isOpen={showAPIKeyModal}
        onClose={() => setShowAPIKeyModal(false)}
        onSave={saveAPIKey}
        currentApiKey={apiKey}
      />
    </div>
  );
}
