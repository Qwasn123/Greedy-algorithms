<template>
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

      <!-- 三栏布局 -->
      <div class="grid grid-cols-12 gap-4" v-if="activeView === 'courses'">
        <!-- 左侧推荐区域 -->
        <div class="col-span-4 bg-white rounded-lg shadow">
          <CourseRecommendation />
        </div>

        <!-- 中间课程列表 -->
        <div class="col-span-8 bg-white rounded-lg shadow">
          <CourseTable />
        </div>
      </div>

      <!-- 已选课程视图 -->
      <div v-else-if="activeView === 'selected'" class="bg-white rounded-lg shadow">
        <SelectedCourses />
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { School, List, Collection, User, ArrowDown } from '@element-plus/icons-vue'
import CourseTable from './components/CourseTable.vue'
import SelectedCourses from './components/SelectedCourses.vue'
import CourseRecommendation from './components/CourseRecommendation.vue'
import { useCourseStore } from './stores/courseStore'

const store = useCourseStore()
const activeView = ref('courses')

// 初始化课程数据
store.initializeCourses()
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
