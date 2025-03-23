import { Configuration, OpenAIApi } from 'openai';
import { TranscriptLine } from '../types';
import chalk from 'chalk';

export class OpenAIService {
  private openai: OpenAIApi;
  private maxRetries: number = 3;
  private baseDelay: number = 2000; // 2 seconds

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for OpenAI service');
    }
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  private async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retryCount >= this.maxRetries) {
        throw new Error(`Failed after ${this.maxRetries} retries. Last error: ${error.message}`);
      }

      const delay = this.baseDelay * Math.pow(2, retryCount);
      console.log(chalk.yellow(`Rate limited, waiting ${delay/1000} seconds before retry ${retryCount + 1}/${this.maxRetries}`));
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithExponentialBackoff(operation, retryCount + 1);
    }
  }

  async generateTranscript(topic: string, duration: number): Promise<TranscriptLine[]> {
    const prompt = `Generate a realistic sales call transcript about ${topic}. 
    The transcript should be ${duration} minutes long.
    Format each line as a timestamp followed by speaker name, company in parentheses, and their message.
    Make it a natural conversation between a sales representative and a potential customer.
    Include discussion of features, pricing, and support options.`;

    return this.retryWithExponentialBackoff(async () => {
      const response = await this.openai.createCompletion({
        model: 'gpt-3.5-turbo',
        prompt,
        temperature: 0.7,
        max_tokens: Math.min(2000, duration * 200), // Scale tokens with duration
      });

      const content = response.data.choices[0]?.text;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return this.parseTranscript(content);
    });
  }

  async summarizeTranscript(transcript: TranscriptLine[]): Promise<string> {
    const transcriptText = transcript
      .map(line => `${line.timestamp} ${line.speaker.name}(${line.speaker.company}): ${line.text}`)
      .join('\n');

    const prompt = `Summarize the key points from this sales call transcript:\n${transcriptText}`;

    return this.retryWithExponentialBackoff(async () => {
      const response = await this.openai.createCompletion({
        model: 'gpt-3.5-turbo',
        prompt,
        temperature: 0.3,
        max_tokens: 500,
      });

      const summary = response.data.choices[0]?.text;
      if (!summary) {
        throw new Error('No summary received from OpenAI');
      }

      return summary;
    });
  }

  async answerQuestion(transcript: TranscriptLine[], question: string): Promise<string> {
    const transcriptText = transcript
      .map(line => `${line.timestamp} ${line.speaker.name}(${line.speaker.company}): ${line.text}`)
      .join('\n');

    const prompt = `Based on this sales call transcript:\n${transcriptText}\n\nAnswer this question: ${question}`;

    return this.retryWithExponentialBackoff(async () => {
      const response = await this.openai.createCompletion({
        model: 'gpt-3.5-turbo',
        prompt,
        temperature: 0.3,
        max_tokens: 200,
      });

      const answer = response.data.choices[0]?.text;
      if (!answer) {
        throw new Error('No answer received from OpenAI');
      }

      return answer;
    });
  }

  private parseTranscript(content: string): TranscriptLine[] {
    const lines = content.split('\n').filter(line => line.trim());
    const transcript: TranscriptLine[] = [];

    for (const line of lines) {
      const match = line.match(/(\d{2}:\d{2}:\d{2})\s+(\w+)\s*\(([^)]+)\):\s*(.+)/);
      if (match) {
        const [_, timestamp, name, company, text] = match;
        transcript.push({
          timestamp,
          speaker: { name, company },
          text: text.trim()
        });
      }
    }

    if (transcript.length === 0) {
      throw new Error('Failed to parse transcript from OpenAI response');
    }

    return transcript;
  }
}
