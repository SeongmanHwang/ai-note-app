import { useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'openai_api_key';

export function useAPIKey() {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // API 키 로드
  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    console.log('저장된 API 키:', storedApiKey ? `${storedApiKey.substring(0, 10)}...` : '없음');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    setIsLoaded(true);
  }, []);

  // API 키 저장
  const saveAPIKey = (newApiKey: string) => {
    console.log('API 키 저장:', `${newApiKey.substring(0, 10)}...`);
    localStorage.setItem(API_KEY_STORAGE_KEY, newApiKey);
    setApiKey(newApiKey);
  };

  // API 키 삭제
  const deleteAPIKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey('');
  };

  // API 키 유효성 검사
  const isValidAPIKey = (key: string): boolean => {
    return key.startsWith('sk-') && key.length >= 20;
  };

  const hasValidAPIKey = apiKey && isValidAPIKey(apiKey);

  return {
    apiKey,
    isLoaded,
    hasValidAPIKey,
    saveAPIKey,
    deleteAPIKey,
    isValidAPIKey,
  };
}
