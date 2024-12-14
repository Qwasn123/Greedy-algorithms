<template>
  <el-dialog
    v-model="visible"
    :title="course?.name"
    width="50%"
    destroy-on-close
  >
    <div class="course-detail">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程名称">{{ course?.name }}</el-descriptions-item>
        <el-descriptions-item label="任课教师">{{ course?.teacher }}</el-descriptions-item>
        <el-descriptions-item label="学分">{{ course?.credits }}</el-descriptions-item>
        <el-descriptions-item label="上课时间">{{ course?.schedule }}</el-descriptions-item>
        <el-descriptions-item label="课程容量">
          <el-progress
            :percentage="(course?.enrolled || 0) / (course?.capacity || 1) * 100"
            :format="() => `${course?.enrolled}/${course?.capacity}`"
            :status="(course?.enrolled || 0) >= (course?.capacity || 0) ? 'exception' : ''"
          />
        </el-descriptions-item>
        <el-descriptions-item label="选课状态">
          <el-tag :type="isSelected ? 'success' : (course?.enrolled >= course?.capacity ? 'danger' : 'info')">
            {{ isSelected ? '已选' : (course?.enrolled >= course?.capacity ? '已满' : '可选') }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">课程简介</h4>
        <p class="text-gray-600">{{ course?.description }}</p>
      </div>

      <div class="mt-4" v-if="!isSelected && course?.enrolled < course?.capacity">
        <h4 class="font-semibold mb-2">选课优先级</h4>
        <el-rate
          v-model="priority"
          :max="3"
          :texts="['低', '中', '高']"
          show-text
        />
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button
          v-if="!isSelected && course?.enrolled < course?.capacity"
          type="primary"
          @click="handleSelect"
        >
          确认选课
        </el-button>
        <el-button
          v-if="isSelected"
          type="danger"
          @click="handleWithdraw"
        >
          退选课程
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Course } from '../types';
import { useCourseStore } from '../stores/courseStore';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  visible: boolean;
  course: Course | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'refresh'): void;
}>();

const store = useCourseStore();
const priority = ref(1);

const isSelected = computed(() => {
  if (!props.course) return false;
  return store.studentSelectedCourses.some(c => c.id === props.course?.id);
});

const closeDialog = () => {
  emit('update:visible', false);
};

const handleSelect = () => {
  if (props.course) {
    store.submitCourseApplication(props.course.id, priority.value);
    ElMessage.success('选课申请已提交');
    emit('refresh');
    closeDialog();
  }
};

const handleWithdraw = () => {
  if (props.course) {
    store.withdrawApplication(props.course.id);
    ElMessage.success('已成功退选');
    emit('refresh');
    closeDialog();
  }
};

watch(() => props.visible, (newVal) => {
  if (newVal) {
    priority.value = 1;
  }
});
</script>

<style scoped>
.course-detail {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
