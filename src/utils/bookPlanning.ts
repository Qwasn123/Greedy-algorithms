import type { Book, BorrowPlan } from '../types/book';

// 静态图书数据
export const books: Book[] = [
  // 计算机科学类
  {
    id: 1,
    title: '算法导论',
    author: 'Thomas H. Cormen',
    availableIn: 0, // 立即可借
    readDays: 14
  },
  {
    id: 2,
    title: '深入理解计算机系统',
    author: 'Randal E. Bryant',
    availableIn: 3,
    readDays: 10
  },
  {
    id: 3,
    title: '计算机网络：自顶向下方法',
    author: 'James F. Kurose',
    availableIn: 0,
    readDays: 7
  },
  {
    id: 4,
    title: '数据库系统概念',
    author: 'Abraham Silberschatz',
    availableIn: 5,
    readDays: 12
  },
  
  // 编程语言类
  {
    id: 5,
    title: '设计模式：可复用面向对象软件的基础',
    author: 'Erich Gamma',
    availableIn: 2,
    readDays: 8
  },
  {
    id: 6,
    title: 'JavaScript高级程序设计',
    author: 'Nicholas C. Zakas',
    availableIn: 0,
    readDays: 9
  },
  {
    id: 7,
    title: 'Python编程：从入门到实践',
    author: 'Eric Matthes',
    availableIn: 4,
    readDays: 6
  },
  
  // 数学类
  {
    id: 8,
    title: '线性代数及其应用',
    author: 'Gilbert Strang',
    availableIn: 1,
    readDays: 15
  },
  {
    id: 9,
    title: '概率论与数理统计',
    author: '陈希孺',
    availableIn: 0,
    readDays: 10
  },
  {
    id: 10,
    title: '离散数学及其应用',
    author: 'Kenneth H. Rosen',
    availableIn: 7,
    readDays: 12
  },

  // 人工智能类
  {
    id: 11,
    title: '深度学习',
    author: 'Ian Goodfellow',
    availableIn: 6,
    readDays: 20
  },
  {
    id: 12,
    title: '机器学习实战',
    author: 'Peter Harrington',
    availableIn: 0,
    readDays: 8
  },
  {
    id: 13,
    title: '强化学习导论',
    author: 'Richard S. Sutton',
    availableIn: 3,
    readDays: 16
  },

  // 软件工程类
  {
    id: 14,
    title: '代码大全',
    author: 'Steve McConnell',
    availableIn: 2,
    readDays: 11
  },
  {
    id: 15,
    title: '重构：改善既有代码的设计',
    author: 'Martin Fowler',
    availableIn: 0,
    readDays: 7
  },
  {
    id: 16,
    title: '敏捷软件开发：原则、模式与实践',
    author: 'Robert C. Martin',
    availableIn: 4,
    readDays: 9
  },

  // 网络安全类
  {
    id: 17,
    title: '密码编码学与网络安全',
    author: 'William Stallings',
    availableIn: 1,
    readDays: 13
  },
  {
    id: 18,
    title: '黑客攻防技术宝典',
    author: 'Stuart McClure',
    availableIn: 8,
    readDays: 15
  },
  {
    id: 19,
    title: 'Web安全测试指南',
    author: 'Peter Kim',
    availableIn: 0,
    readDays: 6
  },

  // 云计算和分布式系统
  {
    id: 20,
    title: '分布式系统：概念与设计',
    author: 'George Coulouris',
    availableIn: 5,
    readDays: 14
  },
  {
    id: 21,
    title: 'Docker实战',
    author: 'Jeff Nickoloff',
    availableIn: 0,
    readDays: 5
  },
  {
    id: 22,
    title: 'Kubernetes权威指南',
    author: 'Kelsey Hightower',
    availableIn: 2,
    readDays: 8
  }
];

function isValidPlan(plan: BorrowPlan[], newPlan: BorrowPlan): boolean {
  // 检查是否与现有计划有时间冲突
  return !plan.some(p => 
    (newPlan.startDay < p.endDay && newPlan.endDay > p.startDay)
  );
}

export function generateBorrowPlan(selectedBooks: Book[]): BorrowPlan[] {
  if (selectedBooks.length === 0) return [];
  
  const plans: BorrowPlan[][] = [];
  
  function backtrack(currentPlan: BorrowPlan[], remainingBooks: Book[], currentDay: number) {
    // 如果所有书都安排好了，保存这个计划
    if (remainingBooks.length === 0) {
      plans.push([...currentPlan].sort((a, b) => a.startDay - b.startDay));
      return;
    }

    // 尝试每本未安排的书
    for (let i = 0; i < remainingBooks.length; i++) {
      const book = remainingBooks[i];
      // 计算最早可以开始读这本书的时间
      const startDay = Math.max(currentDay, book.availableIn);
      const endDay = startDay + book.readDays;
      
      const newPlan: BorrowPlan = {
        book,
        startDay,
        endDay
      };

      // 如果这个安排是有效的
      if (isValidPlan(currentPlan, newPlan)) {
        // 添加这本书到当前计划
        currentPlan.push(newPlan);
        // 从剩余书籍中移除这本书
        const newRemainingBooks = remainingBooks.filter((_, index) => index !== i);
        // 递归安排剩余的书
        backtrack(currentPlan, newRemainingBooks, endDay);
        // 回溯：移除这本书，尝试其他可能性
        currentPlan.pop();
      }
    }
  }

  // 开始回溯
  backtrack([], selectedBooks, 0);

  // 如果找到了计划，返回总耗时最短的那个
  if (plans.length > 0) {
    console.log('Found plans:', plans.length);
    return plans.reduce((shortestPlan, currentPlan) => {
      const shortestTime = Math.max(...shortestPlan.map(p => p.endDay));
      const currentTime = Math.max(...currentPlan.map(p => p.endDay));
      return currentTime < shortestTime ? currentPlan : shortestPlan;
    }, plans[0]);
  }

  return [];
}
