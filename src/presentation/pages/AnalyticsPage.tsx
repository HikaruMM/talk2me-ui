import React from 'react';
import { ProgressAnalytics } from '../components/analytics';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1B1F2E] dark:text-white">
          Learning Analytics & Progress
        </h1>
        <p className="text-xs sm:text-sm text-[#5A6478] dark:text-[#CBD5E1] mt-1">
          Track study time, quiz accuracy, and lesson completion streak
        </p>
      </div>

      <ProgressAnalytics />
    </div>
  );
};
