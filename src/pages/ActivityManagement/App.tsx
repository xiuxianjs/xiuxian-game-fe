import { activityAPI, type Activity, type CreateActivityParams, type UpdateActivityData } from '@/api';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, PauseCircleOutlined, PlayCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// 境界等级选项
const LEVEL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// 状态映射
const STATUS = {
  0: '正常',
  1: '关闭'
};

// 筛选选项配置（仅保留状态筛选）
const FILTER_OPTIONS = {
  status: [
    { label: '全部状态', value: 'all' },
    { label: '正常', value: '0' },
    { label: '关闭', value: '1' }
  ]
};

// 将时间戳格式化为 datetime-local 输入所需的格式
const formatTimeForInput = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DDTHH:mm');
};

// 从 datetime-local 输入解析时间戳
const parseTimeFromInput = (value: string): number => {
  if (!value) {
    return 0;
  }
  const dayjsObj = dayjs(value);

  return dayjsObj.isValid() ? dayjsObj.valueOf() : dayjs().valueOf();
};

// 工具函数
const formatDateTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
};

const getStatusText = (status: number) => {
  return STATUS[status as keyof typeof STATUS] ?? '未知状态';
};

const getLevelName = (limit: number) => {
  const level = LEVEL_OPTIONS.find(opt => opt === limit);

  return level ? `Lv.${level}+` : `Lv.${limit}+`;
};

