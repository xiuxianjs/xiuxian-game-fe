import { adminAPI, roleAPI, type Admin, type AdminFormData, type Role } from '@/api';
import { DeleteOutlined, EditOutlined, KeyOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';

const { Option } = Select;

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const result = await roleAPI.getList();

      if (result.success && result.data) {
        // 后端返回的数据结构是 { list: [...], total, page, pageSize }
        setRoles(result.data.list || []);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
      setRoles([]); // 出错时设置为空数组
    }
  };

  // 获取管理员列表
  const fetchAdmins = async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const result = await adminAPI.getList({ page, pageSize, search });

      if (result.success && result.data) {
        setAdmins(result.data.list);
        setPagination({
          current: result.data.page,
          pageSize: result.data.pageSize,
          total: result.data.total
        });
      } else {
        message.error(result.message ?? '获取管理员列表失败');
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
      message.error('获取管理员列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建管理员
  const createAdmin = async (values: AdminFormData) => {
    try {
      if (!values.password) {
        message.error('密码不能为空');

        return;
      }

      const result = await adminAPI.create({
        username: values.username,
        password: values.password,
        name: values.name,
        role_id: values.role_id
      });

      if (result.success) {
        message.success('管理员创建成功');
        setModalVisible(false);
        form.resetFields();
        void fetchAdmins(pagination.current, pagination.pageSize, searchText);
      } else {
        message.error(result.message ?? '创建管理员失败');
      }
    } catch (error) {
      console.error('创建管理员失败:', error);
      message.error('创建管理员失败');
    }
  };

  // 更新管理员
  const updateAdmin = async (values: AdminFormData) => {
    if (!editingAdmin) {
      return;
    }

    try {
      const result = await adminAPI.update({
        id: editingAdmin.id,
        ...values
      });

      if (result.success) {
        message.success('管理员信息更新成功');
        setModalVisible(false);
        setEditingAdmin(null);
        form.resetFields();
        void fetchAdmins(pagination.current, pagination.pageSize, searchText);
      } else {
        message.error(result.message ?? '更新管理员失败');
      }
    } catch (error) {
      console.error('更新管理员失败:', error);
      message.error('更新管理员失败');
    }
  };

  // 删除管理员
  const deleteAdmin = async (id: number) => {
    try {
      const result = await adminAPI.delete(id);

      if (result.success) {
        message.success('管理员删除成功');
        void fetchAdmins(pagination.current, pagination.pageSize, searchText);
      } else {
        message.error(result.message ?? '删除管理员失败');
      }
    } catch (error) {
      console.error('删除管理员失败:', error);
      message.error('删除管理员失败');
    }
  };

  // 重置密码
  const resetPassword = async (id: number) => {
    const newPassword = prompt('请输入新密码（至少6位）:');

    if (!newPassword || newPassword.length < 6) {
      message.error('密码长度至少6位');

      return;
    }

    try {
      const result = await adminAPI.resetPassword({
        id,
        newPassword
      });

      if (result.success) {
        message.success('密码重置成功');
      } else {
        message.error(result.message ?? '重置密码失败');
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      message.error('重置密码失败');
    }
  };

  // 打开编辑模态框
  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    form.setFieldsValue({
      username: admin.username,
      name: admin.name,
      role_id: admin.role_id
    });
    setModalVisible(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
    setEditingAdmin(null);
    form.resetFields();
  };

  // 处理表单提交
  const handleSubmit = async (values: AdminFormData) => {
    if (editingAdmin) {
      await updateAdmin(values);
    } else {
      await createAdmin(values);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    void fetchAdmins(1, pagination.pageSize, searchText);
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    void fetchAdmins(pagination.current, pagination.pageSize, searchText);
  };

  // 获取角色标签颜色
  const getRoleTagColor = (admin: Admin) => {
    if (admin.is_super_admin) {
      return 'red';
    }
    if (admin.role) {
      switch (admin.role.code) {
        case 'admin':
          return 'blue';
        case 'moderator':
          return 'green';
        default:
          return 'default';
      }
    }

    return 'default';
  };

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: '显示名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '角色',
      key: 'role',
      width: 150,
      render: (_: unknown, record: Admin) => {
        if (record.is_super_admin) {
          return <Tag color='red'>超级管理员</Tag>;
        }
        if (record.role) {
          return <Tag color={getRoleTagColor(record)}>{record.role.name}</Tag>;
        }

        return <Tag>无角色</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '正常' : '禁用'}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '最后登录',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      width: 180,
      render: (date: string) => (date ? new Date(date).toLocaleString() : '从未登录')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Admin) => (
        <Space size='small'>
          <Button type='link' icon={<EditOutlined />} onClick={() => openEditModal(record)} size='small'>
            编辑
          </Button>
          <Button type='link' icon={<KeyOutlined />} onClick={() => void resetPassword(record.id)} size='small'>
            重置密码
          </Button>
          <Popconfirm title='确定要删除这个管理员吗？' onConfirm={() => void deleteAdmin(record.id)} okText='确定' cancelText='取消'>
            <Button type='link' danger icon={<DeleteOutlined />} size='small'>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  useEffect(() => {
    void fetchRoles();
    void fetchAdmins();
  }, []);

  return (
    <div className=''>
      <div className='mb-4 flex justify-between'>
        <div className='flex gap-2'>
          <Input
            placeholder='搜索用户名或显示名称'
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ maxWidth: 400 }}
          />
          <Button type='primary' onClick={handleSearch}>
            搜索
          </Button>
        </div>
        <div>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => void setModalVisible(true)}>
            添加
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={admins}
        rowKey='id'
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
        onChange={handleTableChange}
      />

      <Modal title={editingAdmin ? '编辑管理员' : '添加管理员'} open={modalVisible} onCancel={closeModal} footer={null} width={500}>
        <Form form={form} layout='vertical' onFinish={values => void handleSubmit(values)}>
          <Form.Item
            label='用户名'
            name='username'
            rules={[
              { required: true, message: '请输入用户名' },
              { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '用户名只能包含字母、数字和下划线，长度3-20位' }
            ]}
          >
            <Input placeholder='请输入用户名' />
          </Form.Item>

          {!editingAdmin && (
            <Form.Item
              label='密码'
              name='password'
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少6位' }
              ]}
            >
              <Input.Password placeholder='请输入密码' />
            </Form.Item>
          )}

          <Form.Item label='显示名称' name='name' rules={[{ required: true, message: '请输入显示名称' }]}>
            <Input placeholder='请输入显示名称' />
          </Form.Item>

          <Form.Item label='角色' name='role_id' rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder='请选择角色' allowClear>
              {roles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className='mb-0'>
            <Space className='w-full justify-end'>
              <Button onClick={closeModal}>取消</Button>
              <Button type='primary' htmlType='submit'>
                {editingAdmin ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
