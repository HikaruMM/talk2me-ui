import { getStoredConfig } from './openrouter';
import type { Course, WritingEvaluation, SpeakingEvaluation } from '../../core/entities';

const API_BASE = 'http://localhost:8000/api/v1';
const JWT_STORAGE_KEY = 'talk2me_jwt_token';

interface LLMConfigPayload {
  apiKey: string;
  models: {
    defaultModel: string;
    courseGenerator: string;
    quizGenerator: string;
    writingGrader: string;
  };
  outputLanguage: string;
}

/**
 * Builds the llm_config payload sent on every generation/grading request from the
 * user's client-side OpenRouter settings.
 */
export function buildLlmConfig(): LLMConfigPayload {
  const config = getStoredConfig();
  return {
    apiKey: config.useCustomKey && config.apiKey.trim() ? config.apiKey.trim() : '',
    models: {
      defaultModel: config.models.defaultModel,
      courseGenerator: config.models.courseGenerator,
      quizGenerator: config.models.quizGenerator,
      writingGrader: config.models.writingGrader,
    },
    outputLanguage: 'vi',
  };
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(JWT_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Yêu cầu thất bại (mã lỗi ${res.status})`);
  }
  return res.json();
}

export interface GenerateCourseResult {
  courseId: string;
  jobId: string;
  status: string;
}

export interface GenerationStatus {
  status: 'queued' | 'generating' | 'paused_quota' | 'completed' | 'failed';
  totalUnits: number;
  completedUnits: number;
  lastError?: string | null;
}

export function generateCourse(
  youtubeUrl: string,
  category: string,
  difficulty: string
): Promise<GenerateCourseResult> {
  return apiFetch('/courses/generate', {
    method: 'POST',
    body: JSON.stringify({ youtubeUrl, category, difficulty, llmConfig: buildLlmConfig() }),
  });
}

export function getGenerationStatus(courseId: string): Promise<GenerationStatus> {
  return apiFetch(`/courses/${courseId}/generation-status`);
}

export function getCourses(category?: string, query?: string): Promise<Course[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (query) params.set('query', query);
  const qs = params.toString();
  const path = qs ? `/courses?${qs}` : '/courses';
  return apiFetch(path);
}

export function getCourseDetail(courseId: string): Promise<Course> {
  return apiFetch(`/courses/${courseId}`);
}

export function evaluateWriting(
  courseId: string,
  lessonId: string,
  userSubmission: string
): Promise<WritingEvaluation> {
  return apiFetch(`/courses/${courseId}/lessons/${lessonId}/writing/evaluate`, {
    method: 'POST',
    body: JSON.stringify({ userSubmission, llmConfig: buildLlmConfig() }),
  });
}

export function evaluateSpeaking(
  courseId: string,
  lessonId: string,
  transcriptText: string
): Promise<SpeakingEvaluation> {
  return apiFetch(`/courses/${courseId}/lessons/${lessonId}/speaking/evaluate`, {
    method: 'POST',
    body: JSON.stringify({ transcriptText, llmConfig: buildLlmConfig() }),
  });
}

export function updateProgress(
  courseId: string,
  lessonId: string,
  mode: string,
  completed = true,
  accuracy?: number
): Promise<{ ok: boolean }> {
  return apiFetch(`/courses/${courseId}/lessons/${lessonId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ mode, completed, accuracy }),
  });
}
