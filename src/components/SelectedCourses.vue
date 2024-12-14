<template>
  <div class="selected-courses">
    <!-- 统计图表 -->
    <div class="mb-6 bg-white p-4 rounded-lg">
      <h3 class="text-lg font-bold mb-4">课程统计</h3>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="stat-card">
          <div class="text-gray-600">已选课程数</div>
          <div class="text-2xl font-bold">{{ selectedCourses.length }}</div>
        </div>
        <div class="stat-card">
          <div class="text-gray-600">总学分</div>
          <div class="text-2xl font-bold">{{ totalCredits }}</div>
        </div>
        <div class="stat-card">
          <div class="text-gray-600">平均推荐指数</div>
          <div class="text-2xl font-bold">{{ averageRecommendIndex }}</div>
        </div>
      </div>
      <div ref="chartRef" style="width: 100%; height: 300px;"></div>
    </div>

    <!-- 课程列表 -->
    <el-table 
      :data="selectedCourses" 
      stripe 
      style="width: 100%"
      :empty-text="'暂无已选课程'"
    >
      <el-table-column prop="name" label="课程名称" min-width="150" />
      <el-table-column prop="credits" label="学分" width="80" align="center" />
      <el-table-column prop="teacher" label="教师" width="120" align="center" />
      <el-table-column label="上课时间" min-width="120">
        <template #default="{ row }">
          <div v-for="timeSlot in row.timeSlots" :key="`${timeSlot.day}-${timeSlot.period.join(',')}`">
            周{{ ['一', '二', '三', '四', '五'][timeSlot.day - 1] }} {{ timeSlot.period.join(',') }}节
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button
            type="danger"
            size="small"
            @click="handleWithdraw(row)"
          >
            退选
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useCourseStore } from '../stores/courseStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';

const store = useCourseStore();
const selectedCourses = computed(() => store.studentSelectedCourses);
const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

// 计算统计数据
const totalCredits = computed(() => 
  selectedCourses.value.reduce((sum, course) => sum + course.credits, 0)
);

const averageRecommendIndex = computed(() => {
  if (selectedCourses.value.length === 0) return 0;
  const total = selectedCourses.value.reduce((sum, course) => sum + course.recommendIndex, 0);
  return (total / selectedCourses.value.length).toFixed(1);
});

// 计算累计学分
const cumulativeCredits = computed(() => {
  let total = 0;
  const data = selectedCourses.value.map(course => {
    total += course.credits;
    return {
      name: course.name,
      credits: total
    };
  });
  return {
    names: data.map(item => item.name),
    credits: data.map(item => item.credits)
  };
});

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  chart = echarts.init(chartRef.value);
  updateChart();
};

// 更新图表数据
const updateChart = () => {
  if (!chart) return;

  const { names, credits } = cumulativeCredits.value;
  const option = {
    title: {
      text: '累计学分走势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const dataIndex = params[0].dataIndex;
        const courseName = names[dataIndex];
        const currentCredits = selectedCourses.value[dataIndex].credits;
        const totalCredits = credits[dataIndex];
        return `${courseName}<br/>本课程学分：${currentCredits}<br/>累计学分：${totalCredits}`;
      },
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        interval: 0,
        rotate: 30
      },
      axisLine: {
        lineStyle: {
          color: '#666'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '累计学分',
      minInterval: 1,
      min: 0,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#666'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#ddd',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '累计学分',
        type: 'line',
        data: credits,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#6366f1'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(99, 102, 241, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(99, 102, 241, 0.1)'
            }
          ])
        }
      }
    ],
    grid: {
      bottom: 80
    }
  };

  chart.setOption(option);
};

// 监听选课变化，更新图表
watch(selectedCourses, () => {
  updateChart();
});

// 处理窗口大小变化
const handleResize = () => {
  chart?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  chart?.dispose();
  window.removeEventListener('resize', handleResize);
});

const handleWithdraw = async (course: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要退选 ${course.name} 吗？`,
      '退选确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    store.withdrawApplication(course.id);
    ElMessage.success(`已成功退选：${course.name}`);
  } catch {
    // User canceled
  }
};

defineEmits(['switch-view']);
</script>

<style scoped>
.selected-courses {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-row-hover-bg-color: var(--el-fill-color);
}

:deep(.el-button--danger) {
  --el-button-bg-color: #ef4444;
  --el-button-border-color: #ef4444;
  --el-button-hover-bg-color: #f87171;
  --el-button-hover-border-color: #f87171;
}
</style>