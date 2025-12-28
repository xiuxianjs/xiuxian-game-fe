import { ApiResponse } from '@/types/types';
import { authRequest } from './base';
/**
 * 宗门列表查询参数（对齐后端接口）
 * - page: 页码，最小1，默认1（支持字符串/数字）
 * - pageSize: 每页大小，10-100，默认10（支持字符串/数字）
 * - keyword: 名称模糊匹配
 */
export interface GetSectListQuery {
  page?: number | string;
  pageSize?: number | string;
  keyword?: string;
}

/**
 * 宗门核心类型（对齐后端返回的 raw 扁平结构）
 */
export interface Sect {
  id: number; // 宗门ID（后端返回数字类型）
  name: string; // 宗门名称
  intro: string | null; // 简介（后端字段名 intro，支持 null 清空）
  notice: string | null; // 公告（后端字段，支持 null 清空）
  levelId: number; // 等级ID（关联 guildLevel 表）
  prestige: number; // 声望
  spiritStone: number; // 灵石
  memberCount: number; // 成员数量
  minRealmId: number | null; // 最低境界ID（null/0 表示不限制）
  deliverablesJson: unknown | null; // 交付物配置
  created_at: string; // 创建时间（字符串格式，如 "2024-01-01 12:00:00"）
  leaderId: number | null; // 宗主ID
  leaderName: string | null; // 宗主名称（后端拼装字段）
  status?: number; // 状态（0=正常，1=关闭，功能待定）
  // 关联等级信息（扁平结构）
  'guildLevel.level'?: number; // 宗门等级数值（如 1-6）
  'guildLevel.memberCapacity'?: number; // 成员容量限制
  'guildLevel.viceLeaderLimit'?: number; // 副宗主数量限制
  'guildLevel.elderLimit'?: number; // 长老数量限制
  // 关联最低境界信息（扁平结构）
  'realm.id'?: number; // 最低境界ID
  'realm.name'?: string; // 最低境界名称（如 "化神境"）
}

/**
 * 宗门分页列表数据（对齐接口返回格式）
 */
export interface SectListData {
  list: Sect[]; // 宗门列表数组
  total: number; // 总条数
  page: number; // 当前页码
  pageSize: number; // 每页大小
  totalPages: number; // 总页数
}

/**
 * 宗门更新请求体（对齐后端接口 /api/guilds）
 */
export interface UpdateSectData {
  id: number; // 必填，宗门ID
  name?: string; // 宗门名称（非空≤64字符，唯一）
  intro?: string | null; // 简介（≤256字符，null 清空）
  notice?: string | null; // 公告（null 清空）
  minRealmId?: number | null; // 最低境界ID（null/0 不限制）
  levelId?: number; // 等级ID（需存在）
  prestige?: number; // 声望（非负）
  spiritStone?: number; // 灵石（非负）
}

/**
 * 宗门状态更新请求体（对齐接口 /api/guilds/status）
 */
export interface UpdateSectStatusData {
  id: number; // 宗门ID
  status: number; // 状态值（0=正常，1=关闭，需与后端一致）
}

/**
 * 统一响应类型（适配全局 ApiResponse 格式）
 */
export type GetSectListResponse = ApiResponse<SectListData>;
export type UpdateSectResponse = ApiResponse<Sect>;
export type UpdateSectStatusResponse = ApiResponse;

// 接口封装
/**
 * 获取宗门列表（分页+搜索）
 * @param params 查询参数
 * @returns 分页宗门列表
 */
export const getSectList = async (
  params?: GetSectListQuery
): Promise<{
  success: boolean;
  data?: SectListData;
  message?: string;
}> => {
  try {
    const response = (await authRequest({
      url: '/guilds',
      method: 'GET',
      params
    })) as GetSectListResponse;

    if (response.code === 200) {
      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        message: response.message ?? '获取宗门列表失败'
      };
    }
  } catch (error) {
    console.error('获取宗门列表API错误:', error);

    return {
      success: false,
      message: '网络错误'
    };
  }
};

/**
 * 更新宗门信息
 * @param data 更新请求体（含必填 id）
 * @returns 更新后的宗门详情
 */
export const updateSect = async (
  data: UpdateSectData
): Promise<{
  success: boolean;
  data?: Sect;
  message?: string;
}> => {
  try {
    const response = (await authRequest({
      url: '/guilds',
      method: 'POST',
      data
    })) as UpdateSectResponse;

    if (response.code === 200) {
      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        message: response.message ?? '更新宗门信息失败'
      };
    }
  } catch (error) {
    console.error('更新宗门信息API错误:', error);

    return {
      success: false,
      message: '网络错误'
    };
  }
};

/**
 * 更新宗门状态（启用/禁用）
 * @param data 状态更新参数（id + status）
 * @returns 操作结果
 */
export const updateSectStatus = async (
  data: UpdateSectStatusData
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = (await authRequest({
      url: '/guilds/status',
      method: 'POST',
      data
    })) as UpdateSectStatusResponse;

    if (response.code === 200) {
      return {
        success: true,
        message: response.message ?? '更新宗门状态成功'
      };
    } else {
      return {
        success: false,
        message: response.message ?? '更新宗门状态失败'
      };
    }
  } catch (error) {
    console.error('更新宗门状态API错误:', error);

    return {
      success: false,
      message: '网络错误'
    };
  }
};

// 导出接口集合（可选，方便页面统一导入）
export const sectAPI = {
  getList: getSectList,
  update: updateSect,
  updateStatus: updateSectStatus
};
