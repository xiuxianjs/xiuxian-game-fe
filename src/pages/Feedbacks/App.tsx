import { getFeedbackCategories, type FeedbackCategory } from '@/api/feedbackCategories';
import { deleteFeedback, getFeedbacks, updateFeedback, type Feedback, type FeedbackQueryParams, type UpdateFeedbackParams } from '@/api/feedbacks';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, notification, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { useEffect, useState } from 'react';

// 设置dayjs为中文本地化
dayjs.locale('zh-cn');

// 定义 notification 延时常量
const NOTIFICATION_DURATION = 2; // 2秒自动关闭

const { TextArea } = Input;

interface EditFormData {
  reply: string;
  categoryId: number;
}

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [userIdFilter] = useState('');
  const [api] = notification.useNotification({
    duration: NOTIFICATION_DURATION
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  /**
   * 获取反馈分类列表
   */
  const fetchCategories = async () => {
    try {
      const response = await getFeedbackCategories({ limit: 100 });

      setCategories(response.list);
    } catch (error) {
      console.error('获取反馈分类失败:', error);
    }
  };

  /**
   * 获取反馈列表
   */
  const fetchFeedbacks = async (page = 1, limit = 10, content = '', categoryId?: number, isReplied?: string, userId?: number) => {
    setLoading(true);
    try {
      const params: FeedbackQueryParams = {
        page,
        limit,
        content: content.trim() || undefined,
        categoryId,
        isReplied,
        userId
      };

      const response = await getFeedbacks(params);

      setFeedbacks(response.list);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      api.error({ message: '操作失败', description: '获取反馈列表失败' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 编辑反馈
   */
  const handleEditFeedback = async (values: EditFormData) => {
    if (!currentFeedback) {
      return;
    }

    try {
      const params: UpdateFeedbackParams = {
        id: currentFeedback.id,
        reply: values.reply.trim(),
        categoryId: values.categoryId
      };

      await updateFeedback(params);
      api.success({ message: '操作成功', description: '编辑成功' });
      setEditModalVisible(false);
      setCurrentFeedback(null);
      form.resetFields();
      await fetchFeedbacks(
        pagination.current,
        pagination.pageSize,
        searchText,
        categoryFilter,
        statusFilter,
        userIdFilter ? parseInt(userIdFilter) : undefined
      );
    } catch (error: any) {
      console.error('编辑反馈失败:', error);
      const errorMessage = error?.response?.data?.message ?? '编辑反馈失败';

      api.error({ message: '操作失败', description: errorMessage });
    }
  };

  /**
   * 删除反馈
   */
  const handleDeleteFeedback = async (feedbackId: number) => {
    try {
      await deleteFeedback({ id: feedbackId });
      api.success({ message: '操作成功', description: '删除成功' });
      await fetchFeedbacks(
        pagination.current,
        pagination.pageSize,
        searchText,
        categoryFilter,
        statusFilter,
        userIdFilter ? parseInt(userIdFilter) : undefined
      );
    } catch (error: any) {
      console.error('删除反馈失败:', error);
      const errorMessage = error?.response?.data?.message ?? '删除反馈失败';

      api.error({ message: '操作失败', description: errorMessage });
    }
  };

  /**
   * 打开编辑模态框
   */
  const openEditModal = (feedback: Feedback) => {
    setCurrentFeedback(feedback);
    form.setFieldsValue({
      reply: feedback.reply ?? '',
      categoryId: feedback.category?.id
    });
    setEditModalVisible(true);
  };

  /**
   * 关闭编辑模态框
   */
  const closeEditModal = () => {
    setEditModalVisible(false);
    setCurrentFeedback(null);
    form.resetFields();
  };

  /**
   * 处理搜索
   */
  const handleSearch = async () => {
    await fetchFeedbacks(1, pagination.pageSize, searchText, categoryFilter, statusFilter, userIdFilter ? parseInt(userIdFilter) : undefined);
  };

  /**
   * 处理分类筛选
   */
  const handleCategoryFilter = (value: number | undefined) => {
    setCategoryFilter(value);
  };

  /**
   * 处理状态筛选
   */
  const handleStatusFilter = (value: string | undefined) => {
    setStatusFilter(value === 'all' ? undefined : value);
  };

  /**
   * 处理分页变化
   */
  const handleTableChange = async (paginationConfig: any) => {
    await fetchFeedbacks(
      paginationConfig.current,
      paginationConfig.pageSize,
      searchText,
      categoryFilter,
      statusFilter,
      userIdFilter ? parseInt(userIdFilter) : undefined
    );
  };

  // 表格列定义
  const columns: ColumnsType<Feedback> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: category => <Tag color={category?.isEnabled ? 'green' : 'red'}>{category?.name ?? '未知分类'}</Tag>
    },
    {
      title: '反馈内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: {
        showTitle: false
      },
      render: content => (
        <Tooltip placement='topLeft' title={content}>
          <div style={{ maxWidth: 200 }}>{content}</div>
        </Tooltip>
      )
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100
    },
    {
      title: '反馈时间',
      dataIndex: 'feedbackTime',
      key: 'feedbackTime',
      width: 160,
      render: time => {
        if (!time) {
          return '-';
        }

        return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '回复状态',
      dataIndex: 'isReplied',
      key: 'isReplied',
      width: 100,
      render: isReplied => <Tag color={isReplied ? 'green' : 'orange'}>{isReplied ? '已回复' : '待回复'}</Tag>
    },
    {
      title: '回复内容',
      dataIndex: 'reply',
      key: 'reply',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: reply => {
        if (!reply) {
          return '-';
        }

        return (
          <Tooltip placement='topLeft' title={reply}>
            <div style={{ maxWidth: 180 }}>{reply}</div>
          </Tooltip>
        );
      }
    },
    {
      title: '回复时间',
      dataIndex: 'replyTime',
      key: 'replyTime',
      width: 160,
      render: time => {
        if (!time) {
          return '-';
        }

        return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size='small'>
          <Tooltip title='编辑'>
            <Button type='primary' size='small' icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title='确定要删除这条反馈吗？'
            onConfirm={() => {
              void handleDeleteFeedback(record.id);
            }}
            okText='确定'
            cancelText='取消'
          >
            <Tooltip title='删除'>
              <Button danger size='small' icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 初始化数据
  useEffect(() => {
    void fetchCategories();
    void fetchFeedbacks();
  }, []);

  return (
    <div>
      <div className='flex justify-between'>
        <div className='flex gap-2'>
          <Select
            placeholder='选择分类'
            value={categoryFilter}
            onChange={handleCategoryFilter}
            allowClear
            showSearch
            filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            style={{ width: '100%' }}
          >
            {categories.map(category => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
          <Select placeholder='回复状态' value={statusFilter ?? 'all'} onChange={handleStatusFilter} style={{ width: '100%' }}>
            <Select.Option value='all'>全部</Select.Option>
            <Select.Option value='true'>已回复</Select.Option>
            <Select.Option value='false'>待回复</Select.Option>
          </Select>
          <Input placeholder='搜索反馈内容' value={searchText} onChange={e => setSearchText(e.target.value)} />
          <Button
            type='primary'
            icon={<SearchOutlined />}
            onClick={() => {
              void handleSearch();
            }}
          >
            搜索
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={feedbacks}
        rowKey='id'
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
          locale: {
            jump_to: '跳至',
            page: '页',
            items_per_page: '条/页',
            prev_page: '上一页',
            next_page: '下一页'
          }
        }}
        onChange={paginationConfig => {
          void handleTableChange(paginationConfig);
        }}
        scroll={{ x: 1400 }}
      />

      {/* 编辑模态框 */}
      <Modal title={`编辑反馈 #${currentFeedback?.id}`} open={editModalVisible} onCancel={closeEditModal} footer={null} width={600}>
        {currentFeedback && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>反馈内容：</strong>
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  marginTop: '8px'
                }}
              >
                {currentFeedback.content}
              </div>
            </div>

            <Form
              form={form}
              onFinish={values => {
                void handleEditFeedback(values);
              }}
              layout='vertical'
            >
              <Form.Item name='categoryId' label='反馈分类' rules={[{ required: true, message: '请选择反馈分类' }]}>
                <Select
                  placeholder='选择分类'
                  showSearch
                  filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
                >
                  {categories.map(category => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name='reply'
                label='回复内容'
                rules={[
                  { required: true, message: '请输入回复内容' },
                  { max: 1000, message: '回复内容不能超过1000个字符' }
                ]}
              >
                <TextArea rows={6} placeholder='请输入回复内容...' showCount maxLength={1000} disabled={currentFeedback.isReplied} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={closeEditModal}>取消</Button>
                  <Button type='primary' htmlType='submit'>
                    保存修改
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
