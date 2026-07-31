import { Course, Category } from '../entities';

export interface ICourseRepository {
  getCategories(): Category[];
  saveCategories(categories: Category[]): void;
  getCourses(): Course[];
  saveCourses(courses: Course[]): void;
}
