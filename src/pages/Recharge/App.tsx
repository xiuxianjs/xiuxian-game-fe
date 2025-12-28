import { rechargeAPI } from '@/api/recharge';
import { RechargeOrder, RechargePackage, RechargeStatus } from '@/types/recharge';
import { FundOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Button, Form, Input, message, Modal, Select, Space, Table } from 'antd';
import React, { useEffect, useState } from 'react';

const RechargeApp: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState({
    orders: true,
    packages: true
  });
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [packages, setPackages] = useState<RechargePackage[]>([]);

  // 弹窗状态
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [currentRefundOrder, setCurrentRefundOrder] = useState<RechargeOrder | null>(null);

  // 订单列表列定义（仅在有订单时显示“申请退款”按钮）
  const orderColumns: TableColumnsType<RechargeOrder> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180
    },
    {
      title: '用户ID',
      dataIndex: 'uid',
      key: 'uid',
      width: 100
    },
    {
      title: '套餐ID',
      dataIndex: 'packageId',
      key: 'packageId',
      width: 100,
      render: id => {
        const pkg = packages.find(item => item.id === id);

        return pkg ? `${id}(${pkg.name})` : id;
      }
    },
    {
      title: '支付金额(分)',
      dataIndex: 'payAmount',
      key: 'payAmount',
      width: 120
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: RechargeStatus) => {
        const statusMap = {
          SUCCESS: <span style={{ color: 'green' }}>已完成</span>,
          REFUND: <span style={{ color: 'orange' }}>已退款</span>
        };

        return statusMap[status];
      }
    },
    {
      title: '支付时间',
      dataIndex: 'payTime',
      key: 'payTime',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      // 仅当存在订单且订单状态为SUCCESS时显示“申请退款”按钮
      render: (record: RechargeOrder) => {
        return orders.length > 0 && record.status === 'SUCCESS' ? (
          <Button
            type='default'
            size='small'
            icon={<FundOutlined />}
            onClick={() => {
              setCurrentRefundOrder(record);
              setRefundModalVisible(true);
            }}
          >
            申请退款
          </Button>
        ) : null;
      }
    }
  ];

  // 获取订单列表
  const fetchOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    const res = await rechargeAPI.getRechargeOrders({ page: 1, pageSize: 10 });

    if (res.success) {
      setOrders(res.data?.list ?? []);
    } else {
      message.error(res.message);
    }
    setLoading(prev => ({ ...prev, orders: false }));
  };

  // 获取套餐列表
  const fetchPackages = async () => {
    setLoading(prev => ({ ...prev, packages: true }));
    const res = await rechargeAPI.getRechargePackages({ status: 1 });

    if (res.success) {
      setPackages(res.data?.list ?? []);
    } else {
      message.error(res.message);
    }
    setLoading(prev => ({ ...prev, packages: false }));
  };

  // 提交充值
  const handleRechargeSubmit = async (values: { uid: number; packageId: number; quantity: number; remark?: string }) => {
    setRechargeModalVisible(false);
    const res = await rechargeAPI.rechargeCharge({
      uid: values.uid,
      packageId: values.packageId
    });

    if (res.success) {
      message.success('充值成功');
      void fetchOrders();
    } else {
      message.error(res.message);
    }
  };

  // 提交退款申请
  const handleRefundSubmit = async (values: { reason: string }) => {
    if (!currentRefundOrder) {
      return;
    }
    setRefundModalVisible(false);
    const res = await rechargeAPI.rechargeRefund({
      orderId: currentRefundOrder.id,
      reason: values.reason
    });

    if (res.success) {
      message.success('退款申请提交成功');
      void fetchOrders();
    } else {
      message.error(res.message);
    }
  };

  // 初始化数据
  useEffect(() => {
    void fetchOrders();
    void fetchPackages();
  }, []);

  return (
    <div>
      {/* 订单表 + 充值按钮 */}
      <div className='flex flex-col gap-2'>
        <div className='flex justify-end'>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => setRechargeModalVisible(true)}>
            充值
          </Button>
        </div>

        <Table
          columns={orderColumns}
          dataSource={orders}
          rowKey='id'
          pagination={{ pageSize: 10 }}
          loading={loading.orders}
          bordered
          locale={{ emptyText: '暂无充值订单' }}
        />
      </div>

      {/* 充值弹窗 */}
      <Modal title='充值' open={rechargeModalVisible} onCancel={() => setRechargeModalVisible(false)} footer={null}>
        <Form onFinish={e => void handleRechargeSubmit(e)} layout='vertical'>
          <Form.Item name='uid' label='UID' rules={[{ required: true, message: '请输入用户ID' }]}>
            <Input placeholder='请输入UID' />
          </Form.Item>
          <Form.Item name='packageId' label='套餐' rules={[{ required: true, message: '请选择套餐' }]}>
            <Select
              placeholder='选择套餐'
              showSearch
              loading={loading.packages}
              options={packages.map(pkg => ({
                value: pkg.id,
                label: `${pkg.name}（${pkg.priceAmount}分）`
              }))}
            />
          </Form.Item>
          <Form.Item name='quantity' label='数量' initialValue={1} rules={[{ required: true, message: '请输入数量' }]}>
            <Input type='number' min={1} />
          </Form.Item>
          <Form.Item name='remark' label='备注'>
            <Input.TextArea rows={2} placeholder='选填' />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' style={{ width: '100%' }}>
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title='申请退款' open={refundModalVisible} onCancel={() => setRefundModalVisible(false)} footer={null} width={400}>
        <div style={{ padding: '16px 0' }}>
          <Form onFinish={e => void handleRefundSubmit(e)} layout='horizontal' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <Form.Item name='reason' label='备注' rules={[{ required: true, message: '请输入退款原因' }]}>
              <Input.TextArea rows={3} placeholder='请输入退款原因' />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4 }}>
              <Space>
                <Button onClick={() => setRefundModalVisible(false)}>拒绝</Button>
                <Button type='primary' htmlType='submit'>
                  同意
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default RechargeApp;
