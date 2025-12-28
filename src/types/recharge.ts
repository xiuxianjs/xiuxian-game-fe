export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export type RechargeStatus = 'SUCCESS' | 'REFUND';
export type PackageType = 'NORMAL' | 'MONTH_CARD';

export interface RechargePackage {
  id: number;
  name: string;
  type: PackageType;
  priceAmount: number;
  grantSpiritStone: number;
  grantSpiritCrystal: number;
  grantSpiritCoin: number;
  grantItemsJson?: string | null;
  maxBuyCount?: number | null;
  validDays?: number | null;
  status: 0 | 1;
  weight: number;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface RechargeOrder {
  id: number;
  uid: number;
  packageId: number;
  orderId: string;
  status: RechargeStatus;
  payAmount: number;
  payTime?: string | null;
  refundTime?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface RechargeRefundApplication {
  id: number;
  orderId: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  operatorId?: number | null;
  processedAt?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface RechargePackagesQuery {
  page?: number;
  pageSize?: number;
  type?: PackageType;
  status?: 0 | 1;
}

export interface RechargePackagesResponseData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  list: RechargePackage[];
}

export interface RechargeOrdersQuery {
  uid?: number;
  status?: RechargeStatus;
  page?: number;
  pageSize?: number;
}

export interface RechargeOrdersResponseData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  list: RechargeOrder[];
}

export interface RechargeChargeRequest {
  uid: number;
  packageId: number;
}

export interface RechargeRefundsRequest {
  orderId: number;
  reason: string;
}
