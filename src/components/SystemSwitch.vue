<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm h-16">
      <div class="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-900">校园管理系统</h1>
        <div class="flex space-x-4">
          <button
            @click="currentSystem = 'course'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium',
              currentSystem === 'course'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            选课系统
          </button>
          <button
            @click="currentSystem = 'club'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium',
              currentSystem === 'club'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            社团活动
          </button>
          <button
            @click="currentSystem = 'library'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium',
              currentSystem === 'library'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            图书借阅
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div v-if="currentSystem === 'course'">
        <slot name="course-content"></slot>
      </div>

      <div v-else-if="currentSystem === 'club'" class="space-y-6">
        <!-- 活动类型筛选 -->
        <div class="flex space-x-4 mb-4">
          <button
            v-for="type in activityTypes"
            :key="type.value"
            @click="filterByType(type.value)"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium',
              selectedType === type.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ type.label }}
          </button>
        </div>

        <!-- 可选社团列表 -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="club in filteredClubs"
            :key="club.id"
            class="bg-white overflow-hidden shadow rounded-lg"
          >
            <div class="p-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">{{ club.name }}</h3>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getActivityTypeClass(club.type)
                  ]"
                >
                  {{ getActivityTypeLabel(club.type) }}
                </span>
              </div>
              <p class="mt-2 text-sm text-gray-500">{{ club.description }}</p>
              <div class="mt-4">
                <p class="text-sm text-gray-500">社长：{{ club.leader }}</p>
                <p class="text-sm text-gray-500">
                  人数上限：{{ club.maxMembers }}
                </p>
                <p class="text-sm text-gray-500">
                  活动时长：{{ club.duration }}小时
                </p>
                <p class="text-sm text-gray-500">
                  场地要求：{{ club.requiredVenue.join('、') }}
                </p>
              </div>
              <div class="mt-4">
                <button
                  @click="toggleClubSelection(club)"
                  :class="[
                    'w-full px-4 py-2 rounded-md text-sm font-medium',
                    selectedClubs.some(c => c.id === club.id)
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  ]"
                >
                  {{ selectedClubs.some(c => c.id === club.id) ? '取消选择' : '选择' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 安排按钮 -->
        <div class="flex justify-center mt-6">
          <button
            @click="scheduleSelectedActivities"
            class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            :disabled="selectedClubs.length === 0"
          >
            安排活动时间
          </button>
        </div>

        <!-- 已安排的活动列表 -->
        <div v-if="scheduledActivities.length > 0" class="mt-8">
          <h2 class="text-xl font-semibold mb-4">已安排的活动</h2>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="activity in scheduledActivities"
              :key="activity.id"
              class="bg-white overflow-hidden shadow rounded-lg"
            >
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ activity.name }}
                  </h3>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getActivityTypeClass(activity.type)
                    ]"
                  >
                    {{ getActivityTypeLabel(activity.type) }}
                  </span>
                </div>
                <div class="mt-4 space-y-2">
                  <p class="text-sm text-gray-500">
                    时间：{{ formatSchedule(activity.schedule) }}
                  </p>
                  <p class="text-sm text-gray-500">
                    地点：{{ activity.assignedRoom }}
                  </p>
                  <p class="text-sm text-gray-500">
                    人数上限：{{ activity.maxMembers }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentSystem === 'library'" class="space-y-6">
        <slot name="library-content"></slot>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ClubActivity, ClubInfo } from '../types/club';
import { ActivityType, ActivityFrequency } from '../types/club';
import { scheduleActivities } from '../utils/activityScheduling';
import { availableClubs, venues } from '../data/clubActivities';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: string
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();

const currentSystem = computed({
  get: () => props.modelValue || 'course',
  set: (value) => emit('update:modelValue', value)
});

const activityTypes = [
  { label: '全部', value: 'all' },
  { label: '学术', value: ActivityType.ACADEMIC },
  { label: '体育', value: ActivityType.SPORTS },
  { label: '艺术', value: ActivityType.ARTS },
  { label: '科技', value: ActivityType.TECHNOLOGY },
  { label: '社交', value: ActivityType.SOCIAL },
  { label: '其他', value: ActivityType.OTHER }
];

