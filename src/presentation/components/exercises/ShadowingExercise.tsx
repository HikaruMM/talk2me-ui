import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShadowingLine, ModeProgress, WordScore } from '../../../core/entities';
import { Mic, Square, Volume2, ArrowRight, RotateCcw, SkipForward, Loader2 } from 'lucide-react';
import { updateProgress } from '../../../infrastructure/api/talk2meApi';
import { CompletedModeGate } from './CompletedModeGate';
import { useYoutubeSegmentPlayer } from '../../hooks/useYoutubeSegmentPlayer';
import { usePronunciationScorer } from '../../hooks/usePronunciationScorer';
import { isModelDownloaded } from '../../../infrastructure/ai/resourceManager';
import { ModelDownloadPromptModal } from './ModelDownloadPromptModal';
import { ScoreGauges } from './ScoreGauges';
import { WordScoreDisplay } from './WordScoreDisplay';
import { PhonemeBreakdown } from './PhonemeBreakdown';

interface ShadowingExerciseProps {
  courseId: string;
  lessonId: string;
  progress?: ModeProgress;
  youtubeVideoId?: string;
  lines: ShadowingLine[];
  onFinishShadowing: () => void;
}

export const ShadowingExercise: React.FC<ShadowingExerciseProps> = ({
  courseId,
  lessonId,
  progress,
  youtubeVideoId,
  lines,
  onFinishShadowing,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { iframeRef, embedUrl, playSegment } = useYoutubeSegmentPlayer(youtubeVideoId);

  const navigate = useNavigate();
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  // Pronunciation scorer
  const { status: scorerStatus, loadProgress, result: scoringResult, scoreAudio, preload, reset: resetScorer } = usePronunciationScorer();

  // Check if AI model is downloaded when component mounts
  useEffect(() => {
    isModelDownloaded().then((downloaded) => {
      if (downloaded) {
        preload();
      } else {
        setIsPromptOpen(true);
      }
    });
  }, [preload]);

  if (progress?.completed && !isRetrying) {
    return (
      <CompletedModeGate
        title="Bạn đã hoàn thành Shadowing này"
        scoreLabel={progress.accuracy != null ? `${Math.round(progress.accuracy)}%` : undefined}
        onRetry={() => setIsRetrying(true)}
        onContinue={onFinishShadowing}
      />
    );
  }

  if (!lines || lines.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-[#E4E8F0] dark:border-[#334155] text-center">
        <p className="text-sm text-[#5A6478]">No shadowing lines generated for this lesson.</p>
        <button onClick={onFinishShadowing} className="mt-4 px-6 py-2.5 rounded-full bg-[#EC4899] text-white text-xs font-bold">
          Continue
        </button>
      </div>
    );
  }

  const currentLine = lines[currentIndex];
  const progressPercent = Math.round((completedLines.size / lines.length) * 100);

  const playSample = () => playSegment(currentLine.startTime, currentLine.endTime);

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

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        setCompletedLines((prev) => new Set(prev).add(currentIndex));

        // Score pronunciation
        await scoreAudio(audioBlob, currentLine.sampleText);
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
        setCompletedLines((prev) => new Set(prev).add(currentIndex));
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
      setCompletedLines((prev) => new Set(prev).add(currentIndex));
    }
  };

  const goToLine = (idx: number) => {
    setCurrentIndex(idx);
    setRecordedBlob(null);
    setHasEvaluated(false);
    setIsRecording(false);
    setSelectedWord(null);
    resetScorer();
  };

  const handleNext = () => {
    if (currentIndex < lines.length - 1) {
      goToLine(currentIndex + 1);
    } else {
      const finalScore = scoringResult?.overallScore ?? 90;
      updateProgress(courseId, lessonId, 'shadowing', true, finalScore).catch((err) =>
        console.warn('Không lưu được tiến độ Shadowing:', err)
      );
      onFinishShadowing();
    }
  };

  const handleRetryLine = () => {
    setRecordedBlob(null);
    setHasEvaluated(false);
    setIsRecording(false);
    setSelectedWord(null);
    resetScorer();
  };

  const handleWordClick = (wordId: string) => {
    setSelectedWord(selectedWord === wordId ? null : wordId);
  };

  // Find the selected WordScore
  const selectedWordScore: WordScore | null = (() => {
    if (!selectedWord || !scoringResult) return null;
    const idx = parseInt(selectedWord.split('-').pop() || '0', 10);
    return scoringResult.wordAnalysis[idx] ?? null;
  })();

  /* ── Waveform bars ── */
  const waveformBars = Array.from({ length: 24 }, (_, i) => {
    const heights = [14, 22, 10, 28, 16, 32, 12, 26, 18, 30, 8, 24, 20, 34, 14, 28, 10, 22, 16, 36, 12, 26, 20, 30];
    return heights[i % heights.length];
  });

  const isScoring = scorerStatus === 'scoring' || scorerStatus === 'loading-model';

  return (
    <div className="w-full space-y-5">

      {/* ── Model loading banner ── */}
      {scorerStatus === 'loading-model' && loadProgress < 100 && !isRecording && (
        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <div className="flex-1">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
              Loading AI model... {loadProgress}%
            </p>
            <div className="mt-1 h-1.5 rounded-full bg-blue-200 dark:bg-blue-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Main 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── LEFT: Video ── */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          {embedUrl && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-lg">
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title="YouTube Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* ── RIGHT: Main practice area ── */}
        <div className="lg:col-span-7 space-y-5">

          {/* ① HERO: Recording area */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
            isRecording
              ? 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-pink-300 dark:border-pink-700 shadow-lg shadow-pink-500/10'
              : isScoring
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-300 dark:border-blue-700'
              : hasEvaluated
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-white dark:bg-[#1E293B] border-[#E4E8F0] dark:border-[#334155]'
          }`}>

            {/* Current sentence */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest">
                  Line {currentIndex + 1} / {lines.length}
                </span>
              </div>

              {/* Word-level color display (when scored) or plain text */}
              {scoringResult && hasEvaluated ? (
                <div className="mt-2 mb-2">
                  <WordScoreDisplay
                    wordAnalysis={scoringResult.wordAnalysis}
                    selectedWord={selectedWord}
                    onWordClick={handleWordClick}
                  />
                </div>
              ) : (
                <h3 className="text-lg sm:text-xl font-bold text-[#1B1F2E] dark:text-white leading-relaxed px-2">
                  "{currentLine.sampleText}"
                </h3>
              )}

              {currentLine.phoneticText && (
                <p className="text-xs font-mono text-[#5A6478] dark:text-[#CBD5E1] tracking-wide mt-1.5">
                  {currentLine.phoneticText}
                </p>
              )}
            </div>

            {/* Waveform visualizer */}
            <div className="flex items-end justify-center gap-[3px] h-10 mb-4">
              {waveformBars.map((h, i) => (
                <div
                  key={i}
                  className={`w-[3px] rounded-full transition-all duration-200 ${
                    isRecording
                      ? 'bg-pink-400 dark:bg-pink-500'
                      : isScoring
                      ? 'bg-blue-400 dark:bg-blue-500'
                      : hasEvaluated
                      ? 'bg-emerald-300 dark:bg-emerald-700'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  style={{
                    height: isRecording ? `${h + Math.random() * 8}px`
                      : isScoring ? `${h * 0.6 + Math.sin(Date.now() / 200 + i) * 4}px`
                      : `${h * 0.4}px`,
                    opacity: isRecording ? 0.6 + Math.random() * 0.4 : isScoring ? 0.5 : 0.4,
                    animationDelay: `${i * 50}ms`,
                    ...(isRecording ? { animation: `pulse 0.6s ease-in-out ${i * 50}ms infinite alternate` } : {}),
                  }}
                />
              ))}
            </div>

            <p className="text-center text-xs font-bold uppercase tracking-wider mb-5 text-[#5A6478] dark:text-[#94A3B8]">
              {isRecording
                ? '🎙 Recording... Speak out loud!'
                : isScoring
                ? '🧠 Analyzing pronunciation...'
                : hasEvaluated
                ? '✅ Analysis complete — tap a word for details'
                : 'Tap the microphone to start recording'}
            </p>

            {/* Mic button + actions */}
            <div className="flex items-center justify-center gap-4">
              {hasEvaluated ? (
                <>
                  <button
                    onClick={handleRetryLine}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-[#E4E8F0] dark:border-[#334155] text-xs font-bold text-[#5A6478] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-record</span>
                  </button>
                  <button
                    onClick={playSample}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-[#E4E8F0] dark:border-[#334155] text-xs font-bold text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Compare</span>
                  </button>
                </>
              ) : isRecording ? (
                <button
                  onClick={stopRecording}
                  className="rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-xl shadow-red-500/30 animate-pulse hover:scale-105 transition-transform"
                  style={{ width: 72, height: 72 }}
                >
                  <Square className="w-7 h-7 fill-white" />
                </button>
              ) : isScoring ? (
                <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30"
                  style={{ width: 72, height: 72 }}
                >
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={playSample}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/60 text-pink-600 dark:text-pink-300 text-xs font-bold hover:bg-pink-100 dark:hover:bg-pink-950/60 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen First</span>
                  </button>
                  <button
                    onClick={startRecording}
                    className="rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-xl shadow-pink-500/30 hover:scale-105 hover:shadow-2xl transition-all"
                    style={{ width: 72, height: 72 }}
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <div className="w-[104px]" /> {/* Spacer to center mic */}
                </div>
              )}
            </div>
          </div>

          {/* ② Score gauges (after scoring) */}
          {hasEvaluated && scoringResult && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  <span>📊</span>
                  <span>Pronunciation Analysis</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {scoringResult.inferenceTimeMs}ms
                </span>
              </div>

              <ScoreGauges
                overallScore={scoringResult.overallScore}
                pronunciationScore={scoringResult.pronunciationScore}
                fluencyScore={scoringResult.fluencyScore}
              />
            </div>
          )}

          {/* ③ Phoneme breakdown (when a word is selected) */}
          {selectedWordScore && (
            <PhonemeBreakdown
              wordScore={selectedWordScore}
              onClose={() => setSelectedWord(null)}
            />
          )}

          {/* ④ Bottom navigation */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={() => {
                if (currentIndex > 0) goToLine(currentIndex - 1);
              }}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] text-xs font-bold text-[#5A6478] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              {!hasEvaluated && !isScoring && (
                <button
                  onClick={() => {
                    setCompletedLines((prev) => new Set(prev).add(currentIndex));
                    handleNext();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] text-xs font-bold text-[#5A6478] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Skip</span>
                </button>
              )}

              {hasEvaluated && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wide shadow-lg shadow-pink-500/20 transition-all hover:shadow-xl"
                >
                  <span>{currentIndex < lines.length - 1 ? 'Next Line' : 'Complete Shadowing'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
      {/* Model Download Prompt Modal */}
      <ModelDownloadPromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        onGoToSettings={() => {
          navigate('/settings#resources');
          setTimeout(() => {
            const el = document.getElementById('resource-manager-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
      />
    </div>
  );
};
