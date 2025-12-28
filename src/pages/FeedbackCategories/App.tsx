import {
  createFeedbackCategory,
  getFeedbackCategories,
  updateFeedbackCategory,
  type CreateFeedbackCategoryParams,
  type FeedbackCategory,
  type FeedbackCategoryQueryParams,
  type UpdateFeedbackCategoryParams
} from '@/api/feedbackCategories';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, notification, Row, Select, Space, Switch, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { useEffect, useState } from 'react';

// 设置dayjs为中文本地化
dayjs.locale('zh-cn');

// 定义 notification 延时常量
const NOTIFICATION_DURATION = 2; // 2秒自动关闭

interface FeedbackCategoryFormData {
  name: string;
  isEnabled: boolean;
}

export default function FeedbackCategories() {
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FeedbackCategory | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
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
  const fetchCategories = async (page = 1, limit = 10, name = '', isEnabled?: string) => {
    setLoading(true);
    try {
      const params: FeedbackCategoryQueryParams = {
        page,
        limit,
        name: name.trim() || undefined,
        isEnabled
      };

      const response = await getFeedbackCategories(params);

      setCategories(response.list);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error) {
      console.error('获取反馈分类列表失败:', error);
      api.error({ message: '操作失败', description: '获取反馈分类列表失败' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建反馈分类
   */
  const handleCreateCategory = async (values: FeedbackCategoryFormData) => {
    try {
      const params: CreateFeedbackCategoryParams = {
        name: values.name.trim(),
        isEnabled: values.isEnabled
      };

      await createFeedbackCategory(params);
      api.success({ message: '操作成功', description: '反馈分类创建成功' });
      setModalVisible(false);
      form.resetFields();
      await fetchCategories(pagination.current, pagination.pageSize, searchText, statusFilter);
    } catch (error: any) {
      console.error('创建反馈分类失败:', error);
      const errorMessage = error?.response?.data?.message ?? '创建反馈分类失败';

      api.error({ message: '操作失败', description: errorMessage });
    }
  };

  /**
   * 更新反馈分类
   */
  const handleUpdateCategory = async (values: FeedbackCategoryFormData) => {
    if (!editingCategory) {
      return;
    }

    try {
      const params: UpdateFeedbackCategoryParams = {
        id: editingCategory.id,
        name: values.name.trim(),
        isEnabled: values.isEnabled
      };

      await updateFeedbackCategory(params);
      api.success({ message: '操作成功', description: '反馈分类更新成功' });
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      await fetchCategories(pagination.current, pagination.pageSize, searchText, statusFilter);
    } catch (error: any) {
      console.error('更新反馈分类失败:', error);
      const errorMessage = error?.response?.data?.message ?? '更新反馈分类失败';

      api.error({ message: '操作失败', description: errorMessage });
    }
  };

  /**
   * 打开编辑模态框
   */
  const openEditModal = (category: FeedbackCategory) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      isEnabled: category.isEnabled
    });
    setModalVisible(true);
  };

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: FeedbackCategoryFormData) => {
    if (editingCategory) {
      await handleUpdateCategory(values);
    } else {
      await handleCreateCategory(values);
    }
  };

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    void fetchCategories(1, pagination.pageSize, searchText, statusFilter);
  };

  /**
   * 处理状态筛选
   */
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? undefined : value);
  };

  /**
   * 处理分页变化
   */
  const handleTableChange = (paginationConfig: any) => {
    void fetchCategories(paginationConfig.current, paginationConfig.pageSize, searchText, statusFilter);
  };

  /**
   * 处理状态切换
   * @param categoryId 分类ID
   * @param newStatus 新状态
   */
  const handleStatusToggle = async (categoryId: number, newStatus: boolean) => {
    try {
      setLoading(true);
      await updateFeedbackCategory({ id: categoryId, isEnabled: newStatus });
      api.success({ message: '操作成功', description: '状态更新成功' });
      // 重新获取数据，保持当前的搜索条件和分页
      await fetchCategories(pagination.current, pagination.pageSize, searchText, statusFilter);
    } catch (error) {
      console.error('状态更新失败:', error);
      api.error({ message: '操作失败', description: '状态更新失败' });
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<FeedbackCategory> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      width: 100,
      render: (isEnabled: boolean, record: FeedbackCategory) => (
        <Switch
          checked={isEnabled}
          onChange={checked => {
            void handleStatusToggle(record.id, checked);
          }}
          checkedChildren='启用'
          unCheckedChildren='停用'
          loading={loading}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt: string) => {
        if (!createdAt) {
          return '-';
        }

        return dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (updatedAt: string) => {
        if (!updatedAt) {
          return '-';
        }

        return dayjs(updatedAt).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size='middle'>
          <Button type='link' icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
        </Space>
      )
    }
  ];

  // 组件挂载时获取数据
  useEffect(() => {
    void fetchCategories();
  }, []);

  return (
    <div>
      <div className='mb-4'>
        <Row gutter={16} align='middle' justify='space-between'>
          <Col>
            <Space>
              <Select
                placeholder='筛选状态'
                value={statusFilter ?? 'all'}
                onChange={handleStatusFilter}
                style={{ width: 120 }}
                options={[
                  { label: '全部', value: 'all' },
                  { label: '启用', value: 'true' },
                  { label: '禁用', value: 'false' }
                ]}
              />
              <Input
                placeholder='搜索分类名称'
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 300 }}
              />
              <Button type='primary' onClick={handleSearch}>
                搜索
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button type='primary' icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                新增分类
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey='id'
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          locale: {
            jump_to: '跳至',
            page: '页',
            items_per_page: '条/页',
            prev_page: '上一页',
            next_page: '下一页'
          }
        }}
        onChange={handleTableChange}
      />

      <Modal title={editingCategory ? '编辑反馈分类' : '新增反馈分类'} open={modalVisible} onCancel={closeModal} footer={null} width={500}>
        <Form
          form={form}
          layout='vertical'
          onFinish={values => {
            void handleSubmit(values);
          }}
          initialValues={{ isEnabled: true }}
        >
          <Form.Item
            label='分类名称'
            name='name'
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 8, message: '分类名称最多8个字符' },
              { whitespace: true, message: '分类名称不能为空白字符' }
            ]}
          >
            <Input placeholder='请输入分类名称' maxLength={8} />
          </Form.Item>

          <Form.Item label='启用状态' name='isEnabled' valuePropName='checked'>
            <Switch checkedChildren='启用' unCheckedChildren='禁用' />
          </Form.Item>

          <Form.Item className='mb-0'>
            <Space className='w-full justify-end'>
              <Button onClick={closeModal}>取消</Button>
              <Button type='primary' htmlType='submit'>
                {editingCategory ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
