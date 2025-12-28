import { ApiResponse } from '@/types/types';
import { authRequest } from './base';

/**
 * 活动接口类型定义
 */
export interface Activity {
  id: number;
  title: string;
  intro: string;
  limit: number;
  start_time: number;
  end_time: number;
  award: string;
  detail: string;
  status: number; // 0: 正常, 1: 关闭
}

/**
 * 更新活动数据接口
 */
export interface UpdateActivityData {
  title?: string;
  intro?: string;
  limit?: number;
  start_time?: number;
  end_time?: number;
  award?: string;
  detail?: string;
}

/**
 * 更新活动状态参数
 */
export interface UpdateActivityStatusParams {
  id: number;
  status: number;
}

/**
 * 创建活动请求参数
 */
export interface CreateActivityParams {
  title: string;
  intro: string;
  limit: number;
  start_time: number;
  end_time: number;
  award: string;
  detail: string;
}

/**
 * 活动管理API
 */
export const activityAPI = {
  /**
   * 获取活动列表
   * @returns 活动列表
   */
  getList: async (): Promise<{
    success: boolean;
    data?: Activity[];
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/activity',
        method: 'GET'
      })) as ApiResponse<Activity[]>;

      if (result.code === 200) {
        // 确保返回的是数组，如果不是则转换为空数组
        const activities = Array.isArray(result.data) ? result.data : [];

        return {
          success: true,
          data: activities
        };
      } else {
        return {
          success: false,
          message: result.message ?? '获取活动列表失败'
        };
      }
    } catch (error) {
      console.error('获取活动列表API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 创建活动
   * @param data 创建数据
   * @returns 创建结果
   */
  create: async (
    data: CreateActivityParams
  ): Promise<{
    success: boolean;
    data?: Activity;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/activity',
        method: 'POST',
        data
      })) as ApiResponse<Activity>;

      if (result.code === 200 || result.code === 201) {
        return {
          success: true,
          data: result.data,
          message: result.message ?? '创建活动成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '创建活动失败'
        };
      }
    } catch (error) {
      console.error('创建活动API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 更新活动信息
   * @param id 活动ID
   * @param data 更新数据
   * @returns 更新结果
   */
  update: async (
    id: number,
    data: UpdateActivityData
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: `/activity?id=${id}`,
        method: 'PATCH',
        data
      })) as ApiResponse;

      if (result.code === 200) {
        return {
          success: true,
          message: result.message ?? '更新活动成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '更新活动失败'
        };
      }
    } catch (error) {
      console.error('更新活动API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 更新活动状态
   * @param id 活动ID
   * @param status 新状态
   * @returns 更新结果
   */
  updateStatus: async (
    id: number,
    status: number
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: `/activity-status?id=${id}`,
        method: 'PATCH',
        data: { status }
      })) as ApiResponse;

      if (result.code === 200) {
        return {
          success: true,
          message: result.message ?? '更新活动状态成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '更新活动状态失败'
        };
      }
    } catch (error) {
      console.error('更新活动状态API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  }
};
