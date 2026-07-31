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
