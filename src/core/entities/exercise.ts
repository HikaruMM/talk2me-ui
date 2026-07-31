export type LearningModeType = 'theory' | 'quiz' | 'dictation' | 'shadowing' | 'writing' | 'speaking';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  timestampSeconds?: number;
}

export interface DictationSegment {
  id: string;
  segmentIndex: number;
  startTime: number; // seconds
  endTime: number; // seconds
  targetText: string;
  translationText?: string;
  hintKeyWords?: string[];
}

export interface ShadowingLine {
  id: string;
  segmentIndex: number;
  startTime: number;
  endTime: number;
  sampleText: string;
  phoneticText?: string;
}

export interface WritingPrompt {
  id: string;
  promptText: string;
  suggestedWordCount: number;
  sampleAnswer?: string;
}

export interface SpeakingPrompt {
  id: string;
  promptText: string;
  sampleRecordingUrl?: string;
  phoneticGuide?: string;
}

export interface WritingEvaluation {
  overallScore: number; // e.g. 7.5 out of 9
  summary: string;
  criteria: {
    taskResponse: { score: number; feedback: string };
    coherenceCohesion: { score: number; feedback: string };
    lexicalResource: { score: number; feedback: string };
    grammaticalAccuracy: { score: number; feedback: string };
  };
  highlightedErrors: Array<{
    originalText: string;
    suggestedText: string;
    errorType: 'grammar' | 'vocabulary' | 'spelling' | 'punctuation';
    explanation: string;
  }>;
  improvedModelAnswer: string;
}

export interface SpeakingEvaluation {
  overallScore: number;
  summary: string;
  criteria: {
    pronunciation: { score: number; feedback: string };
    fluency: { score: number; feedback: string };
    intonation: { score: number; feedback: string };
    grammarLexicon: { score: number; feedback: string };
  };
  mispronouncedWords: Array<{
    word: string;
    userPhonetic: string;
    correctPhonetic: string;
    tip: string;
  }>;
}
