import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Course } from '../../core/entities';
import {
  GenerateCourseResult,
  GenerationStatus,
  generateCourse,
  getCourseDetail,
  getGenerationStatus,
} from '../../infrastructure/api/talk2meApi';

export const useGenerateCourseMutation = () => {
  return useMutation<GenerateCourseResult, Error, { youtubeUrl: string; category: string; difficulty: string }>({
    mutationFn: ({ youtubeUrl, category, difficulty }) => generateCourse(youtubeUrl, category, difficulty),
  });
};

/** Polls the background generation job until it reaches a terminal status. */
export const useGenerationStatusQuery = (courseId: string | null, enabled: boolean) => {
  return useQuery<GenerationStatus>({
    queryKey: ['generation-status', courseId],
    queryFn: () => getGenerationStatus(courseId as string),
    enabled: enabled && !!courseId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : 2000;
    },
  });
};

export const useCourseDetailQuery = (courseId: string | null, enabled = true) => {
  return useQuery<Course>({
    queryKey: ['course-detail', courseId],
    queryFn: () => getCourseDetail(courseId as string),
    enabled: enabled && !!courseId,
  });
};

export const useInvalidateCourses = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['courses'] });
};
