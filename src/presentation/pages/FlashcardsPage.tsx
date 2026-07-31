import React from 'react';
import { FlashcardDeck } from '../components/flashcards';

export const FlashcardsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <FlashcardDeck />
    </div>
  );
};
