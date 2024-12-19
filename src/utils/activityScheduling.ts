import type { ClubActivity, Venue } from '../types/club';
import { venues } from '../data/clubActivities';

interface ScheduledActivity extends ClubActivity {
  assignedRoom?: string;
}

interface RoomSchedule {
  [key: string]: ScheduledActivity[];
}

// 检查活动是否可以安排在指定时间段
function canScheduleAtTime(
  activity: ScheduledActivity,
  room: string,
  day: number,
  startTime: number,
  endTime: number,
  roomSchedule: RoomSchedule
): boolean {
  // 检查房间类型是否匹配
  const venue = venues.find(v => v.name === room);
  if (!venue || !activity.requiredVenue.includes(venue.type)) {
    return false;
  }

  // 检查每个已安排的活动是否有时间冲突
  for (let scheduledActivity of (roomSchedule[room] || [])) {
    if (scheduledActivity.schedule.day === day) {
      const schedStart = scheduledActivity.schedule.startTime!;
      const schedEnd = scheduledActivity.schedule.endTime!;
      
      // 检查时间是否重叠
      if ((startTime >= schedStart && startTime < schedEnd) ||
          (endTime > schedStart && endTime <= schedEnd) ||
          (startTime <= schedStart && endTime >= schedEnd)) {
        return false;
      }
    }
  }
  return true;
}

// 递归函数：尝试为每个活动找到合适的时间和房间
function scheduleActivitiesRecursive(
  remainingActivities: ScheduledActivity[],
  currentActivity: ScheduledActivity,
  rooms: RoomSchedule,
  scheduled: ScheduledActivity[],
  depth: number = 0
): ScheduledActivity[] | null {
  console.log(`${' '.repeat(depth * 2)}尝试安排活动: ${currentActivity.name}`);

  // 遍历每一天
  for (let day = 1; day <= 5; day++) { // 周一到周五
    // 遍历每个可能的开始时间（8:00 - 17:00）
    for (let startTime = 8; startTime <= 17; startTime++) {
      const endTime = startTime + currentActivity.duration;
      if (endTime > 18) continue; // 确保活动在18:00前结束

      // 尝试在每个房间安排
      for (let room in rooms) {
        console.log(`${' '.repeat(depth * 2)}检查房间: ${room}, 时间: 周${day} ${startTime}:00-${endTime}:00`);
        
        if (canScheduleAtTime(currentActivity, room, day, startTime, endTime, rooms)) {
          console.log(`${' '.repeat(depth * 2)}找到可用时间段，安排在 ${room}`);
          
          // 临时保存当前状态
          const tempScheduled = [...scheduled];
          const tempRooms = { ...rooms };
          
          // 安排当前活动
          currentActivity.assignedRoom = room;
          currentActivity.schedule = {
            ...currentActivity.schedule,
            day,
            startTime,
            endTime,
          };
          
          if (!tempRooms[room]) {
            tempRooms[room] = [];
          }
          tempRooms[room] = [...tempRooms[room], currentActivity];
          tempScheduled.push(currentActivity);
          
          // 如果所有活动都已安排完成
          if (remainingActivities.length === 0) {
            console.log(`${' '.repeat(depth * 2)}所有活动安排完成!`);
            return tempScheduled;
          }
          
          // 递归安排剩余活动
          const nextActivity = remainingActivities[0];
          const result = scheduleActivitiesRecursive(
            remainingActivities.slice(1),
            nextActivity,
            tempRooms,
            tempScheduled,
            depth + 1
          );
          
          // 如果找到解决方案
          if (result) {
            return result;
          }
          
          // 如果没有找到解决方案，回溯
          console.log(`${' '.repeat(depth * 2)}无法安排剩余活动，回溯...`);
        }
      }
    }
  }
  
  // 在当前房间无法安排活动，返回 null
  console.log(`${' '.repeat(depth * 2)}无法在任何时间安排活动 ${currentActivity.name}`);
  return null;
}

