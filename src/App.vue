<template>
  <SystemSwitch v-model="currentSystem">
    <template #course-content>
      <el-container class="min-h-screen">
        <el-header class="border-b bg-white">
          <div class="h-full flex justify-between items-center px-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-xl text-primary"><School /></el-icon>
              <span class="text-xl font-bold">学生选课系统</span>
            </div>
            <div class="flex items-center gap-4">
              <el-button-group>
                <el-button :type="activeView === 'courses' ? 'primary' : ''" @click="activeView = 'courses'">
                  <el-icon><List /></el-icon>
                  课程列表
                </el-button>
                <el-button :type="activeView === 'selected' ? 'primary' : ''" @click="activeView = 'selected'">
                  <el-icon><Collection /></el-icon>
                  已选课程
                </el-button>
              </el-button-group>
              <el-dropdown>
                <el-button>
                  <el-icon class="mr-1"><User /></el-icon>
                  学生
                  <el-icon class="ml-1"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item disabled>学号：{{ store.currentStudent.id }}</el-dropdown-item>
                    <el-dropdown-item>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <el-main class="bg-gray-50">
          <!-- 顶部信息栏 -->
          <div class="mb-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold">爱心选课系统</h1>
            <div class="text-gray-600 text-right">
              <p>当前学生：{{ store.currentStudent.name }}</p>
              <p>已选学分：{{ store.totalCredits }}/20</p>
            </div>
          </div>

          <!-- 课程内容 -->
          <div v-if="activeView === 'courses'">
            <div class="grid grid-cols-12 gap-4">
              <!-- 左侧推荐区域 -->
              <div class="col-span-4 bg-white rounded-lg shadow">
                <CourseRecommendation />
              </div>

              <!-- 中间课程列表 -->
              <div class="col-span-8 bg-white rounded-lg shadow">
                <CourseTable />
              </div>
            </div>
          </div>
          <div v-else>
            <SelectedCourses />
          </div>
        </el-main>
      </el-container>
    </template>

    <template #exam-content>
      <el-container class="min-h-screen">
        <el-header class="border-b bg-white">
          <div class="h-full flex justify-between items-center px-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-xl text-primary"><Reading /></el-icon>
              <span class="text-xl font-bold">考试系统</span>
            </div>
            <div class="flex items-center gap-4">
              <el-button-group>
                <el-button :type="activeExamView === 'upcoming' ? 'primary' : ''" @click="activeExamView = 'upcoming'">
                  <el-icon><Calendar /></el-icon>
                  即将考试
                </el-button>
                <el-button :type="activeExamView === 'history' ? 'primary' : ''" @click="activeExamView = 'history'">
                  <el-icon><Histogram /></el-icon>
                  历史成绩
                </el-button>
              </el-button-group>
              <el-dropdown>
                <el-button>
                  <el-icon class="mr-1"><User /></el-icon>
                  学生
                  <el-icon class="ml-1"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item disabled>学号：{{ store.currentStudent.id }}</el-dropdown-item>
                    <el-dropdown-item>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <el-main class="bg-gray-50">
          <div class="mb-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold">考试管理系统</h1>
            <div class="text-gray-600 text-right">
              <p>当前学生：{{ store.currentStudent.name }}</p>
              <p>已报名考试：{{ upcomingExams.length }} 场</p>
            </div>
          </div>

          <div v-if="activeExamView === 'upcoming'">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="exam in upcomingExams" :key="exam.id" class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-start mb-3">
                  <h3 class="text-lg font-semibold">{{ exam.courseName }}</h3>
                  <el-tag :type="getExamStatusType(exam.status)">{{ getExamStatusLabel(exam.status) }}</el-tag>
                </div>
                <div class="space-y-2 text-gray-600">
                  <p><el-icon><Timer /></el-icon> 时间：{{ formatExamTime(exam.startTime, exam.duration) }}</p>
                  <p><el-icon><Location /></el-icon> 地点：{{ exam.location }}</p>
                  <p><el-icon><Document /></el-icon> 考试形式：{{ exam.type }}</p>
                </div>
                <div class="mt-4">
                  <el-button 
                    type="primary" 
                    :disabled="!canRegisterExam(exam)"
                    @click="registerExam(exam)"
                  >
                    报名考试
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <el-table :data="examHistory" style="width: 100%" class="bg-white rounded-lg shadow">
              <el-table-column prop="courseName" label="课程名称" />
              <el-table-column prop="examTime" label="考试时间" :formatter="formatExamHistoryTime" />
              <el-table-column prop="score" label="成绩">
                <template #default="{ row }">
                  <span :class="getScoreClass(row.score)">{{ row.score }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="rank" label="排名" />
              <el-table-column label="操作">
                <template #default="{ row }">
                  <el-button type="primary" link @click="viewExamDetail(row)">查看详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-main>
      </el-container>
    </template>

    <template #library-content>
      <el-container class="min-h-screen">
        <el-header class="border-b bg-white">
          <div class="h-full flex justify-between items-center px-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-xl text-primary"><Reading /></el-icon>
              <span class="text-xl font-bold">图书借阅系统</span>
            </div>
            <div class="flex items-center gap-4">
              <el-button type="primary" @click="generatePlan" :disabled="selectedBooks.length === 0">
                生成借阅计划
              </el-button>
            </div>
          </div>
        </el-header>

        <el-main class="bg-gray-50">
          <div class="mb-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold">图书列表</h1>
            <div class="text-gray-600 text-right">
              <p>已选择：{{ selectedBooks.length }} 本</p>
            </div>
          </div>

          <!-- 图书列表 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="book in books" :key="book.id" 
              class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-semibold">{{ book.title }}</h3>
                <el-tag :type="book.availableIn === 0 ? 'success' : 'warning'">
                  {{ book.availableIn === 0 ? '立即可借' : `${book.availableIn}天后可借` }}
                </el-tag>
              </div>
              <div class="space-y-2 text-gray-600">
                <p>作者：{{ book.author }}</p>
                <p>预计阅读时间：{{ book.readDays }}天</p>
              </div>
              <div class="mt-4">
                <el-button 
                  :type="isBookSelected(book) ? 'danger' : 'primary'"
                  @click="toggleBookSelection(book)"
                >
                  {{ isBookSelected(book) ? '取消选择' : '选择' }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 借阅计划 -->
          <div v-if="borrowPlan.length > 0" class="mt-8">
            <h2 class="text-xl font-semibold mb-4">推荐借阅计划</h2>
            <div class="bg-white rounded-lg shadow p-4">
              <el-timeline>
                <el-timeline-item
                  v-for="plan in borrowPlan"
                  :key="plan.book.id"
                  :type="plan.book.availableIn === 0 ? 'success' : 'warning'"
                  :timestamp="formatPlanTime(plan)"
                >
                  <h3 class="font-medium">{{ plan.book.title }}</h3>
                  <p class="text-gray-600">作者：{{ plan.book.author }}</p>
                  <p class="text-gray-600">阅读时间：{{ plan.book.readDays }}天</p>
                </el-timeline-item>
              </el-timeline>
              <div class="mt-4 text-gray-600">
                总计用时：{{ getTotalDays() }}天
              </div>
            </div>
          </div>
        </el-main>
      </el-container>
    </template>
  </SystemSwitch>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SystemSwitch from './components/SystemSwitch.vue';
import { School, List, Collection, User, ArrowDown, Reading, Calendar, Histogram, Timer, Location, Document } from '@element-plus/icons-vue';
import CourseTable from './components/CourseTable.vue';
import SelectedCourses from './components/SelectedCourses.vue';
import CourseRecommendation from './components/CourseRecommendation.vue';
import { useCourseStore } from './stores/courseStore';
import { books, generateBorrowPlan } from './utils/bookPlanning';
import type { Book, BorrowPlan } from './types/book';
import { ElMessage } from 'element-plus';

const store = useCourseStore();
const activeView = ref('courses');
const currentSystem = ref('course');
const activeExamView = ref('upcoming');

// Mock data for exams
const upcomingExams = ref([
  {
    id: 1,
    courseName: '高等数学',
    status: 'open',
    startTime: new Date('2024-12-25T09:00:00'),
    duration: 120,
    location: '教学楼A201',
    type: '闭卷'
  },
  {
    id: 2,
    courseName: '大学物理',
    status: 'upcoming',
    startTime: new Date('2024-12-27T14:00:00'),
    duration: 90,
    location: '教学楼B305',
    type: '开卷'
  }
]);

const examHistory = ref([
  {
    id: 1,
    courseName: '线性代数',
    examTime: new Date('2024-12-20T09:00:00'),
    score: 95,
    rank: '1/120'
  },
  {
    id: 2,
    courseName: '程序设计基础',
    examTime: new Date('2024-12-18T14:00:00'),
    score: 88,
    rank: '15/150'
  }
]);

// 格式化考试时间
function formatExamTime(startTime: Date, duration: number) {
  const endTime = new Date(startTime.getTime() + duration * 60000);
  return `${startTime.toLocaleString()} - ${endTime.toLocaleTimeString()}`;
}

// 格式化历史考试时间
function formatExamHistoryTime(row: any) {
  return row.examTime.toLocaleString();
}

// 获取考试状态标签
function getExamStatusLabel(status: string) {
  const labels = {
    open: '报名中',
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束'
  };
  return labels[status as keyof typeof labels];
}

// 获取考试状态类型
function getExamStatusType(status: string) {
  const types = {
    open: 'success',
    upcoming: 'warning',
    ongoing: 'danger',
    ended: ''
  };
  return types[status as keyof typeof types];
}

// 判断是否可以报名考试
function canRegisterExam(exam: any) {
  return exam.status === 'open';
}

// 报名考试
function registerExam(exam: any) {
  // 实现报名逻辑
  console.log('报名考试:', exam);
}

// 查看考试详情
function viewExamDetail(exam: any) {
  // 实现查看详情逻辑
  console.log('查看考试详情:', exam);
}

// 获取成绩显示样式
function getScoreClass(score: number) {
  if (score >= 90) return 'text-success font-bold';
  if (score >= 80) return 'text-primary font-bold';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
}

// 图书借阅系统
const selectedBooks = ref<Book[]>([]);
const borrowPlan = ref<BorrowPlan[]>([]);

function isBookSelected(book: Book): boolean {
  return selectedBooks.value.some(b => b.id === book.id);
}

function toggleBookSelection(book: Book) {
  const index = selectedBooks.value.findIndex(b => b.id === book.id);
  if (index === -1) {
    selectedBooks.value.push(book);
  } else {
    selectedBooks.value.splice(index, 1);
  }
  // 清空现有计划
  borrowPlan.value = [];
}

function generatePlan() {
  const plan = generateBorrowPlan(selectedBooks.value);
  console.log('Selected books:', selectedBooks.value);
  console.log('Generated plan:', plan);
  borrowPlan.value = plan;
  if (plan.length > 0) {
    ElMessage.success(`成功生成借阅计划，总计用时 ${getTotalDays()} 天`);
  } else {
    ElMessage.warning('无法生成有效的借阅计划，请重新选择书籍');
  }
}

function formatPlanTime(plan: BorrowPlan): string {
  if (plan.startDay === 0) {
    return `今天开始，持续 ${plan.book.readDays} 天`;
  }
  return `第 ${plan.startDay + 1} 天开始，持续 ${plan.book.readDays} 天`;
}

function getTotalDays(): number {
  if (borrowPlan.value.length === 0) return 0;
  return Math.max(...borrowPlan.value.map(p => p.endDay));
}

// 初始化课程数据
store.initializeCourses();
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:root {
  --el-color-primary: #6366f1;
  --el-color-primary-light-3: #818cf8;
  --el-color-primary-light-5: #a5b4fc;
  --el-color-primary-light-7: #c7d2fe;
  --el-color-primary-light-8: #ddd6fe;
  --el-color-primary-light-9: #e0e7ff;
  --el-color-primary-dark-2: #4f46e5;
}

.text-primary {
  color: var(--el-color-primary);
}

.el-header {
  height: 64px;
  line-height: 64px;
}

/* 移除容器的最大宽度限制 */
.el-container {
  max-width: none !important;
}

/* 确保内容区域占满宽度 */
.el-main > div {
  max-width: none !important;
}
</style>