// 编辑活动模态框组件
interface EditActivityModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: UpdateActivityData) => Promise<void>;
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({ activity, isOpen, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity && isOpen) {
      form.setFieldsValue({
        title: activity.title,
        intro: activity.intro,
        start_time: activity.start_time ? formatTimeForInput(activity.start_time) : undefined,
        end_time: activity.end_time ? formatTimeForInput(activity.end_time) : undefined,
        award: activity.award,
        detail: activity.detail,
        limit: activity.limit
      });
    }
  }, [activity, isOpen, form]);

  const handleSubmit = async (values: any) => {
    if (!activity) {
      return;
    }

    setLoading(true);
    try {
      const formData: UpdateActivityData = {
        title: values.title,
        intro: values.intro,
        start_time: values.start_time ? parseTimeFromInput(values.start_time) : undefined,
        end_time: values.end_time ? parseTimeFromInput(values.end_time) : undefined,
        award: values.award,
        detail: values.detail,
        limit: values.limit
      };

      await onSave(activity.id, formData);
      onClose();
    } catch (error: any) {
      console.error('保存失败:', error);
      message.error(error.message ?? '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title='编辑活动' open={isOpen} onCancel={onClose} footer={null} width={800} destroyOnClose>
      <Form
        form={form}
        layout='vertical'
        onFinish={values => {
          void handleSubmit(values);
        }}
        initialValues={{
          title: activity?.title,
          start_time: activity?.start_time ? formatTimeForInput(activity.start_time) : undefined,
          end_time: activity?.end_time ? formatTimeForInput(activity.end_time) : undefined,
          award: activity?.award,
          detail: activity?.detail,
          limit: activity?.limit
        }}
      >
        <Form.Item
          label='活动名称'
          name='title'
          rules={[
            { required: true, message: '请输入活动名称' },
            { max: 10, message: '活动名称不能超过10个字符' }
          ]}
        >
          <Input placeholder='请输入活动名称' />
        </Form.Item>
        <Form.Item
          label='活动简介'
          name='intro'
          rules={[
            { required: true, message: '请输入活动简介' },
            { max: 100, message: '活动简介不能超过100个字符' }
          ]}
        >
          <TextArea rows={3} placeholder='请输入活动简介' />
        </Form.Item>

        <div className='flex gap-16'>
          <div className='flex-1'>
            <Form.Item label='开始时间' name='start_time' rules={[{ required: true, message: '请选择开始时间' }]}>
              <Input type='datetime-local' />
            </Form.Item>
          </div>
          <div className='flex-1'>
            <Form.Item
              label='结束时间'
              name='end_time'
              rules={[
                { required: true, message: '请选择结束时间' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('start_time');

                    if (!value || !startTime) {
                      return Promise.resolve();
                    }

                    if (parseTimeFromInput(value) <= parseTimeFromInput(startTime)) {
                      return Promise.reject(new Error('结束时间必须晚于开始时间'));
                    }

                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input type='datetime-local' />
            </Form.Item>
          </div>
        </div>

        <Form.Item label='详情描述链接' name='detail'>
          <Input placeholder='请输入活动详情页面链接' />
        </Form.Item>

        <Form.Item label='主要奖励内容' name='award'>
          <TextArea rows={3} placeholder='请输入活动奖励内容' />
        </Form.Item>

        <Form.Item label='开放的最低境界' name='limit' rules={[{ required: true, message: '请选择境界' }]}>
          <Select placeholder='请选择境界'>
            {LEVEL_OPTIONS.map(option => (
              <Select.Option key={option} value={option}>
                Lv.{option}+
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className='mb-0'>
          <Space className='w-full justify-end'>
            <Button onClick={onClose}>取消</Button>
            <Button type='primary' htmlType='submit' loading={loading}>
              保存更改
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 新增活动模态框组件
interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateActivityParams) => Promise<void>;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData: CreateActivityParams = {
        title: values.title,
        intro: values.intro,
        start_time: values.start_time ? parseTimeFromInput(values.start_time) : 0,
        end_time: values.end_time ? parseTimeFromInput(values.end_time) : 0,
        award: values.award,
        detail: values.detail,
        limit: values.limit
      };

      await onCreate(formData);
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error('创建失败:', error);
      message.error(error.message ?? '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title='新增活动' open={isOpen} onCancel={onClose} footer={null} width={800} destroyOnClose>
      <Form
        form={form}
        layout='vertical'
        onFinish={values => {
          void handleSubmit(values);
        }}
      >
        <Form.Item label='活动名称' name='title' rules={[{ required: true, message: '请输入活动名称' }]}>
          <Input placeholder='请输入活动名称' />
        </Form.Item>

        <Form.Item label='活动简介' name='intro' rules={[{ required: true, message: '请输入活动简介' }]}>
          <TextArea rows={3} placeholder='请输入活动简介' />
        </Form.Item>

        <div className='flex gap-16'>
          <div className='flex-1'>
            <Form.Item label='开始时间' name='start_time' rules={[{ required: true, message: '请选择开始时间' }]}>
              <Input type='datetime-local' />
            </Form.Item>
          </div>
          <div className='flex-1'>
            <Form.Item
              label='结束时间'
              name='end_time'
              rules={[
                { required: true, message: '请选择结束时间' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('start_time');

                    if (!value || !startTime) {
                      return Promise.resolve();
                    }

                    if (parseTimeFromInput(value) <= parseTimeFromInput(startTime)) {
                      return Promise.reject(new Error('结束时间必须晚于开始时间'));
                    }

                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input type='datetime-local' />
            </Form.Item>
          </div>
        </div>

        <Form.Item label='详情描述链接' name='detail'>
          <Input placeholder='请输入活动详情页面链接' />
        </Form.Item>

        <Form.Item label='主要奖励内容' name='award'>
          <TextArea rows={3} placeholder='请输入活动奖励内容' />
        </Form.Item>

        <Form.Item label='开放的最低境界' name='limit' rules={[{ required: true, message: '请选择境界' }]}>
          <Select placeholder='请选择境界'>
            {LEVEL_OPTIONS.map(option => (
              <Select.Option key={option} value={option}>
                Lv.{option}+
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className='mb-0'>
          <Space className='w-full justify-end'>
            <Button onClick={onClose}>取消</Button>
            <Button type='primary' htmlType='submit' loading={loading}>
              创建活动
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 状态确认模态框组件
interface StatusConfirmModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number, newStatus: number) => Promise<void>;
}

const StatusConfirmModal: React.FC<StatusConfirmModalProps> = ({ activity, isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!activity) {
    return null;
  }

  const newStatus = activity.status === 1 ? 0 : 1;
  const isEnabling = newStatus === 0;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(activity.id, newStatus);
      onClose();
    } catch (error: any) {
      console.error('操作失败:', error);
      message.error(error.message ?? '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEnabling ? '启用活动' : '禁用活动'}
      open={isOpen}
      onCancel={onClose}
      onOk={() => {
        void handleConfirm();
      }}
      confirmLoading={loading}
      okText={isEnabling ? '确认启用' : '确认禁用'}
      cancelText='取消'
      okButtonProps={{
        type: isEnabling ? 'primary' : 'primary',
        danger: !isEnabling
      }}
      width={500}
    >
      <div className='text-center'>
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${isEnabling ? 'bg-green-100' : 'bg-red-100'}`}>
          {isEnabling ? (
            <CheckCircleOutlined className={`text-2xl ${isEnabling ? 'text-green-600' : 'text-red-600'}`} />
          ) : (
            <CloseCircleOutlined className={`text-2xl ${isEnabling ? 'text-green-600' : 'text-red-600'}`} />
          )}
        </div>

        <Text className='text-gray-500 mb-4 block'>
          {isEnabling ? '您确定要启用此活动吗？启用后玩家将可以参与该活动。' : '您确定要禁用此活动吗？禁用后玩家将无法看到和参与该活动。'}
        </Text>

        <Text strong>{activity.title}</Text>
        <br />
        <Text type='secondary' className='text-xs'>
          {isEnabling ? `活动将在 ${formatDateTime(activity.start_time)} 开始` : '活动将立即对玩家隐藏'}
        </Text>

        {isEnabling && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4'>
            <Text className='text-yellow-800 text-sm'>
              <strong>注意：</strong> 启用后不允许修改活动配置。请确保所有设置正确无误。
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

// 主组件
const ActivityManagementPanel: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchParams, setSearchParams] = useState<{
    keyword: string;
    id: string;
  }>({
    keyword: '',
    id: ''
  });
  // 筛选状态（仅保留状态筛选）
  const [filterParams, setFilterParams] = useState<{
    status: 'all' | '0' | '1';
  }>({
    status: 'all'
  });
  // 模态框状态
  const [editModal, setEditModal] = useState<{ isOpen: boolean; activity: Activity | null }>({
    isOpen: false,
    activity: null
  });
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; activity: Activity | null }>({
    isOpen: false,
    activity: null
  });
  const [createModal, setCreateModal] = useState<{ isOpen: boolean }>({
    isOpen: false
  });

  // 获取活动数据
  const fetchActivities = async () => {
    try {
      const result = await activityAPI.getList();

      if (result.success && result.data) {
        setActivities(result.data);
      } else {
        setActivities([]);
      }
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setActivities([]);
    } finally {
      //
    }
  };

  const handleSearch = (field: 'keyword' | 'id', value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetSearch = () => {
    setSearchParams({
      keyword: '',
      id: ''
    });
    // 重置筛选条件
    setFilterParams({
      status: 'all'
    });
  };

  useEffect(() => {
    void fetchActivities();
  }, []);

  // 筛选活动列表（去掉境界筛选逻辑）
  const filteredActivities = Array.isArray(activities)
    ? activities.filter(activity => {
        if (!activity) {
          return false;
        }

        const { keyword, id } = searchParams;
        const { status: filterStatus } = filterParams;

        // 1. ID筛选
        if (id && activity.id.toString() !== id) {
          return false;
        }

        // 2. 关键词筛选
        if (keyword) {
          const searchText = keyword.toLowerCase();
          const titleText = activity.title.toLowerCase();
          const introText = activity.intro.toLowerCase();
          const awardText = activity.award ? activity.award.toLowerCase() : '';
          const matchKeyword = titleText.includes(searchText) ?? introText.includes(searchText) ?? awardText?.includes(searchText);

          if (!matchKeyword) {
            return false;
          }
        }

        // 3. 状态筛选（仅保留这一项）
        if (filterStatus !== 'all' && activity.status.toString() !== filterStatus) {
          return false;
        }

        return true;
      })
    : [];

  // 更新活动信息
  const updateActivity = async (id: number, data: UpdateActivityData) => {
    const result = await activityAPI.update(id, data);

    if (result.success) {
      setActivities(prev => (Array.isArray(prev) ? prev.map(activity => (activity.id === id ? { ...activity, ...data } : activity)) : []));
      message.success(result.message ?? '更新活动成功');
    } else {
      throw new Error(result.message ?? '更新活动失败');
    }
  };

  // 更新活动状态
  const updateActivityStatus = async (id: number, newStatus: number) => {
    const result = await activityAPI.updateStatus(id, newStatus);

    if (result.success) {
      setActivities(prev => (Array.isArray(prev) ? prev.map(activity => (activity.id === id ? { ...activity, status: newStatus } : activity)) : []));
      message.success(result.message ?? '更新活动状态成功');
    } else {
      throw new Error(result.message ?? '更新活动状态失败');
    }
  };

  // 创建活动
  const createActivity = async (data: CreateActivityParams) => {
    const result = await activityAPI.create(data);

    if (result.success && result.data) {
      setActivities(prev => [result.data!, ...prev]);
      message.success(result.message ?? '创建活动成功');
    } else {
      throw new Error(result.message ?? '创建活动失败');
    }
  };

  // 打开编辑模态框
  const handleEdit = (activity: Activity) => {
    if (activity.status === 0) {
      message.warning('活动已启用，不允许修改配置');

      return;
    }
    setEditModal({ isOpen: true, activity });
  };

  // 打开状态确认模态框
  const handleStatusChange = (activity: Activity) => {
    setStatusModal({ isOpen: true, activity });
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '简介',
      dataIndex: 'intro',
      key: 'intro'
    },
    {
      title: '境界限制',
      dataIndex: 'limit',
      key: 'limit',
      render: (limit: number) => <Tag color='purple'>{getLevelName(limit)}</Tag>
    },
    {
      title: '时间安排',
      key: 'time',
      render: (record: Activity) => (
        <Space direction='vertical' size='small'>
          <div>
            <Text type='secondary' className='text-xs'>
              开始:
            </Text>
            <br />
            <Text className='text-sm'>{formatDateTime(record.start_time)}</Text>
          </div>
          <div>
            <Text type='secondary' className='text-xs'>
              结束:
            </Text>
            <br />
            <Text className='text-sm'>{formatDateTime(record.end_time)}</Text>
          </div>
        </Space>
      )
    },
    {
      title: '主要奖励',
      dataIndex: 'award',
      key: 'award',
      render: (award: string) => (
        <Text strong className='text-amber-600'>
          {award}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 0 ? 'green' : 'red'} className='cursor-pointer'>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
      render: (detail: string) => (
        <Link to={detail} target='_blank'>
          点击了解
        </Link>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Activity) => (
        <Space>
          {record.status === 1 ? (
            <>
              <Button type='link' icon={<PlayCircleOutlined />} onClick={() => handleStatusChange(record)}>
                启用
              </Button>
              <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                编辑
              </Button>
            </>
          ) : (
            <Button type='link' icon={<PauseCircleOutlined />} onClick={() => handleStatusChange(record)}>
              停用
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <>
      <div className=''>
        {/* 搜索+状态筛选区域（靠右对齐，去掉境界筛选） */}
        <div className='mb-6 flex  items-center gap-3 justify-between'>
          {/* 状态筛选下拉栏 */}
          <div className='flex gap-2'>
            <Select
              placeholder='筛选状态'
              value={filterParams.status}
              className='min-w-32'
              onChange={(value: 'all' | '0' | '1') => setFilterParams(prev => ({ ...prev, status: value }))}
            >
              {FILTER_OPTIONS.status.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Input
              className='min-w-32'
              placeholder='输入活动ID'
              value={searchParams.id}
              onChange={e => handleSearch('id', e.target.value)}
              style={{ width: 120 }}
            />
            <Input
              className='min-w-32'
              placeholder='搜索标题、简介'
              value={searchParams.keyword}
              onChange={e => handleSearch('keyword', e.target.value)}
              allowClear
            />
            <Button onClick={() => handleSearch('keyword', searchParams.keyword)}>搜索</Button>
            <Button onClick={handleResetSearch}>重置</Button>
          </div>

          {/* 搜索组件 */}
          <div className='flex gap-2'>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => setCreateModal({ isOpen: true })}>
              新增活动
            </Button>
          </div>
        </div>
        <Table columns={columns} dataSource={filteredActivities} rowKey='id' pagination={false} size='middle' />;
      </div>

      <EditActivityModal
        activity={editModal.activity}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, activity: null })}
        onSave={updateActivity}
      />

      <StatusConfirmModal
        activity={statusModal.activity}
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, activity: null })}
        onConfirm={updateActivityStatus}
      />

      <CreateActivityModal isOpen={createModal.isOpen} onClose={() => setCreateModal({ isOpen: false })} onCreate={createActivity} />
    </>
  );
};

export default ActivityManagementPanel;
