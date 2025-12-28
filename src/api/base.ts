import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const instance = axios.create({
  baseURL: './api'
});

// 添加响应拦截器，静默处理业务错误（400-499）
instance.interceptors.response.use(
  response => response,
  error => {
    // 对于 4xx 客户端错误，静默处理（不在控制台显示错误）
    // 403权限错误完全静默，由业务层处理
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      // 403 权限错误不输出任何日志
      if (error.response.status !== 403 && import.meta.env.DEV) {
        console.warn(`API 请求失败 [${error.response.status}]:`, error.response.data?.message ?? error.message);
      }
    } else {
      // 5xx 服务器错误或网络错误仍然记录为 error
      console.error('API 请求错误:', error);
    }

    return Promise.reject(error);
  }
);

/**
 *
 * @param config
 * @returns
 */
export const request = (config: AxiosRequestConfig): Promise<any> => {
  return new Promise<AxiosResponse>((resolve, reject) => {
    instance(config)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const authRequest = (config: AxiosRequestConfig): Promise<any> => {
  const savedToken = localStorage.getItem('token');

  return new Promise<AxiosResponse>((resolve, reject) => {
    instance({
      headers: {
        Authorization: `Bearer ${savedToken}`
      },
      ...config
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
};
