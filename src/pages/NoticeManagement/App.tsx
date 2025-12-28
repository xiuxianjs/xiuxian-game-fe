import { CreateNoticeRequest, Notice, noticeApi, UpdateNoticeRequest } from '@/api';
import { EditOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Modal, Row, Space, Spin, Table, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 编辑公告模态框组件
interface EditAnnouncementModalProps {
  announcement: Notice | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: UpdateNoticeRequest) => Promise<void>;
}

const EditAnnouncementModal: React.FC<EditAnnouncementModalProps> = ({ announcement, isOpen, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (announcement && isOpen) {
      form.setFieldsValue({
        title: announcement.title,
        subtitle: announcement.subtitle,
        content: announcement.content,
        abstract: announcement.abstract
      });
    }
  }, [announcement, isOpen, form]);

  const handleSubmit = async (values: any) => {
    if (!announcement) {
      return;
    }

    setLoading(true);
    try {
      const formData: UpdateNoticeRequest = {
        id: announcement.id,
        title: values.title,
        subtitle: values.subtitle,
        content: values.content,
        abstract: values.abstract ?? values.content.substring(0, 100),
        status: announcement.status
      };

      await onSave(+announcement.id, formData);
      onClose();
    } catch (error: any) {
      console.error('保存失败:', error);
      message.error(error.message ?? '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title='编辑公告' open={isOpen} onCancel={onClose} footer={null} width={700}>
      <Form
        form={form}
        layout='vertical'
        onFinish={values => {
          void handleSubmit(values);
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label='标题'
              name='title'
              rules={[
                { required: true, message: '请输入标题' },
                { max: 6, message: '标题长度不能超过6个字符' }
              ]}
            >
              <Input placeholder='请输入公告标题' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='副标题'
              name='subtitle'
              rules={[
                { required: true, message: '请输入副标题' },
                { max: 12, message: '副标题长度不能超过12个字符' }
              ]}
            >
              <Input placeholder='请输入公告副标题' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='摘要' name='abstract' rules={[{ required: true, message: '请输入公告摘要' }]}>
          <TextArea rows={3} placeholder='请输入公告摘要' showCount maxLength={200} />
        </Form.Item>

        <Form.Item label='内容' name='content' rules={[{ required: true, message: '请输入公告内容' }]}>
          <TextArea rows={6} placeholder='请输入公告内容' showCount maxLength={1000} />
        </Form.Item>

        <Form.Item>
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

// 新增公告模态框组件
interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateNoticeRequest) => Promise<void>;
}

const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData: CreateNoticeRequest = {
        title: values.title,
        subtitle: values.subtitle,
        content: values.content,
        abstract: values.abstract
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
    <Modal title='新增公告' open={isOpen} onCancel={onClose} footer={null} width={700}>
      <Form
        form={form}
        layout='vertical'
        onFinish={values => {
          void handleSubmit(values);
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label='标题'
              name='title'
              rules={[
                { required: true, message: '请输入标题' },
                { max: 6, message: '标题长度不能超过6个字符' }
              ]}
            >
              <Input placeholder='请输入公告标题' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='副标题'
              name='subtitle'
              rules={[
                { required: true, message: '请输入副标题' },
                { max: 12, message: '副标题长度不能超过12个字符' }
              ]}
            >
              <Input placeholder='请输入公告副标题' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='摘要' name='abstract' rules={[{ required: true, message: '请输入公告摘要' }]}>
          <TextArea rows={3} placeholder='请输入公告摘要' showCount maxLength={200} />
        </Form.Item>

        <Form.Item label='内容' name='content' rules={[{ required: true, message: '请输入公告内容' }]}>
          <TextArea rows={6} placeholder='请输入公告内容' showCount maxLength={1000} />
        </Form.Item>

        <Form.Item>
          <Space className='w-full justify-end'>
            <Button onClick={onClose}>取消</Button>
            <Button type='primary' htmlType='submit' loading={loading}>
              创建公告
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 状态确认模态框组件
interface StatusConfirmModalProps {
  announcement: Notice | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number, newStatus: number) => Promise<void>;
}

const StatusConfirmModal: React.FC<StatusConfirmModalProps> = ({ announcement, isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!announcement) {
    return null;
  }

  const newStatus = announcement.status === 1 ? 0 : 1;
  const isEnabling = newStatus === 1;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(+announcement.id, newStatus);
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
      title={isEnabling ? '展示公告' : '隐藏公告'}
      open={isOpen}
      onCancel={onClose}
      onOk={() => {
        void handleConfirm();
      }}
      confirmLoading={loading}
      okText={isEnabling ? '确认展示' : '确认隐藏'}
      cancelText='取消'
      width={500}
    >
      <div className='text-center'>
        <Text className='text-gray-500 mb-4 block'>
          {isEnabling ? '您确定要展示此公告吗？展示后用户将可以看到该公告。' : '您确定要隐藏此公告吗？隐藏后用户将无法看到该公告。'}
        </Text>

        <Card size='small' className='mb-4'>
          <Text strong>{announcement.title}</Text>
          <br />
          <Text type='secondary' className='text-xs'>
            {announcement.subtitle}
          </Text>
        </Card>
      </div>
    </Modal>
  );
};

// 主组件
const AnnouncementManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 模态框状态
  const [editModal, setEditModal] = useState<{ isOpen: boolean; announcement: Notice | null }>({
    isOpen: false,
    announcement: null
  });
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; announcement: Notice | null }>({
    isOpen: false,
    announcement: null
  });
  const [createModal, setCreateModal] = useState<{ isOpen: boolean }>({
    isOpen: false
  });

  // 加载公告列表
  const loadAnnouncements = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await noticeApi.getList(page);

      setAnnouncements(response.data?.data ?? []);
      setTotal(response.data?.total ?? 0);
      setCurrentPage(response.data?.page ?? 1);
    } catch (err: any) {
      setError(err.message ?? '加载公告列表失败');
      console.error('Failed to load announcements:', err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnnouncements(currentPage);
  }, []);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    void loadAnnouncements(page);
  };

  // 更新公告信息
  const updateAnnouncement = async (id: number, data: UpdateNoticeRequest) => {
    try {
      await noticeApi.update(data);
      setAnnouncements(prev => prev.map(item => (+item.id === id ? { ...item, ...data } : item)));
      message.success('公告修改成功');
    } catch (error: any) {
      throw new Error(error.message ?? '更新公告失败');
    }
  };

  // 更新公告状态
  const updateAnnouncementStatus = async (id: number, newStatus: number) => {
    try {
      await noticeApi.updateStatus(id, newStatus);
      setAnnouncements(prev => prev.map(item => (+item.id === id ? { ...item, status: newStatus } : item)));
      message.success(`公告已${newStatus === 1 ? '展示' : '隐藏'}`);
    } catch (error: any) {
      throw new Error(error.message ?? '更新公告状态失败');
    }
  };

  // 创建公告
  const createAnnouncement = async (data: CreateNoticeRequest) => {
    try {
      await noticeApi.create(data);
      message.success('公告新增成功');
      await loadAnnouncements(currentPage);
    } catch (error: any) {
      throw new Error(error.message ?? '创建公告失败');
    }
  };

  // 打开编辑模态框
  const handleEdit = (announcement: Notice) => {
    setEditModal({ isOpen: true, announcement });
  };

  // 打开状态确认模态框
  const handleStatusChange = (announcement: Notice) => {
    setStatusModal({ isOpen: true, announcement });
  };

  // 表格列定义
  const columns = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 120,
      ellipsis: true
    },
    {
      title: '副标题',
      dataIndex: 'subtitle',
      key: 'subtitle',
      width: 240,
      ellipsis: true
    },
    {
      title: '摘要',
      dataIndex: 'abstract',
      key: 'abstract',
      ellipsis: true,
      width: 200,
      render: (text: string) => text ?? '-'
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      ellipsis: true,
      render: (text: string) => text ?? '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (status: number) => <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '展示中' : '已隐藏'}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center' as const,
      render: (_: any, record: Notice) => (
        <Space size='small'>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type='link' icon={record.status === 1 ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => handleStatusChange(record)}>
            {record.status === 1 ? '隐藏' : '展示'}
          </Button>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Spin size='large' tip='加载公告中...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-2xl mx-auto'>
        <Card>
          <div className='text-center'>
            <Title level={4} className='text-red-700 mb-2'>
              加载失败
            </Title>
            <Text type='secondary' className='mb-4 block'>
              {error}
            </Text>
            <Button
              type='primary'
              icon={<ReloadOutlined />}
              onClick={() => {
                void loadAnnouncements();
              }}
            >
              重新加载
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex justify-end'>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => setCreateModal({ isOpen: true })}>
            新增公告
          </Button>
        </div>
        <Spin spinning={loading} size='large'>
          <Table
            columns={columns}
            dataSource={announcements}
            rowKey='id'
            scroll={{ x: 800 }}
            pagination={{
              current: currentPage,
              total: total,
              pageSize: 10,
              onChange(page) {
                handlePageChange(page);
              }
            }}
          />
        </Spin>
      </div>

      <EditAnnouncementModal
        announcement={editModal.announcement}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, announcement: null })}
        onSave={updateAnnouncement}
      />

      <StatusConfirmModal
        announcement={statusModal.announcement}
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, announcement: null })}
        onConfirm={updateAnnouncementStatus}
      />

      <CreateAnnouncementModal isOpen={createModal.isOpen} onClose={() => setCreateModal({ isOpen: false })} onCreate={createAnnouncement} />
    </>
  );
};

export default AnnouncementManagement;
