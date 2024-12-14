<template>
  <div class="h-full">
    <el-table 
      :data="store.courses" 
      stripe 
      style="width: 100%"
    >
      <el-table-column prop="name" label="课程名称" min-width="120" />
      <el-table-column label="推荐指数" width="150">
        <template #default="{ row }">
          <el-rate
            v-model="row.recommendIndex"
            disabled
            show-score
            text-color="#ff9900"
          />
        </template>
      </el-table-column>
      <el-table-column prop="teacher" label="任课教师" width="100" />
      <el-table-column prop="credits" label="学分" width="80" align="center" />
      <el-table-column label="上课时间" width="120">
        <template #default="{ row }">
          {{ row.schedule.replace('节', '') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="handleSelect(row)"
            :disabled="isSelected(row)"
          >
            {{ isSelected(row) ? '已选' : '选课' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { useCourseStore } from '../stores/courseStore'
import { ElMessage } from 'element-plus'
import type { Course } from '../types'

const store = useCourseStore()

const isSelected = (course: Course) => {
  return store.studentSelectedCourses.some(c => c.id === course.id)
}

const handleSelect = async (course: Course) => {
  try {
    if (store.submitCourseApplication(course.id, 1)) {
      store.processApplications()
      ElMessage.success(`成功选择课程：${course.name}`)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '选课失败')
  }
}
</script>

<style scoped>
:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-row-hover-bg-color: var(--el-fill-color);
}

:deep(.el-button--primary) {
  --el-button-bg-color: #6366f1;
  --el-button-border-color: #6366f1;
  --el-button-hover-bg-color: #818cf8;
  --el-button-hover-border-color: #818cf8;
}

:deep(.el-rate) {
  display: inline-flex;
  height: 20px;
}

:deep(.el-rate__icon) {
  font-size: 14px;
  margin-right: 2px;
}
</style>
