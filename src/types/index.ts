export interface Speaker {
  name: string;
  company: string;
}

export interface TranscriptLine {
  timestamp: string;
  speaker: Speaker;
  text: string;
}

export interface Transcript {
  lines: TranscriptLine[];
  metadata: {
    date: string;
    duration: string;
    language?: string;
  };
}
