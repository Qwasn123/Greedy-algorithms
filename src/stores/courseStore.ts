import { defineStore } from 'pinia';
import type { Course, CourseApplication, CourseResult, Student } from '../types';
import { 
  allocateCourses, 
  generateMockData, 
  checkTimeConflict
} from '../utils/courseSelection';
import { ElMessage } from 'element-plus';

interface CourseState {
  courses: Course[];
  applications: CourseApplication[];
  results: CourseResult[];
  currentStudent: Student;
}

export const useCourseStore = defineStore('course', {
  state: (): CourseState => ({
    courses: [],
    applications: [],
    results: [],
    currentStudent: {
      id: '2021001',
      name: '张三',
      selectedCourses: [],
      maxCredits: 20 // 最大可选20学分
    }
  }),

  getters: {
    availableCourses: (state) => state.courses.filter(course => course.enrolled < course.capacity),
    
    studentSelectedCourses: (state) => {
      const successfulApplications = state.results
        .filter(result => 
          result.studentId === state.currentStudent.id && 
          result.status === 'success'
        );
      
      return state.courses.filter(course => 
        successfulApplications.some(app => app.courseId === course.id)
      );
    },

    totalCredits: (state): number => {
      return state.studentSelectedCourses.reduce(
        (sum, course) => sum + course.credits,
        0
      );
    }
  },

  actions: {
    initializeCourses() {
      const { courses } = generateMockData();
      this.courses = courses;
    },

    /**
     * 提交选课申请
     * 在提交前进行预检查：
     * 1. 课程容量检查
     * 2. 时间冲突检查
     */
    submitCourseApplication(courseId: number, priority: number) {
      const course = this.courses.find(c => c.id === courseId);
      if (!course) {
        ElMessage.error('课程不存在');
        return false;
      }

      // 检查课程容量
      if (course.enrolled >= course.capacity) {
        ElMessage.error('课程已满');
        return false;
      }

      // 检查时间冲突
      const conflictCheck = checkTimeConflict(
        course,
        this.studentSelectedCourses
      );
      if (conflictCheck.hasConflict) {
        ElMessage.error(conflictCheck.message);
        return false;
      }

      // 创建选课申请
      const application: CourseApplication = {
        studentId: this.currentStudent.id,
        courseId,
        timestamp: Date.now(),
        priority,
      };

      this.applications.push(application);
      this.processApplications();
      return true;
    },

    /**
     * 处理所有选课申请
     * 使用贪心算法进行课程分配
     */
    processApplications() {
      // 创建课程和学生的Map
      const coursesMap = new Map(this.courses.map(course => [course.id, course]));
      const studentsMap = new Map([[this.currentStudent.id, this.currentStudent]]);

      // 分配课程
      this.results = allocateCourses(
        this.applications,
        coursesMap,
        studentsMap
      );

      // 更新课程已选人数
      this.courses = this.courses.map(course => ({
        ...course,
        enrolled: this.results.filter(
          result => result.courseId === course.id && result.status === 'success'
        ).length
      }));

      // 更新当前学生的已选课程
      this.currentStudent.selectedCourses = this.results
        .filter(result => 
          result.studentId === this.currentStudent.id && 
          result.status === 'success'
        )
        .map(result => result.courseId);
    },

    /**
     * 退选课程
     */
    withdrawApplication(courseId: number) {
      // 移除相关的申请和结果
      this.applications = this.applications.filter(
        app => !(app.studentId === this.currentStudent.id && app.courseId === courseId)
      );
      
      // 重新处理所有申请
      this.processApplications();
    },

    async selectCourse(course: Course) {
      // 检查是否已经选过这门课
      if (this.studentSelectedCourses.some(c => c.id === course.id)) {
        ElMessage.error('该课程已经选过了');
        return false;
      }

      // 检查时间冲突
      if (this.hasTimeConflict(course)) {
        ElMessage.warning('课程时间存在冲突');
        return false;
      }

      // 选课成功
      this.currentStudent.selectedCourses.push(course.id);
      ElMessage.success(`成功选择课程：${course.name}`);
      return true;
    }
  },
});
