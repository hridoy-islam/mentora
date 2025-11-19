// src/lib/courses.ts

export type LessonType = 'video' | 'doc' | 'quiz';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
}

export interface Lesson {
  id: number;
  title: string;
  type: LessonType;
  duration: string; // e.g., "10 min", "5 pages"
  isCompleted: boolean;
  isLocked: boolean;

  // Optional content fields
  videoUrl?: string;
  content?: string; // Markdown or HTML
  questions?: QuizQuestion[];
}

export interface Module {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  instructor: string;
  instructorTitle: string;
  instructorRating: number;
  instructorStudents: number;
  instructorBio: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  students: number;
  duration: number; // Total hours
  totalLessons: number;
  resources: number;
  learningPoints: string[];
  requirements: string[];
  aboutDescription: string;
  modules: Module[];
}

// Optional: For enrolled courses tracking
export interface EnrolledCourse extends Course {
  progress: number; // 0-100%
  completedLessons: number;
  lastAccessed: Date;
  currentLesson?: number; // Lesson ID
}

// Example courses
export const courses: Course[] = [
  {
    id: 1,
    title: 'Mobile App Development The Complete Guide',
    description: 'Learn UIKIT, JavaScript and web programming...',
    category: 'Mobile Development',
    image: '/mobileapp.png',
    instructor: 'Kathryn Murphy',
    instructorTitle: 'Senior Developer',
    instructorRating: 4.8,
    instructorStudents: 15400,
    instructorBio: 'With over 10 years of experience...',
    price: 89.99,
    originalPrice: 248.0,
    rating: 4.3,
    reviews: 1200,
    students: 229,
    duration: 31,
    totalLessons: 12,
    resources: 40,
    learningPoints: [
      'Prepare for becoming a Professional Front-End Developer',
      'Complete Web Development with React',
    ],
    requirements: ['Have an internet connection', 'VS Code installed'],
    aboutDescription: 'This comprehensive guide covers everything...',
    modules: [
      {
        id: 1,
        title: 'Module 1: Introduction & Setup',
        lessons: [
          {
            id: 101,
            title: 'Welcome & Course Overview',
            type: 'video',
            duration: '15:30',
            isCompleted: true,
            isLocked: false,
            videoUrl: 'intro-video',
          },
          {
            id: 102,
            title: 'Setting Up Environment',
            type: 'doc',
            duration: '5 min read',
            isCompleted: true,
            isLocked: false,
            content: `
### Installation Steps
1. Download Node.js from the official website.
2. Install VS Code.
3. Run 'npm install' in your terminal.

**Note:** Ensure you have admin rights on your machine.
`,
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Core Concepts',
        lessons: [
          {
            id: 201,
            title: 'Understanding React Components',
            type: 'video',
            duration: '20:00',
            isCompleted: false,
            isLocked: false,
          },
          {
            id: 202,
            title: 'State vs Props Documentation',
            type: 'doc',
            duration: '10 min read',
            isCompleted: false,
            isLocked: false,
            content: `
### State
State is mutable and managed within the component.

### Props
Props are immutable and passed from parent to child.
`,
          },
          {
            id: 203,
            title: 'Module 2 Knowledge Check',
            type: 'quiz',
            duration: '5 Questions',
            isCompleted: false,
            isLocked: false,
            questions: [
              { id: 1, question: 'Is State mutable?', options: ['Yes', 'No'], correctAnswer: 0 },
              { id: 2, question: 'How do you pass data to a child?', options: ['State', 'Props', 'Context'], correctAnswer: 1 },
            ],
          },
        ],
      },
    ],
  },
];

// Enrolled Courses (for user progress tracking)
export const enrolledCourses: EnrolledCourse[] = courses.map(course => ({
  ...course,
  progress: 0,
  completedLessons: 0,
  lastAccessed: new Date(),
  currentLesson: course.modules[0]?.lessons[0]?.id,
}));
