import { authRequest } from './base';
import { ApiResponse } from '@/types/types';

export interface GameConfigCategory {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  sortOrder?: number;
  created_at: string;
  updated_at: string;
}

export interface GameConfigCategoryListParams {
  name?: string;
  page?: number;
  pageSize?: number;
}

export interface CategoryOption {
  id: number;
  name: string;
  displayName: string;
  sortOrder: number;
}

export const gameConfigCategoryApi = {
  // 获取分类列表
  async getList(params?: GameConfigCategoryListParams) {
    const result = (await authRequest({
      url: '/game-configs/category',
      method: 'GET',
      params
    })) as ApiResponse<{
      list: GameConfigCategory[];
      total: number;
      page: number;
      pageSize: number;
    }>;

    return result;
  },

  // 获取分类选项列表
  async getCategories() {
    const result = (await authRequest({
      url: '/game-configs/categories',
      method: 'GET'
    })) as ApiResponse<CategoryOption[]>;

    return result;
  },

  // 创建分类
  async create(data: Omit<GameConfigCategory, 'id' | 'created_at' | 'updated_at'>) {
    const result = (await authRequest({
      url: '/game-configs/category',
      method: 'POST',
      data
    })) as ApiResponse<GameConfigCategory>;

    return result;
  },

  // 更新分类
  async update(id: number, data: Partial<GameConfigCategory>) {
    const result = (await authRequest({
      url: '/game-configs/category',
      method: 'PUT',
      data: {
        id,
        ...data
      }
    })) as ApiResponse<GameConfigCategory>;

    return result;
  },

  // 删除分类
  async delete(id: number) {
    const result = (await authRequest({
      url: '/game-configs/category',
      method: 'DELETE',
      data: { id }
    })) as ApiResponse<null>;

    return result;
  }
};
