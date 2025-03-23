import { MockService } from '../services/mock';
import { describe, it, expect } from '@jest/globals';

describe('MockService', () => {
  let service: MockService;

  beforeEach(() => {
    service = new MockService();
  });

  describe('generateTranscript', () => {
    it('should generate correct number of lines based on duration', async () => {
      const transcript = await service.generateTranscript('CRM', 1);
      expect(transcript.length).toBe(5); // 5 lines per minute
    });

    it('should generate at least 2 lines for short durations', async () => {
      const transcript = await service.generateTranscript('CRM', 0.1);
      expect(transcript.length).toBe(2);
    });

    it('should generate transcript in Spanish', async () => {
      service.setLanguage('es');
      const transcript = await service.generateTranscript('CRM', 1);
      expect(transcript[0].text).toContain('¡Hola!');
    });

    it('should generate transcript in French', async () => {
      service.setLanguage('fr');
      const transcript = await service.generateTranscript('CRM', 1);
      expect(transcript[0].text).toContain('Bonjour!');
    });

    it('should throw error for unsupported language', () => {
      expect(() => service.setLanguage('de')).toThrow('Language de not supported');
    });
  });

  describe('summarizeTranscript', () => {
    it('should generate summary based on transcript length', async () => {
      const transcript = await service.generateTranscript('CRM', 1);
      const summary = await service.summarizeTranscript(transcript);
      expect(summary).toContain('Key points from the call');
      expect(summary).toContain('Introduction of the product/service');
    });

    it('should generate summary in Spanish', async () => {
      service.setLanguage('es');
      const transcript = await service.generateTranscript('CRM', 1);
      const summary = await service.summarizeTranscript(transcript);
      expect(summary).toContain('Puntos clave de la llamada');
    });
  });

  describe('answerQuestion', () => {
    it('should answer questions about features when present', async () => {
      const transcript = await service.generateTranscript('CRM', 1);
      const answer = await service.answerQuestion(transcript, 'What features are available?');
      expect(answer).toContain('advanced features');
    });

    it('should indicate when topic not discussed', async () => {
      const transcript = await service.generateTranscript('CRM', 0.1);
      const answer = await service.answerQuestion(transcript, 'What about support?');
      expect(answer).toContain('not discussed');
    });

    it('should answer questions in French', async () => {
      service.setLanguage('fr');
      const transcript = await service.generateTranscript('CRM', 1);
      const answer = await service.answerQuestion(transcript, 'What about support?');
      expect(answer).toContain('service client 24/7');
    });
  });
});
