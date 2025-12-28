import { usersAPI, type UpdateUserParams, type User } from '@/api';
import { ClockCircleOutlined, EditOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Form, Input, message, Modal, Space, Spin, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;

// 工具函数
const formatDateTime = (timestamp: string) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

// 编辑用户模态框组件
interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: UpdateUserParams) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      form.setFieldsValue({
        name: user.name
      });
    }
  }, [user, isOpen, form]);

  const handleSubmit = async (values: any) => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      const formData: UpdateUserParams = {
        name: values.name
      };

      await onSave(user.id, formData);
      onClose();
    } catch (error: any) {
      console.error('保存失败:', error);
      message.error(error.message ?? '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title='编辑用户信息' open={isOpen} onCancel={onClose} footer={null} width={500} destroyOnClose>
      <Form
        form={form}
        layout='vertical'
        onFinish={values => {
          void handleSubmit(values);
        }}
        initialValues={{
          id: user?.id,
          name: user?.name,
          bid: user?.bid
        }}
      >
        <Form.Item label='UID' name='id'>
          <Input disabled value={user?.id} />
        </Form.Item>

        <Form.Item label='机器人码' name='bid'>
          <Input disabled value={user?.bid} />
        </Form.Item>

        <Form.Item label='昵称' name='name' rules={[{ required: true, message: '请输入昵称' }]}>
          <Input placeholder='请输入昵称' />
        </Form.Item>

        <Form.Item className='mb-0'>
          <Space className='w-full justify-end'>
            <Button onClick={onClose}>取消</Button>
            <Button type='primary' htmlType='submit' loading={loading}>
              确定
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 主组件
const UserListPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // 模态框状态
  const [editModal, setEditModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null
  });

  // 获取用户数据
  const fetchUsers = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);
      const result = await usersAPI.getList({ page, pageSize });

      if (result.success && result.data) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
      } else {
        setError(result.message ?? '获取用户数据失败');
        setUsers([]);
      }
    } catch (err: any) {
      setError(err.message ?? '获取用户数据失败');
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  // 更新用户信息
  const updateUser = async (id: number, data: UpdateUserParams) => {
    const result = await usersAPI.update(id, data);

    if (result.success) {
      setUsers(prev => prev.map(user => (user.id === id ? { ...user, ...data } : user)));
      message.success(result.message ?? '更新用户信息成功');
    } else {
      throw new Error(result.message ?? '更新用户信息失败');
    }
  };

  // 打开编辑模态框
  const handleEdit = (user: User) => {
    setEditModal({ isOpen: true, user });
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    void fetchUsers(pagination.current, pagination.pageSize);
  };

  // 列表视图
  const renderListView = () => {
    const columns = [
      {
        title: '编号',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        render: (id: number) => (
          <Text strong className='text-blue-600'>
            #{id}
          </Text>
        )
      },
      {
        title: '机器码',
        dataIndex: 'bid',
        key: 'bid',
        width: 200,
        render: (bid: string) => (
          <Text code className='text-xs'>
            {bid.length > 20 ? `${bid.substring(0, 20)}...` : bid}
          </Text>
        )
      },
      {
        title: '昵称',
        dataIndex: 'name',
        key: 'name',
        width: 120,
        render: (name: string) => (
          <Space>
            <Avatar size='small' icon={<UserOutlined />} />
            <Text strong>{name}</Text>
          </Space>
        )
      },
      {
        title: '注册时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 180,
        render: (createdAt: string) => (
          <Space>
            <ClockCircleOutlined className='text-gray-400' />
            <Text type='secondary' className='text-sm'>
              {formatDateTime(createdAt)}
            </Text>
          </Space>
        )
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (record: User) => (
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        )
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={users}
        rowKey='id'
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
        onChange={handleTableChange}
        size='middle'
      />
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Spin size='large' tip='加载用户数据中...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-2xl mx-auto'>
        <div className='text-center'>
          <Text type='danger' className='text-lg mb-4 block'>
            加载失败
          </Text>
          <Text type='secondary' className='mb-4 block'>
            {error}
          </Text>
          <Button
            type='primary'
            icon={<ReloadOutlined />}
            onClick={() => {
              void fetchUsers();
            }}
          >
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=''>
        {/* 用户列表 */}
        {users.length === 0 ? (
          <div className='text-center py-12'>
            <UserOutlined className='text-6xl text-gray-400 mb-4' />
            <Title level={3} className='mb-2'>
              暂无用户
            </Title>
            <Text type='secondary' className='mb-4 block'>
              当前没有找到用户数据
            </Text>
          </div>
        ) : (
          renderListView()
        )}
      </div>

      <EditUserModal user={editModal.user} isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, user: null })} onSave={updateUser} />
    </>
  );
};

export default UserListPanel;
