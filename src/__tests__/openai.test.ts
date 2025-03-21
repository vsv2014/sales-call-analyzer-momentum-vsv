import { OpenAIService } from '../services/openai';
import { TranscriptLine } from '../types';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: `00:00:00 John(acme.com): Hello there\n00:00:05 Jane(example.com): Hi John`
            }
          }]
        })
      }
    }
  }));
});

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    service = new OpenAIService();
  });

  it('should generate a transcript', async () => {
    const transcript = await service.generateTranscript('test topic');
    expect(transcript).toHaveLength(2);
    expect(transcript[0].speaker.name).toBe('John');
    expect(transcript[0].speaker.company).toBe('acme.com');
  });

  it('should summarize a transcript', async () => {
    const mockTranscript: TranscriptLine[] = [{
      timestamp: '00:00:00',
      speaker: { name: 'John', company: 'acme.com' },
      text: 'Hello there'
    }];

    const summary = await service.summarizeTranscript(mockTranscript);
    expect(summary).toBeTruthy();
  });

  it('should answer questions about a transcript', async () => {
    const mockTranscript: TranscriptLine[] = [{
      timestamp: '00:00:00',
      speaker: { name: 'John', company: 'acme.com' },
      text: 'Hello there'
    }];

    const answer = await service.answerQuestion(mockTranscript, 'Who spoke first?');
    expect(answer).toBeTruthy();
  });
});
