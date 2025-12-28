import { Permission, permissionAPI, Role, roleAPI } from '@/api/role';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Collapse, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionDeniedShown, setPermissionDeniedShown] = useState(false);
  const [form] = Form.useForm();

  // 处理权限选择变化
  const handlePermissionChange = useCallback((permCode: string, checked: boolean) => {
    setSelectedPermissions(prev => {
      if (checked) {
        // 如果已经包含，不重复添加
        if (prev.includes(permCode)) {
          return prev;
        }

        return [...prev, permCode];
      } else {
        return prev.filter(code => code !== permCode);
      }
    });
  }, []);

  // 获取角色列表
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const result = await roleAPI.getList({});

      if (result.success && result.data) {
        setRoles(result.data.list);
      } else {
        message.error(result.message ?? '获取角色列表失败');
      }
    } catch (error: any) {
      // 处理403权限错误
      if (error.response?.status === 403) {
        if (!permissionDeniedShown) {
          setPermissionDeniedShown(true);
          setTimeout(() => {
            Modal.warning({
              title: '权限不足',
              content: '您没有查看角色列表的权限，请联系管理员开通相应权限。',
              okText: '我知道了'
            });
          }, 100);
        }
      } else {
        // 非403错误才显示通用错误提示
        message.error('获取角色列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取所有权限
  const fetchPermissions = async () => {
    try {
      const result = await permissionAPI.getList();

      if (result.success && result.data) {
        setGroupedPermissions(result.data.grouped);
      } else {
        message.error(result.message ?? '获取权限列表失败');
      }
    } catch (error) {
      console.error('获取权限列表失败:', error);
      message.error('获取权限列表失败');
    }
  };

  // 创建角色
  const createRole = async (values: any) => {
    try {
      // 检查是否选择了权限
      if (selectedPermissions.length === 0) {
        message.warning('请至少选择一个权限');

        return;
      }

      // 创建角色
      const result = await roleAPI.create(values);

      if (result.success && result.data) {
        // 如果选择了权限，则分配权限
        if (selectedPermissions.length > 0) {
          await roleAPI.assignPermissions({
            roleId: result.data.id,
            permissionCodes: selectedPermissions
          });
        }
        message.success('角色创建成功');
        setModalVisible(false);
        form.resetFields();
        setSelectedPermissions([]);
        void fetchRoles();
      } else {
        message.error(result.message ?? '创建角色失败');
      }
    } catch (error: any) {
      console.error('创建角色失败:', error);
      // 检查是否是权限错误
      if (error.response?.status === 403) {
        message.error('您没有创建角色的权限，请联系管理员');
      } else {
        message.error(error.message ?? '创建角色失败');
      }
    }
  };

  // 更新角色
  const updateRole = async (values: any) => {
    if (!editingRole) {
      return;
    }

    try {
      // 检查是否选择了权限
      if (selectedPermissions.length === 0) {
        message.warning('请至少选择一个权限');

        return;
      }

      const result = await roleAPI.update({
        id: editingRole.id,
        ...values
      });

      if (result.success) {
        // 更新权限分配
        await roleAPI.assignPermissions({
          roleId: editingRole.id,
          permissionCodes: selectedPermissions
        });
        message.success('角色更新成功');
        setModalVisible(false);
        setEditingRole(null);
        form.resetFields();
        setSelectedPermissions([]);
        void fetchRoles();
      } else {
        message.error(result.message ?? '更新角色失败');
      }
    } catch (error: any) {
      console.error('更新角色失败:', error);
      // 检查是否是权限错误
      if (error.response?.status === 403) {
        message.error('您没有更新角色的权限，请联系管理员');
      } else {
        message.error(error.message ?? '更新角色失败');
      }
    }
  };

  // 删除角色
  const deleteRole = async (id: number) => {
    try {
      const result = await roleAPI.delete(id);

      if (result.success) {
        message.success('角色删除成功');
        void fetchRoles();
      } else {
        message.error(result.message ?? '删除角色失败');
      }
    } catch (error: any) {
      console.error('删除角色失败:', error);
      // 检查是否是权限错误
      if (error.response?.status === 403) {
        message.error('您没有删除角色的权限，请联系管理员');
      } else {
        message.error(error.message ?? '删除角色失败');
      }
    }
  };

  // 打开编辑模态框
  const openEditModal = async (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      status: role.status
    });

    // 加载角色的权限
    try {
      const result = await roleAPI.getPermissions(role.id);

      if (result.success && result.data) {
        setSelectedPermissions(result.data.map(p => p.code));
      }
    } catch (error) {
      console.error('获取角色权限失败:', error);
    }

    setModalVisible(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
    setEditingRole(null);
    form.resetFields();
    setSelectedPermissions([]);
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (editingRole) {
      await updateRole(values);
    } else {
      await createRole(values);
    }
  };

  // 获取分类名称
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      admin: '管理员管理',
      user: '用户管理',
      game: '游戏相关',
      system: '系统设置'
    };

    return categoryMap[category] ?? category;
  };

  useEffect(() => {
    void fetchRoles();
    void fetchPermissions();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '激活' : '停用'}</Tag>
    },
    {
      title: '系统角色',
      dataIndex: 'is_system',
      key: 'is_system',
      width: 100,
      render: (isSystem: boolean) => <Tag color={isSystem ? 'blue' : 'default'}>{isSystem ? '是' : '否'}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Role) => (
        <Space size='small'>
          <Tooltip title='编辑'>
            <Button type='link' size='small' icon={<EditOutlined />} onClick={() => void openEditModal(record)}>
              编辑
            </Button>
          </Tooltip>
          {!record.is_system && (
            <Popconfirm title='确定删除此角色吗？' onConfirm={() => void deleteRole(record.id)} okText='确定' cancelText='取消'>
              <Tooltip title='删除'>
                <Button type='link' size='small' danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className='flex justify-end'>
        <Button type='primary' icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          创建角色
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey='id'
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          showSizeChanger: true,
          showTotal: total => `共 ${total} 条`
        }}
      />

      {/* 创建/编辑角色弹窗 */}
      <Modal
        title={editingRole ? '编辑角色' : '创建角色'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={closeModal}
        width={900}
        okText={editingRole ? '保存' : '创建'}
      >
        <Form form={form} layout='vertical' onFinish={e => void handleSubmit(e)}>
          <Form.Item label='角色名称' name='name' rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder='例如：内容管理员' />
          </Form.Item>
          <Form.Item label='描述' name='description'>
            <TextArea rows={3} placeholder='角色描述' />
          </Form.Item>
          <Form.Item label='状态' name='status' initialValue='active'>
            <Select>
              <Option value='active'>激活</Option>
              <Option value='inactive'>停用</Option>
            </Select>
          </Form.Item>

          {/* 权限选择 */}
          <Form.Item label='权限配置' required>
            <Collapse defaultActiveKey={Object.keys(groupedPermissions)} style={{ marginTop: 8 }}>
              {Object.entries(groupedPermissions).map(([category, perms]) => {
                // 计算当前分类已选中的权限数
                const selectedInCategory = perms.filter(p => selectedPermissions.includes(p.code)).length;

                return (
                  <Panel
                    header={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{getCategoryName(category)}</span>
                        <Tag color={selectedInCategory > 0 ? 'blue' : 'default'} onClick={e => e.stopPropagation()} style={{ pointerEvents: 'none' }}>
                          {selectedInCategory}/{perms.length}
                        </Tag>
                      </div>
                    }
                    key={category}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {perms.map(perm => {
                        const isChecked = selectedPermissions.includes(perm.code);

                        return (
                          <div key={perm.code} style={{ padding: '4px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                              <input
                                type='checkbox'
                                checked={isChecked}
                                onChange={e => {
                                  e.stopPropagation();
                                  handlePermissionChange(perm.code, e.target.checked);
                                }}
                                onClick={e => e.stopPropagation()}
                                style={{ marginRight: '8px' }}
                              />
                              <Tooltip title={perm.description}>
                                <span>
                                  {perm.name}
                                  <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>({perm.code})</span>
                                </span>
                              </Tooltip>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                );
              })}
            </Collapse>
            {selectedPermissions.length === 0 && <div style={{ color: '#ff4d4f', marginTop: 8 }}>请至少选择一个权限</div>}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
