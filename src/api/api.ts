/**
 * API 接口和通用方法集合
 */

import axios, { AxiosInstance } from 'axios';

// 创建axios实例
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 在这里可以添加token等认证信息
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

// 创建API实例
const api = createAxiosInstance('/api');

// 导出通用的HTTP方法
export const http = {
  get: <T>(url: string, params?: any) => api.get<T>(url, { params }),
  post: <T>(url: string, data?: any) => api.post<T>(url, data),
  put: <T>(url: string, data?: any) => api.put<T>(url, data),
  delete: <T>(url: string) => api.delete<T>(url),
};

// 工具函数
export const utils = {
  /**
   * 格式化日期
   * @param date - Date对象或时间戳
   * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
   */
  formatDate: (date: Date | number, format = 'YYYY-MM-DD HH:mm:ss'): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 防抖函数
   * @param fn - 需要防抖的函数
   * @param delay - 延迟时间（毫秒）
   */
  debounce: <T extends (...args: any[]) => any>(fn: T, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (this: any, ...args: Parameters<T>) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * 节流函数
   * @param fn - 需要节流的函数
   * @param limit - 时间限制（毫秒）
   */
  throttle: <T extends (...args: any[]) => any>(fn: T, limit: number) => {
    let inThrottle: boolean;
    return function (this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

export default {
  http,
  utils,
};
