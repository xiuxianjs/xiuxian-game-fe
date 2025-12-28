import { ApiResponse } from '@/types/types';
import { authRequest } from './base';

/**
 * 管理员接口类型定义
 */
export interface Admin {
  id: number;
  username: string;
  name: string;
  role_id?: number;
  is_super_admin: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  last_login_at?: string;
  // 关联的角色信息（可选）
  role?: {
    id: number;
    name: string;
    code: string;
  };
}

/**
 * 管理员表单数据
 */
export interface AdminFormData {
  username: string;
  password?: string;
  name: string;
  role_id?: number;
}

/**
 * 管理员列表查询参数
 */
export interface AdminListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * 管理员列表响应数据
 */
export interface AdminListResponse {
  list: Admin[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 创建管理员请求参数
 */
export interface CreateAdminParams {
  username: string;
  password: string;
  name: string;
  role_id?: number;
}

/**
 * 更新管理员请求参数
 */
export interface UpdateAdminParams {
  id: number;
  username?: string;
  name?: string;
  role_id?: number;
}

/**
 * 重置密码请求参数
 */
export interface ResetPasswordParams {
  id: number;
  newPassword: string;
}

/**
 * 管理员管理API
 */
export const adminAPI = {
  /**
   * 获取管理员列表
   * @param params 查询参数
   * @returns 管理员列表
   */
  getList: async (
    params: AdminListParams = {}
  ): Promise<{
    success: boolean;
    data?: AdminListResponse;
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

      const result = (await authRequest({
        url: `/account/list?${queryParams.toString()}`,
        method: 'GET'
      })) as ApiResponse<AdminListResponse>;

      if (result.code === 200) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('获取管理员列表API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 创建管理员
   * @param data 创建参数
   * @returns 创建结果
   */
  create: async (
    data: CreateAdminParams
  ): Promise<{
    success: boolean;
    data?: Admin;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/account/list',
        method: 'POST',
        data
      })) as ApiResponse<Admin>;

      if (result.code === 201) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('创建管理员API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 更新管理员
   * @param data 更新参数
   * @returns 更新结果
   */
  update: async (
    data: UpdateAdminParams
  ): Promise<{
    success: boolean;
    data?: Admin;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/account/list',
        method: 'PUT',
        data
      })) as ApiResponse<Admin>;

      if (result.code === 200) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('更新管理员API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 删除管理员
   * @param id 管理员ID
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
        url: `/account/list?id=${id}`,
        method: 'DELETE'
      })) as ApiResponse;

      if (result.code === 200) {
        return {
          success: true
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('删除管理员API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 重置密码
   * @param data 重置密码参数
   * @returns 重置结果
   */
  resetPassword: async (
    data: ResetPasswordParams
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/account/list',
        method: 'PATCH',
        data
      })) as ApiResponse;

      if (result.code === 200) {
        return {
          success: true,
          message: result.message
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('重置密码API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  }
};
