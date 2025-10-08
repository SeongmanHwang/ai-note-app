'use client';

import { useState } from 'react';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey?: string;
}

export default function APIKeyModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentApiKey 
}: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // API 키 유효성 검사 (간단한 형식 체크)
      if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
        throw new Error('올바른 OpenAI API 키 형식이 아닙니다.');
      }

      console.log('API 키 저장 중:', apiKey.substring(0, 10) + '...');
      onSave(apiKey.trim());
      console.log('API 키 저장 완료');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API 키 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Key className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              OpenAI API 키 설정
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                AI 기능을 사용하려면 OpenAI API 키가 필요합니다. 
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline ml-1"
                >
                  여기서 발급받으세요
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API 키
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-1">💡 참고사항</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• API 키는 브라우저에 안전하게 저장됩니다</li>
                <li>• OpenAI 사용량에 따라 요금이 부과될 수 있습니다</li>
                <li>• API 키는 다른 사이트와 공유하지 마세요</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isValidating || !apiKey.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center space-x-2"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>검증 중...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>저장</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
