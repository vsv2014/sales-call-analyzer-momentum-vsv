import { Configuration, OpenAIApi } from 'openai';
import { TranscriptLine, Speaker } from '../types';

export class OpenAIService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateTranscript(topic: string, duration: number = 5): Promise<TranscriptLine[]> {
    const prompt = `Generate a realistic sales call transcript about ${topic}. 
    The transcript should be ${duration} minutes long and follow this format for each line:
    timestamp speaker(company): text
    Include natural conversation flow, objections, and negotiations.`;

    const response = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const transcriptText = response.data.choices[0].text;
    if (!transcriptText) throw new Error("Failed to generate transcript");

    return this.parseTranscript(transcriptText);
  }

  async summarizeTranscript(transcript: TranscriptLine[]): Promise<string> {
    const transcriptText = transcript.map(line => 
      `${line.timestamp} ${line.speaker.name}(${line.speaker.company}): ${line.text}`
    ).join('\n');

    const response = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Please provide a concise summary of the key points from this sales call transcript:\n${transcriptText}`,
      max_tokens: 200,
      temperature: 0.5,
    });

    return response.data.choices[0].text?.trim() || "No summary generated";
  }

  async answerQuestion(transcript: TranscriptLine[], question: string): Promise<string> {
    const transcriptText = transcript.map(line => 
      `${line.timestamp} ${line.speaker.name}(${line.speaker.company}): ${line.text}`
    ).join('\n');

    const response = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Based on this transcript:\n${transcriptText}\n\nQuestion: ${question}`,
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.data.choices[0].text?.trim() || "Could not answer the question";
  }

  private parseTranscript(text: string): TranscriptLine[] {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const match = line.match(/(\d{2}:\d{2}:\d{2})\s+(\w+)\s*\(([^)]+)\):\s*(.+)/);
      if (!match) throw new Error(`Invalid line format: ${line}`);

      const [, timestamp, name, company, text] = match;
      return {
        timestamp,
        speaker: { name, company },
        text,
      };
    });
  }
}
