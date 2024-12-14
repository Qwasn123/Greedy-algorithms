<template>
  <div class="course-statistics">
    <el-card class="mb-4">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2"><PieChart /></el-icon>
          选课统计
        </div>
      </template>
      
      <!-- 总体统计 -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="text-center">
          <p class="text-gray-600 mb-1">已选课程</p>
          <p class="text-2xl font-bold text-primary">{{ selectedCoursesCount }}</p>
        </div>
        <div class="text-center">
          <p class="text-gray-600 mb-1">总学分</p>
          <p class="text-2xl font-bold text-success">{{ totalCredits }}</p>
        </div>
        <div class="text-center">
          <p class="text-gray-600 mb-1">平均学分</p>
          <p class="text-2xl font-bold text-warning">{{ averageCredits }}</p>
        </div>
      </div>

      <!-- 学分分布 -->
      <div class="mb-6">
        <h4 class="text-gray-600 mb-2">学分分布</h4>
        <div class="flex items-center gap-2 mb-2" v-for="credit in creditDistribution" :key="credit.value">
          <span class="w-16">{{ credit.value }}学分</span>
          <el-progress
            :percentage="credit.percentage"
            :format="(p) => `${credit.count}门 (${p}%)`"
            :color="credit.color"
          />
        </div>
      </div>

      <!-- 选课时段分布 -->
      <div>
        <h4 class="text-gray-600 mb-2">课程时段分布</h4>
        <el-table :data="scheduleDistribution" size="small">
          <el-table-column prop="day" label="星期" width="100" />
          <el-table-column prop="courses" label="课程">
            <template #default="{ row }">
              <el-tag
                v-for="course in row.courses"
                :key="course.id"
                class="mr-1"
                :type="getTagType(course.credits)"
              >
                {{ course.name }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PieChart } from '@element-plus/icons-vue';
import { useCourseStore } from '../stores/courseStore';
import type { Course } from '../types';

const store = useCourseStore();
const selectedCourses = computed(() => store.studentSelectedCourses);

// 基础统计
const selectedCoursesCount = computed(() => selectedCourses.value.length);
const totalCredits = computed(() => 
  selectedCourses.value.reduce((sum, course) => sum + course.credits, 0)
);
const averageCredits = computed(() => 
  selectedCoursesCount.value ? (totalCredits.value / selectedCoursesCount.value).toFixed(1) : '0.0'
);

// 学分分布统计
const creditDistribution = computed(() => {
  const distribution = new Map<number, number>();
  selectedCourses.value.forEach(course => {
    distribution.set(course.credits, (distribution.get(course.credits) || 0) + 1);
  });

  const colors = ['#409EFF', '#67C23A', '#E6A23C'];
  let index = 0;

  return Array.from(distribution.entries())
    .map(([value, count]) => {
      const percentage = (count / selectedCoursesCount.value) * 100;
      return {
        value,
        count,
        percentage,
        color: colors[index++ % colors.length]
      };
    })
    .sort((a, b) => b.value - a.value);
});

// 课程时段分布
const scheduleDistribution = computed(() => {
  const days = ['周一', '周二', '周三', '周四', '周五'];
  return days.map(day => ({
    day,
    courses: selectedCourses.value.filter(course => course.schedule.startsWith(day))
  }));
});

// 获取标签类型
const getTagType = (credits: number) => {
  switch (credits) {
    case 2: return 'info';
    case 3: return 'success';
    case 4: return 'warning';
    default: return '';
  }
};
</script>

<style scoped>
.course-statistics {
  padding: 20px;
}
</style>
