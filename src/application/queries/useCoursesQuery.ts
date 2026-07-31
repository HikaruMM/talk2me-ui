import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Course } from '../../core/entities';
import { INITIAL_COURSES } from '../../infrastructure/data/mockCourses';

const FASTAPI_URL = 'http://localhost:8000/api/v1/courses';

export const useCoursesQuery = (category?: string, query?: string) => {
  return useQuery({
    queryKey: ['courses', category || 'all', query || ''],
    queryFn: async (): Promise<Course[]> => {
      try {
        const url = new URL(FASTAPI_URL);
        if (category && category !== 'all') url.searchParams.append('category', category);
        if (query) url.searchParams.append('query', query);

        const res = await fetch(url.toString());
        if (res.ok) {
          const apiCourses = await res.json();
          if (Array.isArray(apiCourses) && apiCourses.length > 0) {
            return apiCourses;
          }
        }
      } catch (err) {
        console.warn('API courses query failed, using local courses fallback:', err);
      }

      // Fallback to local storage or mock courses
      const saved = localStorage.getItem('talk2me_courses');
      const localCourses: Course[] = saved ? JSON.parse(saved) : INITIAL_COURSES;

      return localCourses.filter((c) => {
        const matchesCategory =
          !category || category === 'all' || c.categoryId === category || c.category.toLowerCase() === category.toLowerCase();
        const matchesQuery =
          !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      });
    },
  });
};

export const useAddCourseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCourse: Course) => {
      const saved = localStorage.getItem('talk2me_courses');
      const existing: Course[] = saved ? JSON.parse(saved) : INITIAL_COURSES;
      const updated = [newCourse, ...existing];
      localStorage.setItem('talk2me_courses', JSON.stringify(updated));
      return newCourse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
