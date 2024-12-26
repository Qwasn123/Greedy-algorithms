# 爱心排课系统 

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-latest-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-latest-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 项目简介

爱心排课系统是一个现代化的课程管理和排课平台，旨在为教育机构提供智能、高效的课程安排解决方案。通过直观的界面和强大的功能，帮助教师和管理人员轻松完成排课任务。

### 项目目标

- 提供智能化的课程排期方案
- 优化教学资源分配
- 提高排课效率
- 减少课程冲突
- 增强用户体验

## 主要功能

### 智能排课系统
- 自动检测并避免课程冲突
- 智能分配教室资源
- 灵活调整课程时间
- 支持批量导入课程数据

### 课程推荐功能
- 基于学生选课历史的智能推荐
- 个性化课程建议
- 热门课程推荐
- 课程相似度分析

### 用户界面
- 响应式设计，完美适配各种设备
- 直观的拖拽操作界面
- 深色/浅色主题切换
- 自定义视图选项

### 数据统计分析
- 课程统计报表
- 教室使用率分析
- 教师课时统计
- 学生选课趋势分析

## 技术栈

### 前端技术
- **框架**: Vue 3 + Composition API
- **语言**: TypeScript
- **构建工具**: Vite
- **UI框架**: Tailwind CSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios

### 开发工具
- **代码规范**: ESLint + Prettier
- **版本控制**: Git
- **包管理器**: npm/yarn
- **开发工具**: VS Code

## 项目结构

```
aixinpaike/
├── src/
│   ├── components/        # 通用组件
│   ├── views/            # 页面组件
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── utils/            # 工具函数
│   ├── assets/           # 静态资源
│   └── App.vue           # 根组件
├── public/               # 公共资源
├── tests/                # 测试文件
└── package.json          # 项目配置
```

## 算法实现

系统采用多种高效算法来解决不同场景下的资源分配和调度问题：

### 活动调度算法 (Activity Scheduling)
- **贪心算法**: 用于社团活动的时间和场地分配
- **回溯算法**: 处理复杂的活动调度约束
- 主要功能：
  - 自动检测时间冲突
  - 优化场地利用率
  - 满足活动场地需求
  - 生成最优活动时间表

关键代码实现：
```typescript
// 贪心算法：尽可能多地安排活动
function scheduleActivitiesGreedy(
  activities: ScheduledActivity[],
  rooms: RoomSchedule
): ScheduledActivity[] {
  const scheduled: ScheduledActivity[] = [];
  const tempRooms = { ...rooms };
  
  // 遍历每个活动
  for (const activity of activities) {
    // 遍历每一天
    for (let day = 1; day <= 5 && !scheduled; day++) {
      // 遍历每个可能的开始时间
      for (let startTime = 8; startTime <= 17 && !scheduled; startTime++) {
        const endTime = startTime + activity.duration;
        // 尝试在每个房间安排
        for (const room in tempRooms) {
          if (canScheduleAtTime(activity, room, day, startTime, endTime, tempRooms)) {
            // 安排活动
            activity.assignedRoom = room;
            activity.schedule = { day, startTime, endTime };
            tempRooms[room].push(activity);
            scheduled = true;
            break;
          }
        }
      }
    }
  }
  return scheduled;
}
```

### 课程选择算法 (Course Selection)
- **贪心算法**: 实现课程分配和推荐
- 核心特性：
  - 基于优先级的课程分配
  - 自动处理时间冲突
  - 智能课程推荐
  - 学分优化分配

关键代码实现：
```typescript
export function allocateCourses(
  applications: CourseApplication[],
  courses: Map<number, Course>,
  students: Map<number, Student>
): CourseResult[] {
  // 按优先级和时间戳排序
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // 高优先级优先
    }
    return a.timestamp - b.timestamp; // 早提交优先
  });

  const results: CourseResult[] = [];
  const courseEnrollments = new Map<number, number>();
  const studentSelections = new Map<number, number[]>();

  // 处理每个申请
  for (const app of sortedApplications) {
    const course = courses.get(app.courseId);
    const student = students.get(app.studentId);
    
    // 检查课程容量和时间冲突
    if (isValidSelection(course, student, courseEnrollments, studentSelections)) {
      // 分配课程
      courseEnrollments.set(app.courseId, courseEnrollments.get(app.courseId)! + 1);
      studentSelections.get(app.studentId)!.push(app.courseId);
      results.push({ status: 'success' });
    }
  }
  return results;
}
```

