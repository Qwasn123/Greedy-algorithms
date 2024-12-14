import type { 
  Course, 
  TimeSlot, 
  ConflictCheckResult, 
  CourseApplication,
  CourseResult,
  Student
} from '../types';

/**
 * 解析课程时间字符串为时间段对象
 * @param schedule 课程时间字符串，例如："周一 1-2节"
 */
export function parseSchedule(schedule: string): TimeSlot {
  const dayMap: { [key: string]: number } = {
    '周一': 1,
    '周二': 2,
    '周三': 3,
    '周四': 4,
    '周五': 5
  };

  const day = dayMap[schedule.split(' ')[0]];
  const periodStr = schedule.split(' ')[1].replace('节', '');
  const [start, end] = periodStr.split('-').map(Number);
  const period = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  );

  return { day, period };
}

/**
 * 检查两个时间段是否冲突
 */
function doTimeSlotsConflict(slot1: TimeSlot, slot2: TimeSlot): boolean {
  if (slot1.day !== slot2.day) return false;
  return slot1.period.some(p1 => slot2.period.includes(p1));
}

/**
 * 检查课程时间冲突
 */
export function checkTimeConflict(
  course: Course,
  selectedCourses: Course[]
): ConflictCheckResult {
  const courseTimeSlot = parseSchedule(course.schedule);

  for (const selectedCourse of selectedCourses) {
    const selectedTimeSlot = parseSchedule(selectedCourse.schedule);
    
    if (doTimeSlotsConflict(courseTimeSlot, selectedTimeSlot)) {
      return {
        hasConflict: true,
        conflictingCourse: selectedCourse,
        message: `与课程 ${selectedCourse.name}（${selectedCourse.schedule}）时间冲突`
      };
    }
  }

  return { hasConflict: false };
}

/**
 * 基于贪心算法的选课分配
 * 优先级规则：
 * 1. 优先级高的申请优先处理
 * 2. 同优先级时，提交时间早的优先
 * 3. 需满足以下约束：
 *    - 课程容量限制
 *    - 时间冲突检测
 */
export function allocateCourses(
  applications: CourseApplication[],
  courses: Map<number, Course>,
  students: Map<number, Student>
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
  const studentSelections = new Map<number, number[]>();

  // 初始化课程已选人数和学生已选课程
  for (const [id, course] of courses) {
    courseEnrollments.set(id, 0);
  }
  for (const [id, student] of students) {
    studentSelections.set(id, []);
  }

  // 处理每个申请
  for (const app of sortedApplications) {
    const course = courses.get(app.courseId);
    const student = students.get(app.studentId);
    
    if (!course || !student) {
      results.push({
        studentId: app.studentId,
        courseId: app.courseId,
        status: 'failed',
        message: '课程或学生信息不存在'
      });
      continue;
    }

    // 获取学生已选课程列表
    const studentCourses = (studentSelections.get(app.studentId) || [])
      .map(id => courses.get(id))
      .filter((c): c is Course => c !== undefined);

    // 检查课程容量
    const currentEnrollment = courseEnrollments.get(app.courseId) || 0;
    if (currentEnrollment >= course.capacity) {
      results.push({
        studentId: app.studentId,
        courseId: app.courseId,
        status: 'failed',
        message: '课程已满'
      });
      continue;
    }

    // 检查时间冲突
    const conflictCheck = checkTimeConflict(course, studentCourses);
    if (conflictCheck.hasConflict) {
      results.push({
        studentId: app.studentId,
        courseId: app.courseId,
        status: 'failed',
        message: conflictCheck.message
      });
      continue;
    }

    // 分配成功
    courseEnrollments.set(app.courseId, currentEnrollment + 1);
    studentSelections.set(
      app.studentId,
      [...(studentSelections.get(app.studentId) || []), app.courseId]
    );
    
    results.push({
      studentId: app.studentId,
      courseId: app.courseId,
      status: 'success'
    });
  }

  return results;
}

/**
 * 计算课程权重的函数
 */
export function calculateCourseWeight(
  course: Course,
  preferenceMode: 'recommend' | 'minimum'
): number {
  if (preferenceMode === 'recommend') {
    return course.recommendIndex;
  } else {
    // 最少课程模式下，优先选择学分高的课程
    return course.credits;
  }
}

// 使用贪心算法推荐课程组合
export function recommendCourseSet(
  courses: Course[],
  targetCredits: number,
  preferenceMode: 'recommend' | 'minimum' | number = 'recommend'
): {
  courses: Course[];
  totalCredits: number;
  totalWeight: number;
} {
  // 如果传入的是数字（旧的权重参数），转换为对应的模式
  const mode = typeof preferenceMode === 'number' 
    ? (preferenceMode >= 0.5 ? 'recommend' : 'minimum')
    : preferenceMode;

  // 按权重排序课程
  const sortedCourses = [...courses].sort((a, b) => {
    const weightA = calculateCourseWeight(a, mode);
    const weightB = calculateCourseWeight(b, mode);
    if (mode === 'minimum') {
      // 最少课程模式下，学分高的优先
      return weightB - weightA;
    }
    return weightB - weightA;
  });

  const selected: Course[] = [];
  let totalCredits = 0;
  let totalWeight = 0;

  for (const course of sortedCourses) {
    if (totalCredits + course.credits <= targetCredits) {
      selected.push(course);
      totalCredits += course.credits;
      totalWeight += course.recommendIndex;
    }

    if (totalCredits >= targetCredits) {
      break;
    }
  }

  return {
    courses: selected,
    totalCredits,
    totalWeight
  };
}

