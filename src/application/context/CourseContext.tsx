import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Course, Category, LearningModeType } from '../../core/entities';
import { LocalCourseRepository } from '../../infrastructure/storage/LocalCourseRepository';

const courseRepo = new LocalCourseRepository();

interface CourseContextType {
  categories: Category[];
  courses: Course[];
  selectedCategory: string;
  searchQuery: string;
  visibleLimit: number;
  activeCourse: Course | null;
  activeLessonIndex: number;
  activeMode: LearningModeType;
  isCreateModalOpen: boolean;
  prefillUrl: string;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setVisibleLimit: (limit: number | ((prev: number) => number)) => void;
  setActiveCourse: (course: Course | null) => void;
  setActiveLessonIndex: (index: number) => void;
  setActiveMode: (mode: LearningModeType) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setPrefillUrl: (url: string) => void;
  addCourse: (newCourse: Course) => void;
  createCategory: (name: string) => void;
  addCategory: (newCategory: Category | string) => void;
  selectCourse: (course: Course, lessonIndex?: number) => void;
  clearActiveCourse: () => void;
  openCreateModal: (url?: string) => void;
  closeCreateModal: () => void;
}

export const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => courseRepo.getCategories());
  const [courses, setCourses] = useState<Course[]>(() => courseRepo.getCourses());

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleLimit, setVisibleLimit] = useState<number>(6);

  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<LearningModeType>('theory');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [prefillUrl, setPrefillUrl] = useState<string>('');

  useEffect(() => {
    courseRepo.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    courseRepo.saveCourses(courses);
  }, [courses]);

  const addCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setActiveCourse(newCourse);
    setActiveLessonIndex(0);
    setActiveMode('theory');
  };

  const createCategory = (name: string) => {
    const newCat: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color: '#2E68FF',
      badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
      badgeText: 'text-blue-600 dark:text-blue-400',
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const selectCourse = (course: Course, lessonIndex = 0) => {
    setActiveCourse(course);
    setActiveLessonIndex(lessonIndex);
    setActiveMode('theory');
  };

  const clearActiveCourse = () => {
    setActiveCourse(null);
  };

  const openCreateModal = (url?: string) => {
    if (url) setPrefillUrl(url);
    else setPrefillUrl('');
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <CourseContext.Provider
      value={{
        categories,
        courses,
        selectedCategory,
        searchQuery,
        visibleLimit,
        activeCourse,
        activeLessonIndex,
        activeMode,
        isCreateModalOpen,
        prefillUrl,
        setSelectedCategory,
        setSearchQuery,
        setVisibleLimit,
        setActiveCourse,
        setActiveLessonIndex,
        setActiveMode,
        setIsCreateModalOpen,
        setPrefillUrl,
        addCourse,
        createCategory,
        addCategory: (cat: Category | string) => {
          if (typeof cat === 'string') {
            createCategory(cat);
          } else {
            setCategories((prev) => [...prev, cat]);
          }
        },
        selectCourse,
        clearActiveCourse,
        openCreateModal,
        closeCreateModal,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
