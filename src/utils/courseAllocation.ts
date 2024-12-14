import type { Course, CourseApplication, CourseResult } from '../types';

/**
 * 基于贪心算法的课程分配
 * 优先考虑：
 * 1. 申请优先级
 * 2. 提交时间
 */
export function allocateCourses(
  applications: CourseApplication[],
  courses: Map<number, Course>
): CourseResult[] {
  // 按优先级和时间戳排序
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // 高优先级优先
    }
    return a.timestamp - b.timestamp; // 早提交优先
  });

  const results: CourseResult[] = [];
  const courseEnrollments = new Map<number, number>();

  // 初始化课程已选人数
  for (const [id, course] of courses) {
    courseEnrollments.set(id, 0);
  }

  // 处理每个申请
  for (const app of sortedApplications) {
    const course = courses.get(app.courseId);
    if (!course) {
      results.push({
        studentId: app.studentId,
        courseId: app.courseId,
        status: 'failed',
        message: '课程不存在'
      });
      continue;
    }

    const currentEnrollment = courseEnrollments.get(app.courseId) || 0;
    if (currentEnrollment < course.capacity) {
      // 分配成功
      courseEnrollments.set(app.courseId, currentEnrollment + 1);
      results.push({
        studentId: app.studentId,
        courseId: app.courseId,
        status: 'success'
      });
    } else {
      // 分配失败
      results.push({
        studentId: app.studentId,
        courseId: app.courseId,
        status: 'failed',
        message: '课程已满'
      });
    }
  }

  return results;
}

/**
 * 检查学生是否可以选择某门课程
 */
export function canSelectCourse(
  studentId: number,
  courseId: number,
  courses: Map<number, Course>,
  selectedCourses: number[]
): { canSelect: boolean; message?: string } {
  const course = courses.get(courseId);
  
  if (!course) {
    return { canSelect: false, message: '课程不存在' };
  }

  if (course.enrolled >= course.capacity) {
    return { canSelect: false, message: '课程已满' };
  }

  if (selectedCourses.includes(courseId)) {
    return { canSelect: false, message: '已选择该课程' };
  }

  return { canSelect: true };
}

/**
 * 生成测试数据
 */
export function generateMockData(): { courses: Course[] } {
  const courses: Course[] = [
    {
      id: 1,
      name: '高等数学',
      capacity: 50,
      enrolled: 0,
      description: '研究函数、极限、微积分等数学概念',
      teacher: '张教授',
      credits: 4,
      schedule: '周一 1-2节'
    },
    {
      id: 2,
      name: '大学物理',
      capacity: 40,
      enrolled: 0,
      description: '研究物质运动的基本规律和相互作用',
      teacher: '李教授',
      credits: 3,
      schedule: '周二 3-4节'
    },
    {
      id: 3,
      name: '计算机基础',
      capacity: 60,
      enrolled: 0,
      description: '计算机基本概念和编程入门',
      teacher: '王教授',
      credits: 3,
      schedule: '周三 5-6节'
    },
    {
      id: 4,
      name: '英语写作',
      capacity: 35,
      enrolled: 0,
      description: '提高英语写作能力和技巧',
      teacher: '陈教授',
      credits: 2,
      schedule: '周四 7-8节'
    },
    {
      id: 5,
      name: '数据结构',
      capacity: 45,
      enrolled: 0,
      description: '研究数据的组织、管理和存储',
      teacher: '刘教授',
      credits: 4,
      schedule: '周五 1-2节'
    }
  ];

  return { courses };
}