### 图书借阅规划 (Book Planning)
- **回溯算法**: 生成最优借阅计划
- 关键功能：
  - 借阅时间冲突检测
  - 借阅周期优化
  - 资源利用最大化

关键代码实现：
```typescript
function generateBorrowPlan(selectedBooks: Book[]): BorrowPlan[] {
  const plan: BorrowPlan[] = [];
  let currentDay = 0;

  for (const book of selectedBooks) {
    // 找到最早可借时间
    while (!isValidPlan(plan, { 
      bookId: book.id,
      startDay: currentDay + book.availableIn,
      endDay: currentDay + book.availableIn + book.readDays 
    })) {
      currentDay++;
    }

    // 添加到借阅计划
    plan.push({
      bookId: book.id,
      startDay: currentDay + book.availableIn,
      endDay: currentDay + book.availableIn + book.readDays
    });
  }

  return plan;
}
```

### 课程分配算法 (Course Allocation)
- **贪心算法**: 教室和时间段分配
- 实现特点：
  - 教室容量优化
  - 时间段合理分配
  - 教学资源最大化利用

### 课程推荐系统 (Course Recommendation)
- **基于权重的贪心算法**
- 推荐特性：
  - 个性化课程推荐
  - 学分要求优化
  - 兴趣匹配度计算

关键代码实现：
```typescript
function recommendCourseSet(
  courses: Course[],
  targetCredits: number,
  preferenceMode: 'recommend' | 'minimum' = 'recommend'
): { courses: Course[]; totalCredits: number; totalWeight: number } {
  // 计算每门课程的权重
  const weightedCourses = courses.map(course => ({
    ...course,
    weight: calculateCourseWeight(course, preferenceMode)
  }));

  // 按权重排序
  weightedCourses.sort((a, b) => b.weight - a.weight);

  const selectedCourses: Course[] = [];
  let totalCredits = 0;
  let totalWeight = 0;

  // 贪心选择课程
  for (const course of weightedCourses) {
    if (totalCredits + course.credits <= targetCredits) {
      selectedCourses.push(course);
      totalCredits += course.credits;
      totalWeight += course.weight;
    }
  }

  return { courses: selectedCourses, totalCredits, totalWeight };
}
```

## 系统要求

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本
- 现代浏览器（Chrome, Firefox, Safari, Edge）
- 推荐系统内存 8GB 或更高

## 快速开始

### 环境准备
确保已安装 Node.js 和 npm

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 使用指南

### 1. 系统配置
- 登录管理员账号
- 配置基本参数
- 导入课程数据

### 2. 日常使用
- 浏览课程列表
- 使用智能推荐功能
- 查看和管理课程表
- 导出课程安排

### 3. 高级功能
- 自定义课程模板
- 批量处理课程
- 生成统计报表
- 导出数据分析

## 贡献指南

我们非常欢迎社区贡献！以下是参与项目的方式：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 贡献类型
- 🐛 Bug修复
- ✨ 新功能
- 📝 文档改进
- 🎨 代码格式化
- ⚡️ 性能改进

## 开源协议

本项目基于 MIT 协议开源，详情请参阅 [LICENSE](LICENSE) 文件。

## 联系我们

如有任何问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发送 Pull Request
- 项目讨论区留言

## 致谢

感谢所有为这个项目做出贡献的开发者！

## 图书借阅系统

### 说明
图书借阅系统是爱心排课系统的一个重要组成部分，旨在为学生和教师提供便捷的图书借阅服务。系统支持多种图书分类，包括计算机、数学、人工智能等。借阅计划生成采用回溯算法，确保最优借阅时间和避免冲突。

### 功能
- 图书分类浏览
- 借阅计划生成
- 借阅时间线可视化
- 借阅冲突避免

### 使用指南
1. 浏览图书分类
2. 选择要借阅的图书
3. 生成借阅计划
4. 查看借阅时间线
