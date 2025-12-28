import { ApiResponse } from '@/types/types';
import { authRequest } from './base';

/**
 * 公告接口类型定义
 */
export interface Notice {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  abstract: string;
  status: number;
}
export interface NoticeListResponse {
  data: Notice[];
  total: number;
  page: number;
}

/**
 * 更新公告数据接口
 */
export interface UpdateNoticeRequest {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  abstract: string;
  status?: number;
}

/**
 * 更新公告状态参数
 */
export interface UpdateNoticeStatusRequest {
  id: string;
  status: number;
}
/**
 * 创建公告请求参数
 */
export interface CreateNoticeRequest {
  title: string;
  subtitle: string;
  content: string;
  abstract: string;
}

/**
 * 公告管理接口
 */
export const noticeApi = {
  /**
   * 获取公告列表
   * @returns 公告列表
   */
  getList: async (
    page = 1
  ): Promise<{
    success: boolean;
    data?: NoticeListResponse;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: `/notice?page=${page}`,
        method: 'GET'
      })) as ApiResponse<NoticeListResponse>;

      if (result.code === 200) {
        return {
          success: true,
          data: result.data,
          message: result.message ?? '获取公告列表成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '获取公告列表失败'
        };
      }
    } catch (error) {
      console.error('获取公告列表API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 创建公告
   * @param data 创建数据
   * @returns 创建结果
   */
  create: async (
    data: CreateNoticeRequest
  ): Promise<{
    success: boolean;
    data?: Notice;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/notice',
        method: 'POST',
        data
      })) as ApiResponse<Notice>;

      if (result.code === 200 || result.code === 201) {
        return {
          success: true,
          data: result.data,
          message: result.message ?? '创建公告成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '创建公告失败'
        };
      }
    } catch (error) {
      console.error('创建公告API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 更新公告信息
   * @param id 公告ID
   * @param data 更新数据
   * @returns 更新结果
   */
  update: async (
    data: UpdateNoticeRequest
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/notice',
        method: 'PATCH',
        data
      })) as ApiResponse;

      if (result.code === 200) {
        return {
          success: true,
          message: result.message ?? '更新公告成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '更新公告失败'
        };
      }
    } catch (error) {
      console.error('更新公告API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 更新公告状态
   * @param id 公告ID
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
        url: '/notice?isStatus=true',
        method: 'PATCH',
        data: { id, status }
      })) as ApiResponse;

      if (result.code === 200) {
        return {
          success: true,
          message: result.message ?? '更新公告状态成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '更新公告状态失败'
        };
      }
    } catch (error) {
      console.error('更新公告状态API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  }
};
