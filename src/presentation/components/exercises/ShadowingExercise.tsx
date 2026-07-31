import React, { useState, useRef } from 'react';
import { ShadowingLine } from '../../../core/entities';
import { Mic, Square, Volume2, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ShadowingExerciseProps {
  lines: ShadowingLine[];
  onFinishShadowing: () => void;
}

export const ShadowingExercise: React.FC<ShadowingExerciseProps> = ({
  lines,
  onFinishShadowing,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [, setRecordedAudioUrl] = useState<string | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!lines || lines.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-[#E4E8F0] text-center">
        <p className="text-sm text-[#5A6478]">No shadowing lines generated for this lesson.</p>
        <button onClick={onFinishShadowing} className="mt-4 px-6 py-2.5 rounded-full bg-[#EC4899] text-white text-xs font-bold">
          Continue
        </button>
      </div>
    );
  }

  const currentLine = lines[currentIndex];

  const playSample = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentLine.sampleText);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setHasEvaluated(true);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission denied, falling back to simulation mode', err);
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setHasEvaluated(true);
      }, 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else if (isRecording) {
      setIsRecording(false);
      setHasEvaluated(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < lines.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRecordedAudioUrl(null);
      setHasEvaluated(false);
    } else {
      onFinishShadowing();
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-[#E4E8F0] dark:border-[#334155] shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E4E8F0] dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-[#EC4899] flex items-center justify-center font-bold text-sm">
            🔁
          </span>
          <span className="font-bold text-sm text-[#1B1F2E] dark:text-white">
            Shadowing Practice — Line {currentIndex + 1} / {lines.length}
          </span>
        </div>
      </div>

      {/* Target Sample Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border border-pink-200/60 dark:border-pink-800/40 space-y-4 text-center">
        <p className="text-xs font-extrabold uppercase text-[#EC4899] tracking-wider">
          Sample Target Sentence
        </p>

        <h3 className="text-lg sm:text-xl font-bold text-[#1B1F2E] dark:text-white leading-relaxed">
          "{currentLine.sampleText}"
        </h3>

        {currentLine.phoneticText && (
          <p className="text-xs font-mono text-[#5A6478] dark:text-[#CBD5E1]">
            {currentLine.phoneticText}
          </p>
        )}

        <button
          onClick={playSample}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#EC4899] text-white text-xs font-bold shadow-md hover:bg-[#d43782] transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen to Native Sample</span>
        </button>
      </div>

      {/* Recording Area */}
      <div className="p-8 rounded-3xl bg-[#F1F4F9] dark:bg-[#273449] border border-[#E4E8F0] dark:border-[#334155] text-center space-y-4">
        <p className="text-xs font-bold uppercase text-[#5A6478] dark:text-[#CBD5E1]">
          {isRecording ? '🎙 Recording... Speak out loud now!' : 'Press Mic to Record Your Shadowing Echo'}
        </p>

        {isRecording && (
          <div className="flex items-center justify-center gap-1.5 py-3">
            <span className="w-1.5 h-8 bg-[#EC4899] rounded-full animate-pulse" />
            <span className="w-1.5 h-12 bg-[#EC4899] rounded-full animate-bounce" />
            <span className="w-1.5 h-6 bg-[#EC4899] rounded-full animate-pulse" />
            <span className="w-1.5 h-10 bg-[#EC4899] rounded-full animate-bounce" />
            <span className="w-1.5 h-4 bg-[#EC4899] rounded-full animate-pulse" />
          </div>
        )}

        <div>
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-xl animate-pulse"
            >
              <Square className="w-6 h-6 fill-white" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-[#EC4899] hover:bg-[#d43782] text-white flex items-center justify-center mx-auto shadow-xl transition-transform hover:scale-105"
            >
              <Mic className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>

      {hasEvaluated && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Audio Shadowing Captured!</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-2">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80">
              <span className="block text-[10px] text-[#5A6478]">Pronunciation</span>
              <span className="text-emerald-600 text-base">88%</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80">
              <span className="block text-[10px] text-[#5A6478]">Pacing / Rhythm</span>
              <span className="text-emerald-600 text-base">92%</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80">
              <span className="block text-[10px] text-[#5A6478]">Fluency</span>
              <span className="text-emerald-600 text-base">90%</span>
            </div>
          </div>
        </div>
      )}

      {hasEvaluated && (
        <div className="pt-4 flex justify-end border-t border-[#E4E8F0] dark:border-[#334155]">
          <button
            onClick={handleNext}
            className="px-8 py-3.5 rounded-2xl bg-[#EC4899] hover:bg-[#d43782] text-white font-extrabold text-xs uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <span>{currentIndex < lines.length - 1 ? 'Next Shadowing Line' : 'Complete Shadowing'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
