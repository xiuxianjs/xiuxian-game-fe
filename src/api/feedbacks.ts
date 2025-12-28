import { authRequest } from './base';

/**
 * 反馈接口类型定义
 */
export interface Feedback {
  id: number;
  categoryId: number;
  content: string;
  reply: string | null;
  feedbackTime: string;
  replyTime: string | null;
  isReplied: boolean;
  userId: number;
  replyId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category?: {
    id: number;
    name: string;
    isEnabled: boolean;
  };
}

/**
 * 反馈列表查询参数
 */
export interface FeedbackQueryParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  content?: string;
  isReplied?: string;
  userId?: number;
}

/**
 * 反馈列表响应数据
 */
export interface FeedbackListResponse {
  list: Feedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 更新反馈参数
 */
export interface UpdateFeedbackParams {
  id: number;
  reply?: string;
  content?: string;
  categoryId?: number;
}

/**
 * 删除反馈参数
 */
export interface DeleteFeedbackParams {
  id: number;
}

/**
 * 获取反馈列表
 * @param params 查询参数
 * @returns 反馈列表
 */
export const getFeedbacks = async (params?: FeedbackQueryParams): Promise<FeedbackListResponse> => {
  const response = await authRequest({
    url: '/feedbacks',
    method: 'GET',
    params
  });

  return response.data;
};

/**
 * 更新反馈
 */
export const updateFeedback = async (data: UpdateFeedbackParams): Promise<Feedback> => {
  const response = await authRequest({
    url: '/feedbacks',
    method: 'PUT',
    data
  });

  return response.data;
};

/**
 * 删除反馈（软删除）
 * @param id 反馈ID
 * @returns 删除结果
 */
export const deleteFeedback = async (data: DeleteFeedbackParams): Promise<void> => {
  await authRequest({
    url: '/feedbacks',
    method: 'DELETE',
    data
  });
};
