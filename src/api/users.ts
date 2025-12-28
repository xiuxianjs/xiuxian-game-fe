import { ApiResponse } from '@/types/types';
import { authRequest } from './base';

/**
 * 用户接口类型定义
 */
export interface User {
  id: number;
  name: string;
  bid: string;
  pid?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 用户列表响应数据
 */
export interface UserListResponse {
  users: User[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 获取用户列表参数
 */
export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * 创建用户参数
 */
export interface CreateUserParams {
  name: string;
  bid: string;
  pid?: string;
  email?: string;
  password?: string;
}

/**
 * 更新用户参数
 */
export interface UpdateUserParams {
  name?: string;
  bid?: string;
  pid?: string;
  email?: string;
  password?: string;
}

/**
 * 玩家管理API
 */
export const usersAPI = {
  /**
   * 获取用户列表
   * @param params 查询参数
   * @returns 用户列表
   */
  getList: async (
    params: GetUsersParams = {}
  ): Promise<{
    success: boolean;
    data?: UserListResponse;
    message?: string;
  }> => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString());
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }

      const url = `/game/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const result = (await authRequest({
        url,
        method: 'GET'
      })) as ApiResponse<UserListResponse>;

      if (result.code === 200) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: result.message ?? '获取用户列表失败'
        };
      }
    } catch (error) {
      console.error('获取用户列表API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 创建用户
   * @param data 创建数据
   * @returns 创建结果
   */
  create: async (
    data: CreateUserParams
  ): Promise<{
    success: boolean;
    data?: User;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/game/users',
        method: 'POST',
        data
      })) as ApiResponse<User>;

      if (result.code === 200 || result.code === 201) {
        return {
          success: true,
          data: result.data,
          message: result.message ?? '创建用户成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '创建用户失败'
        };
      }
    } catch (error) {
      console.error('创建用户API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param data 更新数据
   * @returns 更新结果
   */
  update: async (
    id: number,
    data: UpdateUserParams
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: `/game/users?id=${id}`,
        method: 'PATCH',
        data
      })) as ApiResponse;

      if (result.code === 200) {
        return {
          success: true,
          message: result.message ?? '更新用户信息成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '更新用户信息失败'
        };
      }
    } catch (error) {
      console.error('更新用户信息API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   */
  delete: async (
    id: number
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: `/game/users?id=${id}`,
        method: 'DELETE'
      })) as ApiResponse;

      if (result.code === 200) {
        return {
          success: true,
          message: result.message ?? '删除用户成功'
        };
      } else {
        return {
          success: false,
          message: result.message ?? '删除用户失败'
        };
      }
    } catch (error) {
      console.error('删除用户API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  }
};
