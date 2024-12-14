// 课程时间段类型
export interface TimeSlot {
  day: number;      // 1-5 代表周一到周五
  period: number[]; // 课程节数
}

// 课程类型定义
export interface Course {
  id: number;
  name: string;
  capacity: number;
  enrolled: number;
  description: string;
  teacher: string;
  credits: number;
  schedule: string;
  timeSlots: TimeSlot[];
  interestIndex: number;  // 兴趣指数 1-5
  workload: number;      // 课时数/工作量 1-5
  recommendIndex: number; // 推荐指数，1-5分
}

// 学生类型定义
export interface Student {
  id: number;
  name: string;
  selectedCourses: number[];
  maxCredits: number;
}

// 选课申请类型定义
export interface CourseApplication {
  studentId: number;
  courseId: number;
  timestamp: number;
  priority: number;
}

// 选课结果类型定义
export interface CourseResult {
  studentId: number;
  courseId: number;
  status: 'success' | 'failed';
  message?: string;
}

// 课程冲突检查结果
export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingCourse?: Course;
  message?: string;
}

// 课程推荐策略
export enum CourseRecommendStrategy {
  CREDITS_FIRST = 'credits',      // 优先学分最高
  INTEREST_FIRST = 'interest',    // 优先兴趣最高
  WORKLOAD_FIRST = 'workload',    // 优先工作量最低
  BALANCED = 'balanced'           // 平衡考虑所有因素
}

// 推荐结果
export interface RecommendResult {
  courses: Course[];
  totalCredits: number;
  averageInterest: number;
  averageWorkload: number;
  strategy: CourseRecommendStrategy;
}
