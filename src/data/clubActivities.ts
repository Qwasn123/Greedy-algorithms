import { ActivityType, ActivityFrequency, type ClubInfo, type Venue } from '../types/club';

// 定义场地
export const venues: Venue[] = [
  {
    name: "多功能教室A",
    capacity: 40,
    type: "classroom",
    facilities: ["投影仪", "音响", "空调"],
  },
  {
    name: "实验室",
    capacity: 30,
    type: "lab",
    facilities: ["电脑", "投影仪", "网络"],
  },
  {
    name: "音乐厅",
    capacity: 100,
    type: "music_hall",
    facilities: ["钢琴", "音响", "舞台"],
  },
  {
    name: "体育馆",
    capacity: 200,
    type: "gym",
    facilities: ["篮球场", "排球场", "器材室"],
  },
  {
    name: "舞蹈室",
    capacity: 30,
    type: "dance_room",
    facilities: ["镜墙", "把杆", "音响"],
  },
  {
    name: "美术室",
    capacity: 25,
    type: "art_room",
    facilities: ["画架", "水池", "储物柜"],
  }
];

// 定义可选的社团列表
export const availableClubs: ClubInfo[] = [
  {
    id: 1,
    name: "编程俱乐部",
    description: "学习最新的编程技术，开发有趣的项目",
    type: ActivityType.TECHNOLOGY,
    requiredVenue: ["lab", "classroom"],
    leader: "张三",
    maxMembers: 30,
    duration: 2,
    frequency: ActivityFrequency.WEEKLY
  },
  {
    id: 2,
    name: "篮球社",
    description: "提高篮球技巧，参加校际比赛",
    type: ActivityType.SPORTS,
    requiredVenue: ["gym"],
    leader: "李四",
    maxMembers: 25,
    duration: 2,
    frequency: ActivityFrequency.WEEKLY
  },
  {
    id: 3,
    name: "合唱团",
    description: "练习合唱，准备校园音乐会",
    type: ActivityType.ARTS,
    requiredVenue: ["music_hall"],
    leader: "王五",
    maxMembers: 40,
    duration: 2,
    frequency: ActivityFrequency.WEEKLY
  },
  {
    id: 4,
    name: "数学建模协会",
    description: "研究数学建模，参加数模竞赛",
    type: ActivityType.ACADEMIC,
    requiredVenue: ["classroom", "lab"],
    leader: "赵六",
    maxMembers: 20,
    duration: 2,
    frequency: ActivityFrequency.BIWEEKLY
  },
  {
    id: 5,
    name: "舞蹈社",
    description: "学习各种舞蹈，举办舞蹈表演",
    type: ActivityType.ARTS,
    requiredVenue: ["dance_room"],
    leader: "孙七",
    maxMembers: 20,
    duration: 1.5,
    frequency: ActivityFrequency.WEEKLY
  },
  {
    id: 6,
    name: "美术社",
    description: "学习绘画技巧，举办画展",
    type: ActivityType.ARTS,
    requiredVenue: ["art_room"],
    leader: "周八",
    maxMembers: 20,
    duration: 2,
    frequency: ActivityFrequency.WEEKLY
  },
  {
    id: 7,
    name: "辩论社",
    description: "提高口才和思辨能力",
    type: ActivityType.SOCIAL,
    requiredVenue: ["classroom"],
    leader: "吴九",
    maxMembers: 30,
    duration: 2,
    frequency: ActivityFrequency.WEEKLY
  },
  {
    id: 8,
    name: "摄影社",
    description: "学习摄影技巧，记录校园生活",
    type: ActivityType.ARTS,
    requiredVenue: ["classroom", "art_room"],
    leader: "郑十",
    maxMembers: 25,
    duration: 2,
    frequency: ActivityFrequency.BIWEEKLY
  }
];
