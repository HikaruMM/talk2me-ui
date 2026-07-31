import React, { useState, useRef, useEffect } from 'react';
import { DictationSegment } from '../../../core/entities';
import { 
  Play, RotateCcw, ArrowLeft, Mic, 
  Square, Layers, Repeat, FastForward,
  CheckSquare, HelpCircle, Command
} from 'lucide-react';

interface DictationExerciseProps {
  youtubeUrl?: string;
  videoTitle?: string;
  segments: DictationSegment[];
  onComplete?: () => void;
  onFinishDictation?: () => void;
}

export const DictationExercise: React.FC<DictationExerciseProps> = ({
  youtubeUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  videoTitle = 'A Digital Marketing (DMS) Method With Communication',
  segments = [],
  onComplete,
  onFinishDictation,
}) => {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [typedTexts, setTypedTexts] = useState<Record<number, string>>({});
  const [hintsRevealed, setHintsRevealed] = useState<Record<number, number>>({});
  const [submittedStatuses, setSubmittedStatuses] = useState<Record<number, boolean>>({});
  const [playbackSpeed] = useState<0.5 | 0.75 | 1>(1);
  const [level, setLevel] = useState<'steady' | 'natural' | 'fluent'>('natural');
  const [showCaptions, setShowCaptions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentSegment = segments[activeSegmentIndex] || {
    id: '1',
    targetText: 'A Digital Marketing (DMS) Method With Communication',
    startTime: 0,
    endTime: 10,
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeSegmentIndex]);

  const speakSegment = (textToSpeak?: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = textToSpeak || currentSegment.targetText;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackSpeed;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getMaskedSentence = (text: string, revealedCount: number) => {
    const words = text.split(' ');
    return words
      .map((w, idx) => {
        if (idx < revealedCount) return w;
        return '*'.repeat(Math.max(w.length, 3));
      })
      .join(' ');
  };

  const handleRevealWordHint = () => {
    const currentHints = hintsRevealed[activeSegmentIndex] || 0;
    const totalWords = currentSegment.targetText.split(' ').length;
    if (currentHints < totalWords) {
      setHintsRevealed((prev) => ({
        ...prev,
        [activeSegmentIndex]: currentHints + 1,
      }));
    }
  };

  const evaluateWords = () => {
    const typed = (typedTexts[activeSegmentIndex] || '').trim().toLowerCase();
    const targetWords = currentSegment.targetText.split(' ');
    const typedWords = typed.split(/\s+/);

    return targetWords.map((targetW, i) => {
      const cleanTarget = targetW.replace(/[^\w]/g, '').toLowerCase();
      const cleanTyped = (typedWords[i] || '').replace(/[^\w]/g, '').toLowerCase();

      if (!cleanTyped) {
        return { word: targetW, status: 'missing' };
      }
      if (cleanTyped === cleanTarget) {
        return { word: targetW, status: 'correct' };
      }
      return { word: targetW, status: 'incorrect', typed: typedWords[i] };
    });
  };

  const handleNextSegment = () => {
    if (activeSegmentIndex < segments.length - 1) {
      setActiveSegmentIndex((prev) => prev + 1);
    } else {
      if (onComplete) onComplete();
      if (onFinishDictation) onFinishDictation();
    }
  };

  const handlePrevSegment = () => {
    if (activeSegmentIndex > 0) {
      setActiveSegmentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        speakSegment();
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        handleNextSegment();
      } else if (e.key === 'Enter' && !e.shiftKey && e.target === textareaRef.current) {
        e.preventDefault();
        setSubmittedStatuses((prev) => ({ ...prev, [activeSegmentIndex]: true }));
      } else if (e.key === '~' || e.key === '`') {
        e.preventDefault();
        speakSegment();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleRevealWordHint();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setShowCaptions((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSegmentIndex, currentSegment, typedTexts]);

  const completedCount = Object.keys(submittedStatuses).filter(k => submittedStatuses[Number(k)]).length;
  const progressPercent = Math.round((completedCount / segments.length) * 100);

  const getEmbedUrl = (url?: string) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    if (url.includes('embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&enablejsapi=1`;
    }
    return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  };

  const evalResult = submittedStatuses[activeSegmentIndex] ? evaluateWords() : [];

  return (
    <div className="w-full space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CAPTIONS LIST */}
        <div className="lg:col-span-3 space-y-4 bg-white dark:bg-[#1E293B] p-4 rounded-3xl border border-[#E4E8F0] dark:border-[#334155] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E8F0] dark:border-[#334155]">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wider uppercase text-[#1B1F2E] dark:text-white">
                CAPTIONS
              </span>
              <span className="text-emerald-500 font-bold text-xs">~~</span>
            </div>
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className="text-[#5A6478] dark:text-[#94A3B8] hover:text-[#1B1F2E]"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {segments.map((seg, idx) => {
              const isActive = activeSegmentIndex === idx;
              const isSub = !!submittedStatuses[idx];
              const maskedText = getMaskedSentence(seg.targetText, hintsRevealed[idx] || 0);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveSegmentIndex(idx);
                    speakSegment(seg.targetText);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all space-y-1 ${
                    isActive
                      ? 'border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs'
                      : 'border border-[#E4E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isSub ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {showCaptions && isSub ? seg.targetText : maskedText}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#95A0B4] font-semibold pl-5">
                    #{idx + 1} - [{seg.startTime ? `00:00:${seg.startTime.toString().padStart(2, '0')}` : `00:00:${((idx + 1) * 6).toString().padStart(2, '0')}`}]
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E4E8F0] dark:border-[#334155] space-y-2.5">
            <p className="text-xs font-bold text-[#1B1F2E] dark:text-white">
              Sentence too long? Pick your level:
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="level"
                  checked={level === 'steady'}
                  onChange={() => setLevel('steady')}
                  className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-[#1B1F2E] dark:text-white">Steady</span>
                  <p className="text-[10px] text-[#5A6478] dark:text-[#94A3B8]">short phrases, easy to follow</p>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="level"
                  checked={level === 'natural'}
                  onChange={() => setLevel('natural')}
                  className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ Natural</span>
                  <p className="text-[10px] text-[#5A6478] dark:text-[#94A3B8]">natural, conversational pauses</p>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="level"
                  checked={level === 'fluent'}
                  onChange={() => setLevel('fluent')}
                  className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-[#1B1F2E] dark:text-white">Fluent</span>
                  <p className="text-[10px] text-[#5A6478] dark:text-[#94A3B8]">the whole sentence in one breath</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-[11px] font-bold text-[#5A6478] dark:text-[#94A3B8] text-center">
              complete: {progressPercent}% ({completedCount}/{segments.length})
            </p>
          </div>

        </div>

        {/* CENTER COLUMN: VIDEO PLAYER */}
        <div className="lg:col-span-4 space-y-4">
          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-lg relative">
            <iframe
              src={getEmbedUrl(youtubeUrl)}
              title="YouTube Video Player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-sm space-y-2">
            <h2 className="text-base font-extrabold text-[#1B1F2E] dark:text-white leading-snug">
              {videoTitle}
            </h2>
            <p className="text-xs text-[#5A6478] dark:text-[#94A3B8]">
              Be the first one learning dictation from this video
            </p>

            <div className="pt-2 flex items-center justify-between text-xs text-[#5A6478] dark:text-[#94A3B8] border-t border-[#E4E8F0] dark:border-[#334155]">
              <button onClick={() => speakSegment()} className="flex items-center gap-1 hover:text-emerald-500 font-bold">
                <Repeat className="w-3.5 h-3.5" />
                <span>Loop Line</span>
              </button>

              <button className="flex items-center gap-1 hover:text-emerald-500 font-bold">
                <FastForward className="w-3.5 h-3.5" />
                <span>Speed {playbackSpeed}x</span>
              </button>

              <button className="flex items-center gap-1 hover:text-emerald-500 font-bold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Top</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INPUT & HOTKEYS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevSegment}
              disabled={activeSegmentIndex === 0}
              className="p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              title="Previous (Shift + Tab)"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>

            <button
              onClick={() => speakSegment()}
              className="p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Replay Audio (Tab)"
            >
              <RotateCcw className="w-4 h-4 text-emerald-500" />
            </button>

            <button
              onClick={() => speakSegment()}
              className="p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Play / Pause (~)"
            >
              <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            </button>

            <button
              onClick={handleNextSegment}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Skip (Shift + Enter)"
            >
              Skip
            </button>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-sm space-y-3 relative">
            <textarea
              ref={textareaRef}
              rows={4}
              value={typedTexts[activeSegmentIndex] || ''}
              onChange={(e) => setTypedTexts(prev => ({ ...prev, [activeSegmentIndex]: e.target.value }))}
              placeholder="Enter the sentence you hear..."
              className="w-full p-2 bg-transparent text-sm font-medium text-[#1B1F2E] dark:text-white focus:outline-none placeholder-slate-400 resize-none"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-2 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                <Mic className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                Easy
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (!submittedStatuses[activeSegmentIndex] && typedTexts[activeSegmentIndex]?.trim()) {
                setSubmittedStatuses((prev) => ({ ...prev, [activeSegmentIndex]: true }));
              } else {
                handleNextSegment();
              }
            }}
            className="w-full py-3.5 rounded-2xl bg-[#12B76A] hover:bg-[#0e9f5a] text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
          >
            <span>{!submittedStatuses[activeSegmentIndex] && typedTexts[activeSegmentIndex]?.trim() ? 'Check Sentence' : 'Next →'}</span>
          </button>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] text-center font-mono font-bold text-xs text-slate-600 dark:text-slate-300">
            {getMaskedSentence(currentSegment.targetText, hintsRevealed[activeSegmentIndex] || 0)}
          </div>

          {submittedStatuses[activeSegmentIndex] && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] space-y-2">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Step-by-Step Word Accuracy:</p>
              <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                {evalResult.map((res, wIdx) => (
                  <span
                    key={wIdx}
                    className={`px-2 py-0.5 rounded-md ${
                      res.status === 'correct'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : res.status === 'incorrect'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 line-through'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {res.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] space-y-2 text-xs">
            <div className="flex items-center gap-1 text-[#95A0B4] font-bold text-[11px] uppercase tracking-wider">
              <Command className="w-3.5 h-3.5" />
              <span>HOTKEY</span>
            </div>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
              <div className="flex justify-between items-center">
                <span>replay</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">Tab</kbd>
              </div>

              <div className="flex justify-between items-center">
                <span>Previous</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">Shift + Tab</kbd>
              </div>

              <div className="flex justify-between items-center">
                <span>Next</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">Enter</kbd>
              </div>

              <div className="flex justify-between items-center">
                <span>Skip</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">Shift + Enter</kbd>
              </div>

              <div className="flex justify-between items-center">
                <span>Play / Pause</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">~</kbd>
              </div>

              <div className="flex justify-between items-center">
                <span>Toggle captions</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">Ctrl/⌘ + C</kbd>
              </div>

              <div className="flex justify-between items-center">
                <span>Get a hint with words filled in</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">Ctrl/⌘ + E</kbd>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
