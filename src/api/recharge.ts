import {
  RechargeChargeRequest,
  RechargeOrder,
  RechargeOrdersQuery,
  RechargeOrdersResponseData,
  RechargePackagesQuery,
  RechargePackagesResponseData,
  RechargeRefundApplication,
  RechargeRefundsRequest
} from '@/types/recharge';
import { ApiResponse } from '@/types/types';
import { authRequest } from './base';

// 套餐列表接口
export const getRechargePackages = async (
  query?: RechargePackagesQuery
): Promise<{
  success: boolean;
  data?: RechargePackagesResponseData;
  message?: string;
}> => {
  try {
    const res = (await authRequest({
      url: '/recharge/packages',
      method: 'GET',
      params: query
    })) as ApiResponse<RechargePackagesResponseData>;

    if (res.code === 200) {
      return { success: true, data: res.data };
    }

    return { success: false, message: res.message };
  } catch (err: any) {
    return { success: false, message: err.message ?? '获取套餐列表失败' };
  }
};

// 充值订单列表接口
export const getRechargeOrders = async (
  query?: RechargeOrdersQuery
): Promise<{
  success: boolean;
  data?: RechargeOrdersResponseData;
  message?: string;
}> => {
  try {
    const res = (await authRequest({
      url: '/recharge/orders',
      method: 'GET',
      params: query
    })) as ApiResponse<RechargeOrdersResponseData>;

    if (res.code === 200) {
      return { success: true, data: res.data };
    }

    return { success: false, message: res.message };
  } catch (err: any) {
    return { success: false, message: err.message ?? '获取订单列表失败' };
  }
};

// 套餐充值接口
export const rechargeCharge = async (
  data: RechargeChargeRequest
): Promise<{
  success: boolean;
  data?: RechargeOrder;
  message?: string;
}> => {
  try {
    const res = (await authRequest({
      url: '/recharge/charge',
      method: 'POST',
      data
    })) as ApiResponse<RechargeOrder>;

    if (res.code === 200) {
      return { success: true, data: res.data };
    }

    return { success: false, message: res.message };
  } catch (err: any) {
    return { success: false, message: err.message ?? '充值失败' };
  }
};

// 申请退款接口
export const rechargeRefund = async (
  data: RechargeRefundsRequest
): Promise<{
  success: boolean;
  data?: RechargeRefundApplication;
  message?: string;
}> => {
  try {
    const res = (await authRequest({
      url: '/recharge/refunds',
      method: 'POST',
      data
    })) as ApiResponse<RechargeRefundApplication>;

    if (res.code === 200) {
      return { success: true, data: res.data };
    }

    return { success: false, message: res.message };
  } catch (err: any) {
    return { success: false, message: err.message ?? '退款申请失败' };
  }
};

export const rechargeAPI = {
  getRechargePackages,
  getRechargeOrders,
  rechargeCharge,
  rechargeRefund
};
