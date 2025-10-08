export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateQA(question: string, customPrompt: string = ''): Promise<{ content: string; metadata: any }> {
    const prompt = `
다음 질문에 대해 정확하고 도움이 되는 답변을 제공해주세요:

질문: ${question}

${customPrompt ? `추가 지시사항: ${customPrompt}` : ''}

답변 요구사항:
1. 한 문단으로 간결하게 답변해주세요
2. 사실에 기반한 정확한 정보만 제공해주세요
3. 확실하지 않은 내용은 추측하지 말고 "정확한 정보를 확인할 수 없습니다"라고 명시해주세요
4. HTML 형식으로 작성해주세요 (<p> 태그 사용)
5. 답변 후 "이 답변이 정확한지 다시 한번 검토해주세요"라고 요청하세요
`;

    const response = await this.callOpenAI([
      { role: 'system', content: '당신은 정확하고 신뢰할 수 있는 질의응답 AI입니다. 사실에 기반한 정확한 정보만 제공하고, 추측이나 불확실한 내용은 피합니다.' },
      { role: 'user', content: prompt }
    ]);

    return {
      content: response,
      metadata: {
        confidence: 0.9,
        prompt: customPrompt
      }
    };
  }

  async generateCriticalThinking(topic: string, customPrompt: string = ''): Promise<{ content: string; metadata: any }> {
    const prompt = `
다음 주제에 대해 비판적이고 창의적인 관점에서 분석하고 평가해주세요:

주제/질문: ${topic}

${customPrompt ? `추가 지시사항: ${customPrompt}` : ''}

분석 요구사항:
1. 먼저 주제에 대한 객관적인 평가를 내려주세요
2. 장점과 단점을 균형있게 분석해주세요
3. 개선점이나 대안을 제시해주세요
4. 개조식으로 정리해주세요 (• 또는 번호 사용)
5. HTML 형식으로 작성해주세요
6. 각 항목은 <div class="bg-blue-50 p-3 rounded mb-2"> 형태로 감싸주세요
`;

    const response = await this.callOpenAI([
      { role: 'system', content: '당신은 비판적 사고와 창의적 분석을 전문으로 하는 AI입니다. 객관적이고 균형잡힌 관점에서 주제를 분석하고 개선방안을 제시합니다.' },
      { role: 'user', content: prompt }
    ]);

    return {
      content: response,
      metadata: {
        confidence: 0.85,
        prompt: customPrompt
      }
    };
  }

  async generateSummary(content: string, customPrompt: string = ''): Promise<{ content: string; metadata: any }> {
    const prompt = `
다음 내용을 HTML 표준 양식에 맞춰 깔끔하게 정리해주세요:

내용: ${content}

${customPrompt ? `추가 지시사항: ${customPrompt}` : ''}

정리 요구사항:
1. HTML 표준 태그를 사용하여 구조화해주세요
2. 제목은 <h1>, <h2>, <h3> 태그로 계층 구조를 만들어주세요
3. 문단은 <p> 태그로 구분해주세요
4. 목록은 <ul>, <ol>, <li> 태그를 사용해주세요
5. 강조는 <strong>, <em> 태그를 사용해주세요
6. 전체적으로 깔끔하고 읽기 쉬운 형태로 정리해주세요
7. 불필요한 내용은 제거하고 핵심 내용만 남겨주세요
`;

    const response = await this.callOpenAI([
      { role: 'system', content: '당신은 전문적인 문서 편집자 AI입니다. 내용을 HTML 표준에 맞춰 깔끔하고 구조화된 형태로 정리합니다.' },
      { role: 'user', content: prompt }
    ]);

    return {
      content: response,
      metadata: {
        confidence: 0.9,
        prompt: customPrompt
      }
    };
  }

  private async callOpenAI(messages: OpenAIMessage[]): Promise<string> {
    try {
      console.log('OpenAI API 호출 중...', {
        model: 'gpt-3.5-turbo',
        messagesCount: messages.length,
        apiKeyPrefix: this.apiKey.substring(0, 10) + '...'
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      console.log('OpenAI API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API 오류 응답:', errorData);
        throw new Error(errorData.error?.message || `OpenAI API 오류: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      console.log('OpenAI API 성공 응답:', data);
      return data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
    } catch (error) {
      console.error('OpenAI API 호출 오류:', error);
      throw error;
    }
  }
}
