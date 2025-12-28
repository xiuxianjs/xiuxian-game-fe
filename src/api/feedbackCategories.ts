import { authRequest } from './base';

/**
 * 反馈分类接口类型定义
 */
export interface FeedbackCategory {
  id: number;
  name: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 反馈分类列表查询参数
 */
export interface FeedbackCategoryQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  isEnabled?: string;
}

/**
 * 反馈分类列表响应数据
 */
export interface FeedbackCategoryListResponse {
  list: FeedbackCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 创建反馈分类请求参数
 */
export interface CreateFeedbackCategoryParams {
  name: string;
  isEnabled?: boolean;
}

/**
 * 更新反馈分类请求参数
 */
export interface UpdateFeedbackCategoryParams {
  id: number;
  name?: string;
  isEnabled?: boolean;
}

/**
 * 获取反馈分类列表
 * @param params 查询参数
 * @returns 反馈分类列表
 */
export const getFeedbackCategories = async (params?: FeedbackCategoryQueryParams): Promise<FeedbackCategoryListResponse> => {
  const response = await authRequest({
    url: '/feedback-categories',
    method: 'GET',
    params
  });

  return response.data;
};

/**
 * 创建反馈分类
 * @param data 创建参数
 * @returns 创建的反馈分类
 */
export const createFeedbackCategory = async (data: CreateFeedbackCategoryParams): Promise<FeedbackCategory> => {
  const response = await authRequest({
    url: '/feedback-categories',
    method: 'POST',
    data
  });

  return response.data;
};

/**
 * 更新反馈分类
 * @param data 更新参数（包含id）
 * @returns 更新后的反馈分类
 */
export const updateFeedbackCategory = async (data: UpdateFeedbackCategoryParams): Promise<FeedbackCategory> => {
  const response = await authRequest({
    url: '/feedback-categories',
    method: 'PUT',
    data
  });

  return response.data;
};
