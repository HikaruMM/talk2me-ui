export type LearningModeType = 'theory' | 'quiz' | 'dictation' | 'shadowing' | 'writing' | 'speaking';

export interface Category {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

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

export interface Lesson {
  id: string;
  lessonIndex: number;
  title: string;
  durationMinutes: number;
  videoStartTime: string; // e.g. "0:00"
  videoEndTime: string;   // e.g. "8:50"
  startSeconds: number;
  endSeconds: number;
  theoryContent: string;
  keyTakeaways: string[];
  quizQuestions: QuizQuestion[];
  dictationSegments: DictationSegment[];
  shadowingLines: ShadowingLine[];
  writingPrompt?: WritingPrompt;
  speakingPrompt?: SpeakingPrompt;
  availableModes: LearningModeType[];
  completedModes: LearningModeType[];
}

export interface Course {
  id: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnailUrl: string;
  channelName: string;
  durationText: string;
  totalLessons: number;
  rating: number;
  reviewsCount: number;
  badgeLabel?: 'Best Seller' | 'Popular' | 'New' | 'Top Rated' | 'Featured';
  price: number; // 0 = Free
  originalPrice?: number;
  isCustomGenerated?: boolean;
  creationStatus?: 'completed' | 'processing' | 'failed';
  progressPercent: number;
  lessons: Lesson[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  setId?: string;
  courseId?: string;
  lessonId?: string;
  frontText: string; // THUẬT NGỮ (Term)
  backText: string;  // ĐỊNH NGHĨA (Definition)
  phonetic?: string;
  exampleSentence?: string;
  imageUrl?: string;
  nextReviewDate?: string; // ISO date
  intervalDays?: number;
  easeFactor?: number;
  repetitions?: number;
  status?: 'new' | 'learning' | 'mastered';
  isStarred?: boolean;
}

export interface FlashcardSet {
  id: string;
  folderId?: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  cardsCount?: number;
  cards: Flashcard[];
}

export interface FlashcardFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  setIds: string[];
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

export interface UserProgressStats {
  streakDays: number;
  weeklyMinutes: number;
  totalLessonsCompleted: number;
  averageAccuracy: number;
  cardsMastered: number;
  totalCardsToReview: number;
}
