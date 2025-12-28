import { authRequest } from './base';
export interface PushMessageForm {
  title: string;
  subtitle: string;
  content: string;
  goodsList: EmailGoodType[];
  receiver: string;
  sender: number; // 管理员ID
}

interface EmailGoodType {
  itemId: number;
  category: string;
  quantity: number;
  name: string;
}

export interface Email {
  id: number;
  name: string; // 对应标题
  isElement: boolean;
  subtitle: string;
  goods: EmailGoodType[];
  aid: number; // 发信人管理员ID
  time: string;
}

// 创建邮件的入参（表单数据 + type 操作类型）
export interface CreateEmailParams extends PushMessageForm {
  type: 'draft' | 'send'; // 后端通过该字段区分：draft=草稿，send=发送
}

// 通用响应类型
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export const createEmail = async (
  params: CreateEmailParams
): Promise<{
  success: boolean;
  data?: Email;
  message?: string;
}> => {
  try {
    const result = (await authRequest({
      url: '/email/create',
      method: 'POST',
      data: params
    })) as ApiResponse<Email>;

    if (result.code === 200) {
      return {
        success: true,
        data: result.data,
        message: result.message ?? (params.type === 'draft' ? '草稿保存成功' : '邮件发送成功')
      };
    } else {
      return {
        success: false,
        message: result.message ?? (params.type === 'draft' ? '草稿保存失败' : '邮件发送失败')
      };
    }
  } catch (error) {
    console.error('邮件操作失败:', error);

    return {
      success: false,
      message: '网络错误，操作失败'
    };
  }
};

// 通用响应结构
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

/**
 * 获取指定用户的邮件列表
 * @param params
 * @returns 处理后的响应
 */
export const getEmail = async (): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const result = (await authRequest({
      url: '/email/email',
      method: 'get'
    })) as ApiResponse<Email[]>;

    // 处理响应
    if (result.code === 200) {
      return {
        success: true,
        data: result.data,
        message: result.message ?? '获取邮件列表成功'
      };
    } else {
      return {
        success: false,
        message: result.message ?? '获取邮件列表失败'
      };
    }
  } catch (error) {
    console.error('获取用户邮件失败:', error);

    return {
      success: false,
      message: '网络错误，获取邮件失败'
    };
  }
};

/**
 * 删除指定邮件
 * @param params
 * @returns 处理后的响应
 */
export const deleteEmail = async (
  params: any
): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const { id } = params; // 提取邮件ID

    console.log(id);

    const result = (await authRequest({
      url: '/email/deleteEmail',
      method: 'get',
      params: { id }
    })) as ApiResponse<object>;

    if (result.code === 200) {
      return {
        success: true,
        message: result.message ?? '邮件删除成功'
      };
    } else {
      return {
        success: false,
        message: result.message ?? '邮件删除失败'
      };
    }
  } catch (error) {
    console.error('删除邮件失败:', error);

    return {
      success: false,
      message: '网络错误，删除邮件失败'
    };
  }
};

/**
 * 获取指定用户的邮件列表
 * @param params
 * @returns 处理后的响应
 */
export const updateEmail = async (
  params: any
): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const { id } = params;

    const result = (await authRequest({
      url: '/email/send',
      method: 'get',
      params: { id }
    })) as ApiResponse<Email[]>;

    // 处理响应
    if (result.code === 200) {
      return {
        success: true,
        data: result.data,
        message: result.message ?? '更新邮件列表成功'
      };
    } else {
      return {
        success: false,
        message: result.message ?? '更新邮件列表失败'
      };
    }
  } catch (error) {
    console.error('更新用户邮件失败:', error);

    return {
      success: false,
      message: '网络错误，获取邮件失败'
    };
  }
};

export const getAllGoods = async () => {
  try {
    const result = await authRequest({
      url: '/email/good',
      method: 'get'
    });

    if (result.code === 200) {
      return {
        success: true,
        data: result.data,
        message: result.message ?? '获取物品列表成功'
      };
    } else {
      return {
        success: false,
        message: result.message ?? '获取物品列表失败'
      };
    }
  } catch (error) {
    console.error('获取物品列表失败:', error);

    return {
      success: false,
      message: '网络错误，获取物品列表失败'
    };
  }
};
