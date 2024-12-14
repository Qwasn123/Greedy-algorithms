import type { Course, RecommendResult, CourseRecommendStrategy } from '../types';
import { checkTimeConflict } from './courseSelection';

/**
 * 根据不同策略计算课程得分
 */
function calculateCourseScore(
  course: Course,
  strategy: CourseRecommendStrategy,
  selectedCourses: Course[]
): number {
  switch (strategy) {
    case CourseRecommendStrategy.CREDITS_FIRST:
      return course.credits;
    
    case CourseRecommendStrategy.INTEREST_FIRST:
      return course.interestIndex;
    
    case CourseRecommendStrategy.WORKLOAD_FIRST:
      return -course.workload; // 负号使得工作量低的课程得分更高
    
    case CourseRecommendStrategy.BALANCED:
      // 平衡考虑所有因素
      const creditWeight = 0.4;
      const interestWeight = 0.4;
      const workloadWeight = 0.2;
      
      return (
        course.credits * creditWeight +
        course.interestIndex * interestWeight -
        course.workload * workloadWeight
      );
    
    default:
      return 0;
  }
}

/**
 * 基于贪心算法的课程推荐
 * @param courses 所有可选课程
 * @param requiredCredits 需要修满的学分
 * @param strategy 推荐策略
 * @returns 推荐结果
 */
export function recommendCourses(
  courses: Course[],
  requiredCredits: number,
  strategy: CourseRecommendStrategy
): RecommendResult {
  const selectedCourses: Course[] = [];
  let totalCredits = 0;

  // 按策略对课程进行排序
  const sortedCourses = [...courses].sort((a, b) => {
    const scoreA = calculateCourseScore(a, strategy, selectedCourses);
    const scoreB = calculateCourseScore(b, strategy, selectedCourses);
    return scoreB - scoreA;
  });

  // 贪心选择课程
  for (const course of sortedCourses) {
    // 如果已经达到学分要求，停止选课
    if (totalCredits >= requiredCredits) break;

    // 检查时间冲突
    const hasConflict = selectedCourses.some(
      selected => checkTimeConflict(course, [selected]).hasConflict
    );
    if (hasConflict) continue;

    // 添加课程
    selectedCourses.push(course);
    totalCredits += course.credits;
  }

  // 计算平均指标
  const averageInterest = selectedCourses.reduce(
    (sum, course) => sum + course.interestIndex,
    0
  ) / selectedCourses.length;

  const averageWorkload = selectedCourses.reduce(
    (sum, course) => sum + course.workload,
    0
  ) / selectedCourses.length;

  return {
    courses: selectedCourses,
    totalCredits,
    averageInterest,
    averageWorkload,
    strategy
  };
}

/**
 * 生成所有策略的推荐结果
 */
export function generateAllRecommendations(
  courses: Course[],
  requiredCredits: number
): RecommendResult[] {
  return Object.values(CourseRecommendStrategy).map(strategy =>
    recommendCourses(courses, requiredCredits, strategy)
  );
}
