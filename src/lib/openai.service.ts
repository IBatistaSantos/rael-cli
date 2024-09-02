import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

export interface CreatePromptParams {
  prompt: string;
  maxTokens?: number;
}

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_TOKEN');

    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async createPrompt(params: CreatePromptParams): Promise<string> {
    try {
      const response = await this.client.completions.create({
        model: 'davinci-002',
        prompt: params.prompt,
        max_tokens: params.maxTokens || 60,
      });

      const generatedText = response.choices[0].text.trim();
      return generatedText;
    } catch (error) {
      console.error('Error generating prompt with OpenAI:', error.message);
      throw new Error('Failed to generate prompt');
    }
  }
}
