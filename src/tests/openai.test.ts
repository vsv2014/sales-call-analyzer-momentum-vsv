import { OpenAIService } from '../services/openai';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { CreateCompletionResponse } from 'openai';

// Mock the OpenAI API
jest.mock('openai', () => {
  const mockContent = `00:00:00 Sarah(techsales.io): Hi there! Let me tell you about our solution.
00:00:15 John(client.com): Thanks, what makes it unique?
00:00:30 Sarah(techsales.io): We offer great features and support.`;

  const mockResponse: CreateCompletionResponse = {
    id: 'test-id',
    object: 'text_completion',
    created: Date.now(),
    model: 'text-davinci-003',
    choices: [{
      text: mockContent,
      index: 0,
      logprobs: null,
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  };

  return {
    Configuration: jest.fn(),
    OpenAIApi: jest.fn().mockImplementation(() => ({
      createCompletion: jest.fn().mockImplementation(() => Promise.resolve({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: { headers: { 'content-type': 'application/json' } }
      }))
    }))
  };
});

describe('OpenAIService', () => {
  let service: OpenAIService;
  const defaultTimeout = 15000; // 15 seconds for all tests

  beforeEach(() => {
    // Reset environment and mocks
    process.env.OPENAI_API_KEY = 'test-key';
    jest.clearAllMocks();
    service = new OpenAIService();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('generateTranscript', () => {
    it('should generate a transcript with proper format', async () => {
      const transcript = await service.generateTranscript('test topic', 1);
      
      expect(transcript).toHaveLength(3);
      expect(transcript[0]).toMatchObject({
        timestamp: expect.stringMatching(/^\d{2}:\d{2}:\d{2}$/),
        speaker: {
          name: expect.any(String),
          company: expect.any(String)
        },
        text: expect.any(String)
      });
    }, defaultTimeout);

    it('should throw error without API key', async () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => new OpenAIService()).toThrow('OPENAI_API_KEY environment variable is required');
    });

    it('should handle API errors gracefully', async () => {
      const openai = service['openai'];
      jest.spyOn(openai, 'createCompletion')
        .mockRejectedValue(new Error('API Error'));

      await expect(service.generateTranscript('test topic', 1))
        .rejects
        .toThrow('Failed after 3 retries');
    }, defaultTimeout);
  });

  describe('summarizeTranscript', () => {
    it('should summarize a transcript', async () => {
      const transcript = [
        {
          timestamp: '00:00:00',
          speaker: { name: 'Sarah', company: 'techsales.io' },
          text: 'Hi there!'
        }
      ];

      const summary = await service.summarizeTranscript(transcript);
      expect(summary).toBeTruthy();
    }, defaultTimeout);

    it('should handle empty response', async () => {
      const emptyResponse: CreateCompletionResponse = {
        id: 'test-id',
        object: 'text_completion',
        created: Date.now(),
        model: 'text-davinci-003',
        choices: [],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };

      // Override the default mock for this test
      const openai = service['openai'];
      jest.spyOn(openai, 'createCompletion')
        .mockImplementation(() => Promise.resolve({
          data: emptyResponse,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          config: { headers: { 'content-type': 'application/json' } }
        }));

      const transcript = [{ timestamp: '00:00:00', speaker: { name: 'Sarah', company: 'techsales.io' }, text: 'Hi' }];
      await expect(service.summarizeTranscript(transcript))
        .rejects
        .toThrow('No summary received from OpenAI');
    }, defaultTimeout);
  });

  describe('answerQuestion', () => {
    it('should answer questions about the transcript', async () => {
      const transcript = [
        {
          timestamp: '00:00:00',
          speaker: { name: 'Sarah', company: 'techsales.io' },
          text: 'Hi there!'
        }
      ];

      const answer = await service.answerQuestion(transcript, 'Who spoke first?');
      expect(answer).toBeTruthy();
    }, defaultTimeout);

    it('should handle empty response', async () => {
      const emptyResponse: CreateCompletionResponse = {
        id: 'test-id',
        object: 'text_completion',
        created: Date.now(),
        model: 'text-davinci-003',
        choices: [],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };

      // Override the default mock for this test
      const openai = service['openai'];
      jest.spyOn(openai, 'createCompletion')
        .mockImplementation(() => Promise.resolve({
          data: emptyResponse,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          config: { headers: { 'content-type': 'application/json' } }
        }));

      const transcript = [{ timestamp: '00:00:00', speaker: { name: 'Sarah', company: 'techsales.io' }, text: 'Hi' }];
      await expect(service.answerQuestion(transcript, 'Who spoke?'))
        .rejects
        .toThrow('No answer received from OpenAI');
    }, defaultTimeout);
  });
});
