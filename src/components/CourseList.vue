<template>
  <div class="course-list">
    <el-table :data="courses" stripe style="width: 100%">
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="teacher" label="任课教师" />
      <el-table-column prop="credits" label="学分" width="80" />
      <el-table-column prop="schedule" label="上课时间" />
      <el-table-column label="课程容量" width="180">
        <template #default="{ row }">
          <el-progress
            :percentage="(row.enrolled / row.capacity) * 100"
            :format="formatProgress"
            :status="row.enrolled >= row.capacity ? 'exception' : ''"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button
            v-if="!isSelected(row.id)"
            type="primary"
            :disabled="row.enrolled >= row.capacity"
            @click="selectCourse(row)"
          >
            选课
          </el-button>
          <el-button
            v-else
            type="danger"
            @click="withdrawCourse(row.id)"
          >
            退选
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 选课确认对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="选课确认"
      width="30%"
    >
      <div class="mb-4">
        <p class="mb-2">课程名称：{{ selectedCourse?.name }}</p>
        <p class="mb-2">任课教师：{{ selectedCourse?.teacher }}</p>
        <p>请选择优先级：</p>
        <el-rate
          v-model="priority"
          :max="3"
          :texts="['低', '中', '高']"
          show-text
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSelection">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCourseStore } from '../stores/courseStore';
import type { Course } from '../types';
import { ElMessage } from 'element-plus';

const store = useCourseStore();
const courses = computed(() => store.availableCourses);
const selectedCourses = computed(() => store.studentSelectedCourses);

const dialogVisible = ref(false);
const selectedCourse = ref<Course | null>(null);
const priority = ref(1);

// 格式化进度条显示
const formatProgress = (percentage: number, { row }: any) => {
  return `${row.enrolled}/${row.capacity}`;
};

// 检查课程是否已被选择
const isSelected = (courseId: number) => {
  return selectedCourses.value.some(course => course.id === courseId);
};

// 选择课程
const selectCourse = (course: Course) => {
  selectedCourse.value = course;
  priority.value = 1;
  dialogVisible.value = true;
};

// 确认选课
const confirmSelection = () => {
  if (selectedCourse.value) {
    store.submitCourseApplication(selectedCourse.value.id, priority.value);
    dialogVisible.value = false;
    ElMessage.success('选课申请已提交');
  }
};

// 退选课程
const withdrawCourse = (courseId: number) => {
  store.withdrawApplication(courseId);
  ElMessage.success('已成功退选');
};
</script>

<style scoped>
.course-list {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
