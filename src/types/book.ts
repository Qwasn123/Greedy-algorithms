export interface Book {
  id: number;
  title: string;
  author: string;
  availableIn: number; // 0表示立即可借，其他数字表示多少天后可借
  readDays: number; // 读完这本书需要的天数
}

export interface BorrowPlan {
  book: Book;
  startDay: number;
  endDay: number;
}
