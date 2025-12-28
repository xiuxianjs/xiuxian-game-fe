/**
 * 统一API接口导出
 * 提供项目中所有API接口的统一入口
 */

// 基础请求工具
export { authRequest, request } from './base';

// 认证相关API
export { changePasswordAPI, loginAPI, logoutAPI, verifyTokenAPI } from './auth/authentication';

// 禁言管理API
export {
  addMuteAPI,
  batchUnmuteAPI,
  clearMuteLogsAPI,
  getMuteListAPI,
  getMuteLogsAPI,
  unmuteAPI,
  type MuteFormValues,
  type MuteLog,
  type MuteRecord
} from './auth/mute';

// 管理员管理API
export {
  adminAPI,
  type Admin,
  type AdminFormData,
  type AdminListParams,
  type AdminListResponse,
  type CreateAdminParams,
  type ResetPasswordParams,
  type UpdateAdminParams
} from './admin';

// 角色管理API
export {
  permissionAPI,
  roleAPI,
  type AssignPermissionsParams,
  type CreateRoleParams,
  type Permission,
  type PermissionListResponse,
  type Role,
  type RoleListParams,
  type RoleListResponse,
  type UpdateRoleParams
} from './role';

// 反馈管理API
export {
  deleteFeedback,
  getFeedbacks,
  updateFeedback,
  type DeleteFeedbackParams,
  type Feedback,
  type FeedbackListResponse,
  type FeedbackQueryParams,
  type UpdateFeedbackParams
} from './feedbacks';

// 反馈分类API
export {
  createFeedbackCategory,
  getFeedbackCategories,
  updateFeedbackCategory,
  type CreateFeedbackCategoryParams,
  type FeedbackCategory,
  type FeedbackCategoryListResponse,
  type FeedbackCategoryQueryParams,
  type UpdateFeedbackCategoryParams
} from './feedbackCategories';

// 活动管理API
export { activityAPI, type Activity, type CreateActivityParams, type UpdateActivityData, type UpdateActivityStatusParams } from './activity';

// 玩家管理API
export { usersAPI, type CreateUserParams, type GetUsersParams, type UpdateUserParams, type User, type UserListResponse } from './users';

// 公告管理API
export { noticeApi, type CreateNoticeRequest, type Notice, type NoticeListResponse, type UpdateNoticeRequest, type UpdateNoticeStatusRequest } from './notice';

// 邮件api
export { createEmail, deleteEmail, getEmail, updateEmail, type CreateEmailParams } from './email';

// 敏感词管理API
export {
  batchImportSensitiveWords,
  createSensitiveWord,
  deleteSensitiveWord,
  exportSensitiveWords,
  getLogs,
  getSensitiveWord,
  getSensitiveWords,
  getStatistics,
  refreshCache,
  SensitiveWordAction,
  SensitiveWordLevel,
  SensitiveWordType,
  testDetection,
  updateSensitiveWord,
  type CreateSensitiveWordParams,
  type DetectionResult,
  type LogListResponse,
  type LogQueryParams,
  type SensitiveWord,
  type SensitiveWordListResponse,
  type SensitiveWordLog,
  type SensitiveWordQueryParams,
  type Statistics,
  type UpdateSensitiveWordParams
} from './sensitiveWords';

// 通用类型
export type { ApiResponse } from '@/types/types';
