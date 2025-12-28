import { authRequest } from './base';

/**
 * 敏感词类型枚举
 */
export enum SensitiveWordType {
  POLITICAL = 'political',
  VIOLENT = 'violent',
  PORNOGRAPHIC = 'pornographic',
  ADVERTISING = 'advertising',
  ABUSE = 'abuse',
  CHEAT = 'cheat',
  OTHER = 'other'
}

/**
 * 敏感词等级枚举
 */
export enum SensitiveWordLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}

/**
 * 敏感词动作枚举
 */
export enum SensitiveWordAction {
  REPLACE = 'replace',
  REJECT = 'reject',
  WARN = 'warn'
}

/**
 * 敏感词数据类型
 */
export interface SensitiveWord {
  id: number;
  word: string;
  type: SensitiveWordType;
  level: SensitiveWordLevel;
  action: SensitiveWordAction;
  replacement: string;
  enabled: boolean;
  description: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * 敏感词列表查询参数
 */
export interface SensitiveWordQueryParams {
  page?: number;
  pageSize?: number;
  type?: SensitiveWordType;
  level?: SensitiveWordLevel;
  enabled?: boolean;
  keyword?: string;
}

/**
 * 敏感词列表响应
 */
export interface SensitiveWordListResponse {
  items: SensitiveWord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 日志列表响应
 */
export interface LogListResponse {
  items: SensitiveWordLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 创建敏感词参数
 */
export interface CreateSensitiveWordParams {
  word: string;
  type: SensitiveWordType;
  level: SensitiveWordLevel;
  action: SensitiveWordAction;
  replacement?: string;
  description?: string;
  enabled?: boolean;
}

/**
 * 更新敏感词参数
 */
export interface UpdateSensitiveWordParams {
  id: number;
  word?: string;
  type?: SensitiveWordType;
  level?: SensitiveWordLevel;
  action?: SensitiveWordAction;
  replacement?: string;
  description?: string;
  enabled?: boolean;
}

/**
 * 检测结果
 */
export interface DetectionResult {
  hasSensitiveWord: boolean;
  matchedWords: Array<{
    word: string;
    type: SensitiveWordType;
    level: SensitiveWordLevel;
    action: SensitiveWordAction;
  }>;
  maxLevel: number;
  shouldReject: boolean;
}

/**
 * 测试检测完整结果
 */
export interface TestDetectionResult {
  originalText: string;
  detection: DetectionResult;
  filterResult: {
    filteredText: string;
    hasReplaced: boolean;
    replaceCount: number;
  };
}

/**
 * 日志查询参数
 */
export interface LogQueryParams {
  page?: number;
  pageSize?: number;
  userId?: number;
  source?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * 检测日志
 */
export interface SensitiveWordLog {
  id: number;
  userId: number;
  content: string;
  filteredContent: string | null;
  matchedWords: string;
  actionTaken: string;
  source: string;
  platform: string;
  createdAt: string;
}

/**
 * 统计信息
 */
export interface Statistics {
  totalWords: number;
  enabledWords: number;
  disabledWords: number;
  totalLogs: number;
  recentLogs: number;
}

// ============ API Functions ============

/**
 * 获取敏感词列表
 */
export const getSensitiveWords = async (params?: SensitiveWordQueryParams): Promise<SensitiveWordListResponse> => {
  const response = await authRequest({
    url: '/sensitive-words',
    method: 'GET',
    params
  });

  return response.data;
};

/**
 * 获取单个敏感词详情（兼容性导出）
 */
export const getSensitiveWord = async (id: number): Promise<SensitiveWord | null> => {
  // 暂时通过列表接口获取
  const response = await getSensitiveWords({});

  const word = response.items.find(item => item.id === id);

  return word ?? null;
};

/**
 * 创建敏感词
 */
export const createSensitiveWord = async (data: CreateSensitiveWordParams): Promise<SensitiveWord> => {
  const response = await authRequest({
    url: '/sensitive-words',
    method: 'POST',
    data
  });

  return response.data;
};

/**
 * 更新敏感词
 */
export const updateSensitiveWord = async (data: UpdateSensitiveWordParams): Promise<SensitiveWord> => {
  const response = await authRequest({
    url: '/sensitive-words',
    method: 'PUT',
    data
  });

  return response.data;
};

/**
 * 删除敏感词
 */
export const deleteSensitiveWord = async (id: number): Promise<void> => {
  await authRequest({
    url: '/sensitive-words',
    method: 'DELETE',
    data: { id }
  });
};

/**
 * 批量导入敏感词
 */
export const batchImportSensitiveWords = async (words: CreateSensitiveWordParams[]): Promise<any> => {
  const response = await authRequest({
    url: '/sensitive-words/batch-import',
    method: 'POST',
    data: { words }
  });

  return response.data;
};

/**
 * 导出敏感词
 */
export const exportSensitiveWords = async (): Promise<Blob> => {
  const response = await authRequest({
    url: '/sensitive-words/export',
    method: 'GET',
    responseType: 'blob'
  });

  return response;
};

/**
 * 测试敏感词检测
 */
export const testDetection = async (text: string): Promise<TestDetectionResult> => {
  const response = await authRequest({
    url: '/sensitive-words/test',
    method: 'POST',
    data: { text }
  });

  return response.data;
};

/**
 * 刷新缓存
 */
export const refreshCache = async (): Promise<void> => {
  await authRequest({
    url: '/sensitive-words/refresh-cache',
    method: 'POST'
  });
};

/**
 * 获取检测日志
 */
export const getLogs = async (params?: LogQueryParams): Promise<LogListResponse> => {
  const response = await authRequest({
    url: '/sensitive-words/logs',
    method: 'GET',
    params
  });

  return response.data;
};

/**
 * 获取统计信息
 */
export const getStatistics = async (): Promise<Statistics> => {
  const response = await authRequest({
    url: '/sensitive-words/statistics',
    method: 'GET'
  });

  return response.data;
};
