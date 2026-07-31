import { Course, Category } from '../../core/entities';
import { ICourseRepository } from '../../core/repositories/ICourseRepository';
import { INITIAL_CATEGORIES, INITIAL_COURSES } from '../data/mockCourses';

const CATEGORIES_KEY = 't2m_categories';
const COURSES_KEY = 't2m_courses';

export class LocalCourseRepository implements ICourseRepository {
  getCategories(): Category[] {
    try {
      const saved = localStorage.getItem(CATEGORIES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  }

  getCourses(): Course[] {
    try {
      const saved = localStorage.getItem(COURSES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  }

  saveCourses(courses: Course[]): void {
    try {
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses', e);
    }
  }
}