/**
 * 使用贪心算法推荐课程
 */
export function recommendCourses(
  courses: Course[],
  recommendWeight: number = 0.5,
  maxRecommendations: number = 5
): Course[] {
  // 计算每个课程的权重
  const coursesWithWeights = courses.map(course => ({
    course,
    weight: calculateCourseWeight(course, 'recommend')
  }));

  // 按权重降序排序
  coursesWithWeights.sort((a, b) => b.weight - a.weight);

  // 返回权重最高的前N个课程
  return coursesWithWeights
    .slice(0, maxRecommendations)
    .map(item => item.course);
}

/**
 * 生成测试数据
 */
export function generateMockData(): { courses: Course[] } {
  const courseTemplates = [
    {
      name: '高等数学',
      description: '研究函数、极限、微积分等数学概念',
      credits: 4,
      recommendIndex: 5  // 重要的基础课
    },
    {
      name: '线性代数',
      description: '研究向量空间、线性映射等代数概念',
      credits: 3,
      recommendIndex: 4  // 基础数学课
    },
    {
      name: '概率论与数理统计',
      description: '研究随机现象的数学规律',
      credits: 3,
      recommendIndex: 3  // 一般难度
    },
    {
      name: '离散数学',
      description: '研究离散量的结构及其相互关系',
      credits: 3,
      recommendIndex: 3  // 一般难度
    },
    {
      name: '大学物理',
      description: '研究物质运动的基本规律和相互作用',
      credits: 4,
      recommendIndex: 4  // 重要的理科基础
    },
    {
      name: '电路原理',
      description: '学习电路的基本原理和分析方法',
      credits: 3,
      recommendIndex: 3  // 中等难度
    },
    {
      name: 'C++程序设计',
      description: '学习C++编程语言和基础算法',
      credits: 3,
      recommendIndex: 5  // 编程入门必修
    },
    {
      name: 'Python编程',
      description: '学习Python语言及其应用',
      credits: 2,
      recommendIndex: 2  // 选修课程
    },
    {
      name: '数据结构',
      description: '研究数据的组织、管理和存储',
      credits: 4,
      recommendIndex: 5  // 计算机核心课程
    },
    {
      name: '计算机组成原理',
      description: '学习计算机硬件系统的组成和工作原理',
      credits: 4,
      recommendIndex: 4  // 专业核心课
    },
    {
      name: '操作系统',
      description: '学习计算机操作系统的原理和实现',
      credits: 4,
      recommendIndex: 4  // 专业核心课
    },
    {
      name: '计算机网络',
      description: '学习计算机网络的基本原理和协议',
      credits: 3,
      recommendIndex: 3  // 中等重要性
    },
    {
      name: '数据库原理',
      description: '学习数据库系统的设计与实现',
      credits: 3,
      recommendIndex: 4  // 较重要
    },
    {
      name: '软件工程',
      description: '学习软件开发的方法和过程',
      credits: 3,
      recommendIndex: 3  // 中等重要性
    },
    {
      name: '人工智能导论',
      description: '人工智能基础理论与应用',
      credits: 3,
      recommendIndex: 2  // 选修课程
    },
    {
      name: '机器学习',
      description: '统计学习方法与机器学习算法',
      credits: 4,
      recommendIndex: 2  // 高级选修
    },
    {
      name: '深度学习',
      description: '深度神经网络与深度学习应用',
      credits: 3,
      recommendIndex: 2  // 高级选修
    },
    {
      name: '数字电路',
      description: '数字系统与逻辑电路设计',
      credits: 3,
      recommendIndex: 3  // 中等难度
    },
    {
      name: '模拟电路',
      description: '模拟电子技术与电路分析',
      credits: 3,
      recommendIndex: 2  // 选修课程
    },
    {
      name: '微机原理',
      description: '微型计算机原理与接口技术',
      credits: 3,
      recommendIndex: 3  // 中等重要性
    }
  ];

  const teachers = [
    '张教授', '李教授', '王教授', '陈教授', '刘教授',
    '赵教授', '孙教授', '周教授', '吴教授', '郑教授'
  ];

  const schedules = [
    ['周一', [1, 2], [3, 4], [5, 6], [7, 8]],
    ['周二', [1, 2], [3, 4], [5, 6], [7, 8]],
    ['周三', [1, 2], [3, 4], [5, 6], [7, 8]],
    ['周四', [1, 2], [3, 4], [5, 6], [7, 8]],
    ['周五', [1, 2], [3, 4], [5, 6], [7, 8]]
  ];

  const courseData: Omit<Course, 'timeSlots'>[] = courseTemplates.map((template, index) => {
    // 随机选择上课时间和教师
    const [day, ...periods] = schedules[Math.floor(Math.random() * schedules.length)];
    const period = periods[Math.floor(Math.random() * periods.length)];
    const teacher = teachers[Math.floor(Math.random() * teachers.length)];

    return {
      id: index + 1,
      name: template.name,
      capacity: 40,
      enrolled: Math.floor(Math.random() * 20),
      description: template.description,
      teacher,
      credits: template.credits,
      schedule: `${day} ${period[0]},${period[1]}节`,
      interestIndex: 4,
      workload: 4,
      recommendIndex: template.recommendIndex
    };
  });

  // 为每个课程添加时间段数据
  const courses = courseData.map(course => ({
    ...course,
    timeSlots: [parseSchedule(course.schedule)]
  }));

  return { courses };
}
