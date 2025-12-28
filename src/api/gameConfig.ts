import { authRequest } from './base';
import { ApiResponse } from '@/types/types';

export interface GameConfig {
  id: number;
  key: string;
  label: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    displayName: string;
  };
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GameConfigListParams {
  key?: string;
  label?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
}

export const gameConfigApi = {
  // 获取配置列表
  async getList(params?: GameConfigListParams) {
    const result = (await authRequest({
      url: '/game-configs/main',
      method: 'GET',
      params
    })) as ApiResponse<{
      list: GameConfig[];
      total: number;
      page: number;
      pageSize: number;
    }>;

    return result;
  },

  // 获取单个配置
  async getOne(id: number) {
    const result = (await authRequest({
      url: '/game-configs/detail',
      method: 'GET',
      params: { id }
    })) as ApiResponse<GameConfig>;

    return result;
  },

  // 创建配置
  async create(data: Omit<GameConfig, 'id' | 'created_at' | 'updated_at'>) {
    const result = (await authRequest({
      url: '/game-configs/main',
      method: 'POST',
      data
    })) as ApiResponse<GameConfig>;

    return result;
  },

  // 更新配置
  async update(id: number, data: Partial<GameConfig>) {
    const result = (await authRequest({
      url: '/game-configs/main',
      method: 'PUT',
      data: {
        id,
        ...data
      }
    })) as ApiResponse<GameConfig>;

    return result;
  },

  // 删除配置
  async delete(id: number) {
    const result = (await authRequest({
      url: '/game-configs/main',
      method: 'DELETE',
      data: { id }
    })) as ApiResponse<null>;

    return result;
  },

  // 推送配置同步
  async syncConfigs() {
    const result = (await authRequest({
      url: '/game-configs/sync',
      method: 'POST'
    })) as ApiResponse<{ timestamp: number }>;

    return result;
  }
};
