export enum ActivityType {
  ACADEMIC = 'ACADEMIC',
  SPORTS = 'SPORTS',
  ARTS = 'ARTS',
  TECHNOLOGY = 'TECHNOLOGY',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER'
}

export enum ActivityFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  ONCE = 'ONCE'
}

// 活动的时间安排
export interface ActivitySchedule {
  day?: number;        // 可选，由系统分配
  startTime?: number;  // 可选，由系统分配
  endTime?: number;    // 可选，由系统分配
  duration: number;    // 活动持续时间（小时）
  frequency: ActivityFrequency;
}

// 社团基本信息
export interface ClubInfo {
  id: number;
  name: string;
  description: string;
  type: ActivityType;
  requiredVenue: string[];  // 需要的场地类型列表
  leader: string;
  maxMembers: number;
  duration: number;         // 每次活动持续时间
  frequency: ActivityFrequency;
}

// 已安排时间的社团活动
export interface ClubActivity extends ClubInfo {
  schedule: ActivitySchedule;
  assignedRoom?: string;
}

// 场地信息
export interface Venue {
  name: string;
  capacity: number;
  type: string;      // 场地类型（如：教室、体育馆、音乐厅等）
  facilities: string[];
  availableTimeSlots?: {
    day: number;
    slots: { start: number; end: number; }[];
  }[];
}
