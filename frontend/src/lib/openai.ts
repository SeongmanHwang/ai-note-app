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

  async generateSummary(content: string, customPrompt: string = ''): Promise<{ content: string; metadata: any }> {
    const prompt = `
다음 내용을 요약하고, 관련 정보를 추가해주세요:

내용: ${content}

${customPrompt ? `추가 지시사항: ${customPrompt}` : ''}

요약을 HTML 형식으로 작성해주세요. 주요 포인트는 <li> 태그로, 제목은 <h4> 태그로 감싸주세요.
출처가 있는 경우 <strong>출처:</strong> 라고 표시해주세요.
`;

    const response = await this.callOpenAI([
      { role: 'system', content: '당신은 전문적인 문서 요약 AI입니다. 한국어로 명확하고 정확한 요약을 제공합니다.' },
      { role: 'user', content: prompt }
    ]);

    return {
      content: response,
      metadata: {
        sources: ['웹 검색 결과 1', '웹 검색 결과 2'],
        confidence: 0.85,
        prompt: customPrompt
      }
    };
  }

  async generateBrainstorm(topic: string, customPrompt: string = ''): Promise<{ content: string; metadata: any }> {
    const prompt = `
다음 주제에 대해 창의적이고 혁신적인 아이디어를 제안해주세요:

주제: ${topic}

${customPrompt ? `추가 지시사항: ${customPrompt}` : ''}

다양한 관점에서 3-5개의 구체적인 아이디어를 제안하고, 각 아이디어에 대해 간단한 설명을 추가해주세요.
HTML 형식으로 작성하며, 아이디어는 <div class="bg-blue-50 p-3 rounded"> 형태로 감싸주세요.
`;

    const response = await this.callOpenAI([
      { role: 'system', content: '당신은 창의적인 브레인스토밍 AI입니다. 혁신적이고 실용적인 아이디어를 제안합니다.' },
      { role: 'user', content: prompt }
    ]);

    return {
      content: response,
      metadata: {
        confidence: 0.8,
        prompt: customPrompt
      }
    };
  }

  async generatePublishFormat(content: string, customPrompt: string = ''): Promise<{ content: string; metadata: any }> {
    const prompt = `
다음 내용을 전문적인 출판물 형태로 다듬어주세요:

내용: ${content}

${customPrompt ? `추가 지시사항: ${customPrompt}` : ''}

출판물에 적합한 구조와 형식을 제안하고, 가독성을 높이는 방법을 포함해주세요.
HTML 형식으로 작성하며, 제안사항은 <ol> 또는 <ul> 태그로 정리해주세요.
`;

    const response = await this.callOpenAI([
      { role: 'system', content: '당신은 전문적인 편집자 AI입니다. 출판물에 적합한 형식과 구조를 제안합니다.' },
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
