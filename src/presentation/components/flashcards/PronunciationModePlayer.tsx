import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  Square, 
  Volume2, 
  PlayCircle, 
  RotateCcw, 
  ArrowRight, 
  Award, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Maximize2,
  Minimize2,
  VolumeX
} from 'lucide-react';
import { FlashcardSet, Flashcard, ShadowingResult } from '../../../core/entities';
import { usePronunciationScorer } from '../../hooks/usePronunciationScorer';
import { ScoreGauges } from '../exercises/ScoreGauges';
import { WordScoreDisplay } from '../exercises/WordScoreDisplay';

interface PronunciationModePlayerProps {
  set: FlashcardSet;
  onFinish: () => void;
}

export const PronunciationModePlayer: React.FC<PronunciationModePlayerProps> = ({ set, onFinish }) => {
  const cards = set.cards;
  const totalCount = cards.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentCard = cards[currentIndex] || cards[0];

  // AI Pronunciation Scorer Hook
  const { 
    status: scorerStatus, 
    loadProgress, 
    result: scoringResult, 
    error: scorerError, 
    scoreAudio, 
    reset: resetScorer 
  } = usePronunciationScorer();

  // Create & revoke object URL for user audio recording
  useEffect(() => {
    if (!recordedBlob) {
      setRecordedAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(recordedBlob);
    setRecordedAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [recordedBlob]);

  // Speak native audio
  const speakNative = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Play user recorded audio
  const playUserAudio = () => {
    if (!recordedAudioUrl) return;
    recordedAudioRef.current?.pause();
    const audio = new Audio(recordedAudioUrl);
    recordedAudioRef.current = audio;
    audio.play().catch((err) => console.warn('Không thể phát lại bản thu:', err));
  };

  // Reset state when switching cards
  const handleSelectCard = (index: number) => {
    if (index < 0 || index >= totalCount) return;
    setIsRecording(false);
    setRecordedBlob(null);
    setRecognizedText('');
    setHasEvaluated(false);
    resetScorer();
    setCurrentIndex(index);
  };

  // Run scoring pipeline
  const runScoring = async (blob: Blob) => {
    setRecordedBlob(blob);
    setHasEvaluated(true);

    const result = await scoreAudio(blob, currentCard.frontText);
    if (result && result.overallScore >= 70) {
      setMasteredCount((prev) => Math.min(totalCount, prev + 1));
    }
  };

  // Start Mic Recording
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
        stream.getTracks().forEach((track) => track.stop());
        await runScoring(audioBlob);
      };

      // Optional Browser Speech Recognition for instant recognized transcript
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = 'en-US';
          rec.continuous = false;
          rec.interimResults = false;
          rec.onresult = (e: any) => {
            const transcript = e.results[0]?.[0]?.transcript || '';
            setRecognizedText(transcript);
          };
          recognitionRef.current = rec;
          rec.start();
        } catch {
          // Fallback gracefully
        }
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setHasEvaluated(false);
      resetScorer();
    } catch (err) {
      alert('Không thể kết nối Microphone. Vui lòng cho phép truy cập mic trong trình duyệt!');
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const isScoring = scorerStatus === 'scoring' || scorerStatus === 'loading-model';
  const progressPercent = Math.min(100, Math.round((masteredCount / totalCount) * 100));

  return (
    <div className={`max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 ${
      isFullscreen
        ? 'fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#0F172A] p-4 sm:p-6 overflow-y-auto flex flex-col justify-start items-center max-w-none'
        : ''
    }`}>
      <div className={`w-full ${isFullscreen ? 'max-w-3xl space-y-4 pt-2 pb-6' : 'space-y-6'}`}>
        
        {/* 1. TOP CONTROL BAR */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
              🎙️ Luyện Phát Âm AI
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Đã phát âm chuẩn: <strong className="text-emerald-600 font-extrabold">{masteredCount} / {totalCount} từ</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              Từ {currentIndex + 1} / {totalCount}
            </span>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* AI Model Loading Progress Bar */}
        {scorerStatus === 'loading-model' && loadProgress < 100 && !isRecording && (
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                Đang tải mô hình AI phân tích giọng nói... {loadProgress}%
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

        {/* 2. MAIN PRONUNCIATION CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E293B] text-[#1B1F2E] dark:text-white border border-[#E4E8F0] dark:border-[#334155] shadow-xl space-y-6 relative overflow-hidden text-center">
          
          {/* Native Pronunciation & Word Display */}
          <div className="space-y-4 py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold">
              <span>Nghĩa: {currentCard.backText}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl font-black text-[#1B1F2E] dark:text-white tracking-tight leading-snug break-words">
                {currentCard.frontText}
              </h2>
              {currentCard.phonetic && (
                <p className="text-lg font-mono text-[#2E68FF] font-bold">
                  /{currentCard.phonetic.replace(/^\/|\/$/g, '')}/
                </p>
              )}
            </div>

            {/* Native Speaker Playback Button */}
            <button
              type="button"
              onClick={() => speakNative(currentCard.frontText)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-xs font-bold transition-all hover:scale-105"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe giọng bản xứ chuẩn</span>
            </button>
          </div>

          {/* Recording & Mic Button Area */}
          <div className="py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isRecording
                ? '🎙️ Đang ghi âm... Hãy phát âm rõ từ trên!'
                : isScoring
                ? '🧠 AI đang phân tích âm thanh & chấm điểm phát âm...'
                : hasEvaluated && scoringResult
                ? '✅ Phân tích hoàn tất — xem điểm & phát âm lại nếu muốn'
                : 'Nhấn nút Micro bên dưới để bắt đầu ghi âm phát âm'}
            </p>

            {/* Waveform graphic when recording */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-8 my-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.floor(Math.random() * 24) + 8}px`,
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Mic Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse transition-transform active:scale-95"
                  title="Dừng ghi âm"
                >
                  <Square className="w-6 h-6 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isScoring}
                  onClick={startRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                    isScoring
                      ? 'bg-slate-300 dark:bg-slate-800 opacity-50 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 hover:scale-105'
                  }`}
                  title="Bắt đầu ghi âm"
                >
                  {isScoring ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </button>
              )}

              {/* User Audio Playback Button */}
              {recordedAudioUrl && !isRecording && (
                <button
                  type="button"
                  onClick={playUserAudio}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition-colors"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Nghe lại bản thu</span>
                </button>
              )}
            </div>
          </div>

          {/* AI SCORING EVALUATION RESULT PANEL */}
          {hasEvaluated && scoringResult && (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#0F172A] border border-[#E4E8F0] dark:border-[#334155] space-y-5 text-left animate-in fade-in duration-300">
              
              {/* Score Gauges */}
              <ScoreGauges
                overallScore={scoringResult.overallScore}
                pronunciationScore={scoringResult.pronunciationScore}
                fluencyScore={scoringResult.fluencyScore}
              />

              {/* Recognized Speech Text */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Hệ thống AI nghe được bạn phát âm:
                </p>
                <p className="text-sm font-mono text-[#1B1F2E] dark:text-slate-200 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 border border-slate-200 dark:border-slate-700">
                  "{scoringResult.recognizedTranscript || recognizedText || currentCard.frontText}"
                </p>
              </div>

              {/* Word & Phoneme Detailed Analysis */}
              {scoringResult.wordAnalysis && scoringResult.wordAnalysis.length > 0 && (
                <WordScoreDisplay
                  wordAnalysis={scoringResult.wordAnalysis}
                  selectedWord={selectedWord}
                  onWordClick={(w) => setSelectedWord(w === selectedWord ? null : w)}
                />
              )}
            </div>
          )}

          {/* Error fallback */}
          {hasEvaluated && scorerError && !scoringResult && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Chấm điểm AI tạm thời không phản hồi ({scorerError}). Bạn vẫn có thể luyện tập tiếp!</span>
            </div>
          )}

        </div>

        {/* 3. BOTTOM CARD NAVIGATION CONTROLS */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => handleSelectCard(currentIndex - 1)}
            className="px-5 py-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Từ trước đó
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentIndex < totalCount - 1) {
                handleSelectCard(currentIndex + 1);
              } else {
                onFinish();
              }
            }}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all"
          >
            <span>{currentIndex < totalCount - 1 ? 'Từ tiếp theo' : 'Hoàn thành bài tập'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