const selectedType = ref('all');
const selectedClubs = ref<ClubInfo[]>([]); // 已选择的社团
const scheduledActivities = ref<ClubActivity[]>([]); // 已安排时间的活动

// 初始化场地和活动
const rooms = ref(venues.reduce((acc, venue) => {
  acc[venue.name] = [];
  return acc;
}, {} as { [key: string]: ClubActivity[] }));

// 根据类型筛选可选社团
const filteredClubs = computed(() => {
  if (selectedType.value === 'all') {
    return availableClubs;
  }
  return availableClubs.filter(club => club.type === selectedType.value);
});

function filterByType(type: string) {
  selectedType.value = type;
}

// 选择或取消选择社团
function toggleClubSelection(club: ClubInfo) {
  const index = selectedClubs.value.findIndex(c => c.id === club.id);
  if (index === -1) {
    selectedClubs.value.push(club);
  } else {
    selectedClubs.value.splice(index, 1);
  }
}

// 将社团信息转换为活动
function createActivitiesFromClubs(clubs: ClubInfo[]): ClubActivity[] {
  return clubs.map(club => ({
    ...club,
    schedule: {
      duration: club.duration,
      frequency: club.frequency
    }
  }));
}

// 安排活动时间
function scheduleSelectedActivities() {
  if (selectedClubs.value.length === 0) {
    ElMessage.warning('请先选择要安排的社团');
    return;
  }

  // 创建活动列表
  const activitiesToSchedule = createActivitiesFromClubs(selectedClubs.value);
  
  // 清空当前安排
  for (const room in rooms.value) {
    rooms.value[room] = [];
  }
  
  // 安排活动
  const result = scheduleActivities(activitiesToSchedule, rooms.value);
  
  if (result.length === activitiesToSchedule.length) {
    scheduledActivities.value = result;
    ElMessage.success('所有活动安排成功！');
  } else {
    scheduledActivities.value = result;
    ElMessage.warning(`已安排 ${result.length}/${activitiesToSchedule.length} 个活动，部分活动因时间或场地冲突未能安排`);
  }
}

function formatSchedule(schedule: ClubActivity['schedule']) {
  if (!schedule.day || !schedule.startTime || !schedule.endTime) {
    return '未安排时间';
  }
  
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const frequency = {
    [ActivityFrequency.WEEKLY]: '每周',
    [ActivityFrequency.BIWEEKLY]: '每两周',
    [ActivityFrequency.MONTHLY]: '每月',
    [ActivityFrequency.ONCE]: '一次性'
  };
  
  return `${frequency[schedule.frequency]} ${days[schedule.day - 1]} ${formatTime(schedule.startTime)}-${formatTime(schedule.endTime)}`;
}

function formatTime(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function getActivityTypeLabel(type: ActivityType) {
  const labels = {
    [ActivityType.ACADEMIC]: '学术',
    [ActivityType.SPORTS]: '体育',
    [ActivityType.ARTS]: '艺术',
    [ActivityType.TECHNOLOGY]: '科技',
    [ActivityType.SOCIAL]: '社交',
    [ActivityType.OTHER]: '其他'
  };
  return labels[type];
}

function getActivityTypeClass(type: ActivityType) {
  const classes = {
    [ActivityType.ACADEMIC]: 'bg-blue-100 text-blue-800',
    [ActivityType.SPORTS]: 'bg-green-100 text-green-800',
    [ActivityType.ARTS]: 'bg-purple-100 text-purple-800',
    [ActivityType.TECHNOLOGY]: 'bg-indigo-100 text-indigo-800',
    [ActivityType.SOCIAL]: 'bg-yellow-100 text-yellow-800',
    [ActivityType.OTHER]: 'bg-gray-100 text-gray-800'
  };
  return classes[type];
}
</script>