// 主函数：安排所有活动
export function scheduleActivities(
  activities: ScheduledActivity[],
  rooms: RoomSchedule
): ScheduledActivity[] {
  console.log('开始安排活动...');
  console.log(`总活动数: ${activities.length}`);
  console.log(`可用房间: ${Object.keys(rooms).join(', ')}`);
  
  if (activities.length === 0) {
    return [];
  }
  
  // 按持续时间排序活动，优先安排时间长的活动
  const sortedActivities = [...activities].sort((a, b) => b.duration - a.duration);
  
  console.log('活动已按持续时间排序');
  
  // 开始递归安排
  const result = scheduleActivitiesRecursive(
    sortedActivities.slice(1),
    sortedActivities[0],
    rooms,
    [],
    0
  );
  
  // 如果找到解决方案，返回结果
  if (result) {
    console.log('成功安排所有活动！');
    return result;
  }
  
  // 如果无法安排所有活动，尝试贪心算法
  console.log('无法安排所有活动，使用贪心算法...');
  return scheduleActivitiesGreedy(sortedActivities, rooms);
}

// 贪心算法：尽可能多地安排活动
function scheduleActivitiesGreedy(
  activities: ScheduledActivity[],
  rooms: RoomSchedule
): ScheduledActivity[] {
  const scheduled: ScheduledActivity[] = [];
  const tempRooms = { ...rooms };
  
  // 遍历每个活动
  for (const activity of activities) {
    let scheduled = false;
    
    // 遍历每一天
    for (let day = 1; day <= 5 && !scheduled; day++) {
      // 遍历每个可能的开始时间
      for (let startTime = 8; startTime <= 17 && !scheduled; startTime++) {
        const endTime = startTime + activity.duration;
        if (endTime > 18) continue;
        
        // 尝试在每个房间安排
        for (const room in tempRooms) {
          if (canScheduleAtTime(activity, room, day, startTime, endTime, tempRooms)) {
            // 安排活动
            activity.assignedRoom = room;
            activity.schedule = {
              ...activity.schedule,
              day,
              startTime,
              endTime,
            };
            
            if (!tempRooms[room]) {
              tempRooms[room] = [];
            }
            tempRooms[room].push(activity);
            scheduled = true;
            console.log(`贪心算法：成功安排活动 ${activity.name} 在 ${room} 周${day} ${startTime}:00-${endTime}:00`);
            break;
          }
        }
      }
    }
    
    if (scheduled) {
      scheduled.push(activity);
    }
  }
  
  console.log(`贪心算法：共安排了 ${scheduled.length}/${activities.length} 个活动`);
  return scheduled;
}

// 检查活动是否可以安排在指定房间的时间段
export function canSchedule(activity: ScheduledActivity, roomSchedule: ScheduledActivity[]): boolean {
  // 检查每个已安排的活动是否有时间冲突
  for (let scheduledActivity of roomSchedule) {
    // 确保活动在同一天
    if (activity.schedule.day !== scheduledActivity.schedule.day) continue;

    // 检查时间是否重叠
    if ((activity.schedule.startTime >= scheduledActivity.schedule.startTime && 
         activity.schedule.startTime < scheduledActivity.schedule.endTime) ||
        (activity.schedule.endTime > scheduledActivity.schedule.startTime && 
         activity.schedule.endTime <= scheduledActivity.schedule.endTime)) {
      return false;
    }
  }
  return true;
}

// 获取可用的时间段
export function getAvailableTimeSlots(
  room: string,
  day: number,
  roomSchedule: RoomSchedule,
  minDuration: number = 1
): { start: number, end: number }[] {
  const busySlots = roomSchedule[room]
    .filter(activity => activity.schedule.day === day)
    .map(activity => ({
      start: activity.schedule.startTime,
      end: activity.schedule.endTime
    }))
    .sort((a, b) => a.start - b.start);

  const availableSlots: { start: number, end: number }[] = [];
  let currentTime = 8; // 假设一天从早上8点开始

  // 检查每个忙碌时间段之间的空闲时间
  for (const slot of busySlots) {
    if (slot.start - currentTime >= minDuration) {
      availableSlots.push({
        start: currentTime,
        end: slot.start
      });
    }
    currentTime = slot.end;
  }

  // 检查最后一个忙碌时间段之后到晚上的时间
  if (22 - currentTime >= minDuration) { // 假设一天到晚上10点结束
    availableSlots.push({
      start: currentTime,
      end: 22
    });
  }

  return availableSlots;
}
