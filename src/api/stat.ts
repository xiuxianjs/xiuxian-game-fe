import { ApiResponse } from '@/types/types';
import { authRequest } from './base';

// 玩家境界排名查询参数

export interface GetPlayerRankQuery {
  limit?: number; // 返回前N名，范围1-1000，默认30
}

// 玩家境界排名项

export interface PlayerRankItem {
  rank: number; // 排名
  name: string; // 玩家名称
  realm: string; // 境界名称（如"化神境"）
}

// 宗门排名查询参数

export interface GetSectRankQuery {
  limit?: number; // 返回前N名，范围1-1000，默认30
}

// 宗门排名项

export interface SectRankItem {
  rank: number; // 排名
  name: string; // 宗门名称
  level: string; // 宗门等级（如"六阶"）
}

// 统计汇总数据

export interface StatSummary {
  playerTotal: number; // 全服玩家总数
  advancedPlayerTotal: number; // 高级玩家数（境界≥化神境）
  sectTotal: number; // 全服宗门总数
}

// 统一响应类型（泛型约束）

export type GetPlayerRankResponse = ApiResponse<PlayerRankItem[]>;
export type GetSectRankResponse = ApiResponse<SectRankItem[]>;
export type GetSummaryResponse = ApiResponse<StatSummary>;

// 接口封装

// 获取统计汇总数据@returns 统计汇总信息

export const getSummary = async (): Promise<{
  success: boolean;
  data?: StatSummary;
  message?: string;
}> => {
  try {
    const response = (await authRequest({
      url: '/summary',
      method: 'GET'
    })) as GetSummaryResponse;

    if (response.code === 200) {
      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        message: response.message ?? '获取统计汇总失败'
      };
    }
  } catch (error) {
    console.error('获取统计汇总API错误:', error);

    return {
      success: false,
      message: '网络错误'
    };
  }
};

/**
 * 获取玩家境界排名
 * @param query 查询参数（limit：返回前N名）
 * @returns 玩家排名列表
 */
export const getPlayerRank = async (
  query?: GetPlayerRankQuery
): Promise<{
  success: boolean;
  data?: PlayerRankItem[];
  message?: string;
}> => {
  try {
    const response = (await authRequest({
      url: '/player-rank',
      method: 'GET',
      params: query
    })) as GetPlayerRankResponse;

    if (response.code === 200) {
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : []
      };
    } else {
      return {
        success: false,
        message: response.message ?? '获取玩家境界排名失败'
      };
    }
  } catch (error) {
    console.error('获取玩家境界排名API错误:', error);

    return {
      success: false,
      message: '网络错误'
    };
  }
};

/**
 * 获取宗门排名
 * @param query 查询参数（limit：返回前N名）
 * @returns 宗门排名列表
 */
export const getSectRank = async (
  query?: GetSectRankQuery
): Promise<{
  success: boolean;
  data?: SectRankItem[];
  message?: string;
}> => {
  try {
    const response = (await authRequest({
      url: '/sect-rank',
      method: 'GET',
      params: query
    })) as GetSectRankResponse;

    if (response.code === 200) {
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : []
      };
    } else {
      return {
        success: false,
        message: response.message ?? '获取宗门排名失败'
      };
    }
  } catch (error) {
    console.error('获取宗门排名API错误:', error);

    return {
      success: false,
      message: '网络错误'
    };
  }
};

// 导出接口集合（可选，方便页面统一导入）
export const statAPI = {
  getSummary,
  getPlayerRank,
  getSectRank
};
