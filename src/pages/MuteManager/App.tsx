import { addMuteAPI, batchUnmuteAPI, getMuteListAPI, unmuteAPI, type MuteFormValues, type MuteRecord } from '@/api';
import { ClockCircleOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, StopOutlined, UnlockOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Space, Table } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

const MuteManager: React.FC = () => {
  const { message } = App.useApp();
  const [muteList, setMuteList] = useState<MuteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [_total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [durationUnit, setDurationUnit] = useState('m'); // 添加单位状态
  const [form] = Form.useForm<MuteFormValues>();

  // 获取禁言列表
  const fetchMuteList = async () => {
    setLoading(true);
    try {
      const result = await getMuteListAPI();

      if (result.success && result.data) {
        setMuteList(result.data.list ?? []);
        setTotal(result.data.total ?? 0);
      } else {
        message.error(result.message ?? '获取禁言列表失败');
      }
    } catch (error) {
      console.error('获取禁言列表错误:', error);
      message.error('获取禁言列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加禁言
  const handleAddMute = async (values: MuteFormValues) => {
    try {
      // 将数值和单位组合成后端期望的格式
      const durationWithUnit = `${values.duration}${durationUnit}`;
      const result = await addMuteAPI({
        ...values,
        duration: durationWithUnit
      });

      if (result.success) {
        message.success('禁言设置成功');
        setAddModalVisible(false);
        form.resetFields();
        setDurationUnit('m'); // 重置单位
        void fetchMuteList();
      } else {
        message.error(result.message ?? '禁言设置失败');
      }
    } catch (error) {
      console.error('设置禁言错误:', error);
      message.error('禁言设置失败');
    }
  };

  // 解除禁言
  const handleUnmute = async (userId: string) => {
    try {
      const result = await unmuteAPI(userId);

      if (result.success) {
        message.success('禁言解除成功');
        void fetchMuteList();
      } else {
        message.error(result.message ?? '禁言解除失败');
      }
    } catch (error) {
      console.error('解除禁言错误:', error);
      message.error('禁言解除失败');
    }
  };

  // 批量解除禁言
  const handleBatchUnmute = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要解除禁言的用户');

      return;
    }

    try {
      const result = await batchUnmuteAPI(selectedRowKeys);

      if (result.success && result.data) {
        message.success(`批量解除禁言完成，成功解除 ${result.data.successCount} 个用户`);
        setSelectedRowKeys([]);
        void fetchMuteList();
      } else {
        message.error(result.message ?? '批量解除禁言失败');
      }
    } catch (error) {
      console.error('批量解除禁言错误:', error);
      message.error('批量解除禁言失败');
    }
  };

  // 搜索过滤
  const filteredMuteList = muteList.filter(item => item.userId.toLowerCase().includes(searchText.toLowerCase()));

  // 分页处理
  const paginatedData = filteredMuteList.slice((current - 1) * pageSize, current * pageSize);

  // 表格列定义
  const columns = [
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined />
          <span>用户ID</span>
        </div>
      ),
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{userId}</span>
      )
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined />
          <span>剩余时间</span>
        </div>
      ),
      dataIndex: 'remainingTime',
      key: 'remainingTime',
      render: (remainingTime: string) => <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>{remainingTime}</span>
    },
    {
      title: '解除时间',
      dataIndex: 'unlockTime',
      key: 'unlockTime',
      render: (unlockTime: string) => <span>{dayjs(unlockTime).format('YYYY-MM-DD HH:mm:ss')}</span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: MuteRecord) => (
        <Space>
          <Popconfirm title='确定要解除该用户的禁言吗？' onConfirm={() => void handleUnmute(record.userId)} okText='确定' cancelText='取消'>
            <Button type='text' size='small' icon={<UnlockOutlined />}>
              解除禁言
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys as string[]);
    }
  };

  useEffect(() => {
    void fetchMuteList();
  }, []);

  return (
    <div className=''>
      <div className='mb-4'>
        <Row gutter={16} align='middle'>
          <Col flex='auto'>
            <Input
              placeholder='搜索用户ID...'
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ maxWidth: 400 }}
            />
          </Col>

          <div className='flex gap-2'>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
              添加禁言
            </Button>
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={() => void handleBatchUnmute()}>
              批量解除 ({selectedRowKeys.length})
            </Button>
          </div>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={paginatedData}
        rowKey='userId'
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current,
          pageSize,
          total: filteredMuteList.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, size) => {
            setCurrent(page);
            setPageSize(size || 10);
          }
        }}
      />

      {/* 添加禁言模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StopOutlined />
            <span>添加禁言</span>
          </div>
        }
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={() => void form.submit()}
        okText='确定'
        cancelText='取消'
        width={500}
      >
        <Form form={form} layout='vertical' onFinish={values => void handleAddMute(values)}>
          <Form.Item name='userId' label='用户ID' rules={[{ required: true, message: '请输入用户ID' }]}>
            <Input placeholder='请输入用户ID' />
          </Form.Item>

          <Form.Item name='duration' label='禁言时长' rules={[{ required: true, message: '请输入禁言时长' }]}>
            <Input
              type='number'
              min={1}
              placeholder='请输入数字'
              addonAfter={
                <Select value={durationUnit} onChange={setDurationUnit} style={{ width: 80 }}>
                  <Option value='m'>分钟</Option>
                  <Option value='h'>小时</Option>
                  <Option value='s'>秒</Option>
                </Select>
              }
            />
          </Form.Item>

          <Form.Item name='reason' label='禁言原因'>
            <Input.TextArea placeholder='请输入禁言原因（可选）' rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MuteManager;
