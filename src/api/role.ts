import { ApiResponse } from '@/types/types';
import { authRequest } from './base';

/**
 * 角色接口类型定义
 */
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_system: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

/**
 * 权限接口类型定义
 */
export interface Permission {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  resource: string;
  action: string;
}

/**
 * 角色列表查询参数
 */
export interface RoleListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

/**
 * 角色列表响应数据
 */
export interface RoleListResponse {
  list: Role[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 创建角色请求参数
 */
export interface CreateRoleParams {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

/**
 * 更新角色请求参数
 */
export interface UpdateRoleParams {
  id: number;
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

/**
 * 分配权限请求参数
 */
export interface AssignPermissionsParams {
  roleId: number;
  permissionCodes: string[];
}

/**
 * 权限列表响应数据
 */
export interface PermissionListResponse {
  all: Permission[];
  grouped: Record<string, Permission[]>;
}

/**
 * 角色管理API
 */
export const roleAPI = {
  /**
   * 获取角色列表
   */
  getList: async (
    params: RoleListParams = {}
  ): Promise<{
    success: boolean;
    data?: RoleListResponse;
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
      if (params.status) {
        queryParams.append('status', params.status);
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }

      const result = (await authRequest({
        url: `/roles/list?${queryParams.toString()}`,
        method: 'GET'
      })) as ApiResponse<RoleListResponse>;

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
    } catch (error: any) {
      // 403权限错误直接抛出，让上层处理
      if (error.response?.status === 403) {
        throw error;
      }

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 创建角色
   */
  create: async (
    data: CreateRoleParams
  ): Promise<{
    success: boolean;
    data?: Role;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/roles/list',
        method: 'POST',
        data
      })) as ApiResponse<Role>;

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
      console.error('创建角色API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 更新角色
   */
  update: async (
    data: UpdateRoleParams
  ): Promise<{
    success: boolean;
    data?: Role;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: '/roles/list',
        method: 'PUT',
        data
      })) as ApiResponse<Role>;

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
      console.error('更新角色API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 删除角色
   */
  delete: async (
    id: number
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: `/roles/list?id=${id}`,
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
      console.error('删除角色API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 获取角色的权限列表
   */
  getPermissions: async (
    roleId: number
  ): Promise<{
    success: boolean;
    data?: Permission[];
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: `/roles/${roleId}/permissions`,
        method: 'GET'
      })) as ApiResponse<Permission[]>;

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
      console.error('获取角色权限API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  },

  /**
   * 为角色分配权限
   */
  assignPermissions: async (
    data: AssignPermissionsParams
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const result = (await authRequest({
        url: `/roles/${data.roleId}/permissions`,
        method: 'POST',
        data: {
          permissionCodes: data.permissionCodes
        }
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
      console.error('分配权限API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  }
};

/**
 * 权限管理API
 */
export const permissionAPI = {
  /**
   * 获取所有可用权限列表
   */
  getList: async (
    category?: string
  ): Promise<{
    success: boolean;
    data?: PermissionListResponse;
    message?: string;
  }> => {
    try {
      const queryParams = new URLSearchParams();

      if (category) {
        queryParams.append('category', category);
      }

      const result = (await authRequest({
        url: `/permissions/list?${queryParams.toString()}`,
        method: 'GET'
      })) as ApiResponse<PermissionListResponse>;

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
      console.error('获取权限列表API错误:', error);

      return {
        success: false,
        message: '网络错误'
      };
    }
  }
};
