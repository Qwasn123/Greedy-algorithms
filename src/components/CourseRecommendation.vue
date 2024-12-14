<template>
  <div class="p-4">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-2">课程推荐</h2>
      <div class="flex items-center gap-4 mb-4">
        <div class="flex items-center gap-2">
          <span>目标学分：</span>
          <el-input-number
            v-model="targetCredits"
            :min="1"
            :max="30"
            :step="1"
            size="small"
          />
        </div>
        <div class="flex items-center gap-2">
          <span>偏向：</span>
          <el-select v-model="preferenceMode" size="small">
            <el-option label="按推荐指数" value="recommend" />
            <el-option label="按最少课程" value="minimum" />
          </el-select>
        </div>
      </div>

      <el-alert
        :title="recommendationSummary"
        type="success"
        :closable="false"
        class="mb-4"
      />
    </div>

    <el-table :data="recommendedCourses" stripe>
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
      <el-table-column label="学分" width="80" align="center">
        <template #default="{ row }">
          {{ row.credits }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCourseStore } from '../stores/courseStore'
import { recommendCourseSet } from '../utils/courseSelection'
import type { Course } from '../types'

const store = useCourseStore()
const preferenceMode = ref('recommend')
const targetCredits = ref(20)

// 获取推荐课程组合
const recommendation = computed(() => {
  return recommendCourseSet(
    store.courses,
    targetCredits.value,
    preferenceMode.value === 'recommend' ? 1 : 0
  )
})

// 推荐课程列表
const recommendedCourses = computed(() => recommendation.value.courses)

// 推荐结果摘要
const recommendationSummary = computed(() => {
  const { courses, totalCredits, totalWeight } = recommendation.value
  return `推荐 ${courses.length} 门课程，总学分 ${totalCredits}，平均推荐指数 ${(totalWeight / courses.length).toFixed(2)}`
})
</script>
