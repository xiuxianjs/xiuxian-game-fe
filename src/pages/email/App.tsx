import { getAllGoods, PushMessageForm } from '@/api/email.js';
import { DeleteOutlined, PlusOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';
import { Button, Empty, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Space, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table/InternalTable.js';
import React, { useEffect, useState } from 'react';
import type { CreateEmailParams } from '../../api/index.js';
import { adminAPI, createEmail, deleteEmail, getEmail, updateEmail } from '../../api/index.js';

const { Option } = Select;
const { Text } = Typography;

interface EmailItemType {
  uniqueId: string;
  itemId: number;
  category: string;
  name: string;
}

interface EmailItemWithCount {
  uniqueId: string;
  itemId: number;
  category: string;
  name: string;
  quantity: number;
}

const MessageManagement: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm<PushMessageForm>();
  const [loading, setLoading] = useState(false);
  const [adminOptions, setAdminOptions] = useState<{ value: number; label: string; username: string }[]>([]);
  const [emailList, setEmailList] = useState<any[]>([]);
  const [currentEmailId, setCurrentEmailId] = useState<number | null>(null);
  const [goodsOptions, setGoodsOptions] = useState<EmailItemType[]>([]);
  const [selectedItems, setSelectedItems] = useState<EmailItemWithCount[]>([]);
  const [currentItem, setCurrentItem] = useState<{ uniqueId: string; quantity: number }>({
    uniqueId: '',
    quantity: 1
  });

  // 获取管理员列表
  useEffect(() => {
    const fetchAdminOptions = async () => {
      try {
        const response = await adminAPI.getList({ page: 1, pageSize: 99, search: '' });

        if (response.success && response.data && Array.isArray(response.data.list)) {
          const formattedOptions = response.data.list.map((item: any) => ({
            value: item.id,
            label: item.name,
            username: item.username
          }));

          setAdminOptions(formattedOptions);
        } else {
          console.log('接口条件不满足:', { success: response.success, hasData: !!response.data, isArray: Array.isArray(response.data?.list) });
          message.warning('未获取到管理员列表');
        }
      } catch (error) {
        console.error('获取管理员列表失败:', error);
        message.error('获取管理员列表失败，请重试');
      }
    };

    void fetchAdminOptions();
  }, []);

  // 获取邮件列表
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await getEmail();

        if (res.success && Array.isArray(res.data)) {
          setEmailList(res.data);
        } else {
          message.warning('未获取到邮件数据');
        }
      } catch (error) {
        console.error('获取邮件列表失败:', error);
        message.error('获取邮件列表失败，请重试');
      }
    };

    void fetchEmails();
  }, []);

  // 获取物品列表
  useEffect(() => {
    const fetchGoodsOptions = async () => {
      try {
        const response = await getAllGoods();
        const moneyItems = [
          {
            uniqueId: 'money_0',
            itemId: 0,
            category: 'money',
            name: '灵石'
          },
          {
            uniqueId: 'money_1',
            itemId: 1,
            category: 'money',
            name: '灵晶'
          },
          {
            uniqueId: 'money_2',
            itemId: 2,
            category: 'money',
            name: '灵乳'
          }
        ];

        if (response.success && Array.isArray(response.data)) {
          setGoodsOptions([...moneyItems, ...response.data]);
        } else {
          console.log('获取物品列表失败:', response);
          message.warning('未获取到物品列表');
        }
      } catch (error) {
        console.error('获取物品列表失败:', error);
        message.error('获取物品列表失败，请重试');
      }
    };

    void fetchGoodsOptions();
  }, []);

  // 处理物品选择变化
  const handleItemChange = (value: string) => {
    setCurrentItem(prev => ({ ...prev, uniqueId: value }));
  };

  // 处理数量变化
  const handleCountChange = (value: number | null) => {
    if (value !== null) {
      setCurrentItem(prev => ({ ...prev, quantity: value }));
    }
  };

  // 添加物品到列表
  const handleAddItem = () => {
    if (!currentItem.uniqueId) {
      message.warning('请选择物品');

      return;
    }

    if (currentItem.quantity < 1) {
      message.warning('数量必须大于0');

      return;
    }

    const selectedGood = goodsOptions.find(item => item.uniqueId === currentItem.uniqueId);

    if (!selectedGood) {
      message.error('选择的物品不存在');

      return;
    }

    // 检查是否已添加相同物品
    const existingIndex = selectedItems.findIndex(item => item.uniqueId === currentItem.uniqueId);

    if (existingIndex > -1) {
      // 更新已存在物品的数量
      const updatedItems = [...selectedItems];

      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + currentItem.quantity
      };
      setSelectedItems(updatedItems);
    } else {
      // 添加新物品
      setSelectedItems(prev => [
        ...prev,
        {
          ...selectedGood,
          quantity: currentItem.quantity
        }
      ]);
    }

    // 重置当前选择
    setCurrentItem({
      uniqueId: '',
      quantity: 1
    });
  };

  // 从列表中移除物品
  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems];

    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  // 清空物品列表
  const handleClearItems = () => {
    setSelectedItems([]);
  };

  // 模态框控制
  const handleOpenModal = () => {
    setCurrentEmailId(null);
    setSelectedItems([]); // 清空物品列表
    form.resetFields();
    setVisible(true);
  };

  const handleCloseModal = () => {
    setCurrentEmailId(null);
    setSelectedItems([]); // 清空物品列表
    form.resetFields();
    setVisible(false);
  };

  const sendEmail = (record: any) => {
    void (async () => {
      try {
        const emailId = record.id;
        const response = await updateEmail({ id: emailId });

        if (response.success) {
          message.success('邮件更新成功');
          const res = await getEmail();

          if (res.success && Array.isArray(res.data)) {
            setEmailList(res.data);
          }
        } else {
          message.error(`更新失败：${response.message ?? '未知错误'}`);
        }
      } catch (error) {
        console.error('更新邮件失败:', error);
        message.error('网络异常，更新失败');
      }
    })();
  };

  // 确认删除邮件
  const handleConfirmDelete = async (emailId: number) => {
    try {
      const response = await deleteEmail({ id: emailId });

      if (response.success) {
        message.success('邮件删除成功');
        const res = await getEmail();

        if (res.success && Array.isArray(res.data)) {
          setEmailList(res.data);
        }
      } else {
        throw new Error(response.message ?? '删除失败');
      }
    } catch (error: any) {
      throw new Error(error.message ?? '删除失败，请重试');
    }
  };

  // 表单提交
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const handleSubmit: FormProps<PushMessageForm>['onFinish'] = async values => {
    setLoading(true);
    try {
      const activeButton = document.activeElement as HTMLButtonElement;
      const triggerName = activeButton?.name as 'saveDraft' | 'send';

      // 构建附加物品数据
      const itemsData = selectedItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        category: item.category,
        name: item.name
      }));

      if (currentEmailId === null) {
        const params: CreateEmailParams = {
          ...values,
          type: triggerName === 'saveDraft' ? 'draft' : 'send',
          goodsList: itemsData as any[]
        };

        const response = await createEmail(params);

        if (response.success) {
          Modal.success({ title: params.type === 'draft' ? '草稿保存成功' : '发送成功', content: response.message });
        } else {
          message.error(response.message);
        }
      } else {
        const params: any = {
          id: currentEmailId,
          type: triggerName === 'saveDraft' ? 'draft' : 'send'
        };

        const response = await updateEmail(params);

        if (response.success) {
          Modal.success({ title: triggerName === 'saveDraft' ? '草稿更新成功' : '邮件更新并发送成功', content: response.message });
        } else {
          message.error(response.message);
        }
      }

      // 提交后关闭模态框+刷新列表
      setVisible(false);
      setSelectedItems([]); // 清空物品列表

      const fetchAfterSubmit = async () => {
        const res = await getEmail();

        if (res.success && Array.isArray(res.data)) {
          setEmailList(res.data);
        }
      };

      void fetchAfterSubmit();
    } catch (error) {
      console.error('操作失败:', error);
      message.error('网络异常，请重试');
    } finally {
      setLoading(false);
      setCurrentEmailId(null);
    }
  };

  // 表格列配置
  const columns: ColumnsType<any> = [
    { title: '邮件ID', dataIndex: 'id', key: 'id' },
    { title: '标题', dataIndex: 'name', key: 'name' },
    { title: '副标题', dataIndex: 'subtitle', key: 'subtitle' },
    {
      title: '发信人',
      dataIndex: 'aid',
      key: 'aid',
      render: (aid: number) => {
        const admin = adminOptions.find(option => option.value === aid);

        return admin ? admin.label : `ID: ${aid}`;
      }
    },
    {
      title: '发送时间',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_value, record) => (
        <Space size='middle'>
          {record.status === 0 ? (
            <Popconfirm
              title='发送邮件'
              description='确定要发送此邮件吗？'
              onConfirm={() => {
                void sendEmail(record);
              }}
              okText='确定'
              cancelText='取消'
            >
              <Button type='link'>立即发送</Button>
            </Popconfirm>
          ) : (
            <Text className='px-4' type='success'>
              已发送
            </Text>
          )}
          <Popconfirm
            title='删除邮箱'
            description='确定要删除此邮箱吗？'
            onConfirm={() => {
              void handleConfirmDelete(record.id);
            }}
            okText='确定'
            cancelText='取消'
          >
            <Button type='link' danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className='flex  justify-end'>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenModal}>
          推送邮件
        </Button>
      </div>

      {emailList.length > 0 ? (
        <Table dataSource={emailList} columns={columns} rowKey='id' pagination={{ pageSize: 10 }} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无邮件数据' />
      )}

      {/* 新增/编辑邮件模态框 */}
      <Modal
        title={currentEmailId ? '更新邮件' : '推送邮件'}
        open={visible}
        onCancel={handleCloseModal}
        maskClosable={false}
        width={700}
        footer={[
          <Button key='cancel' onClick={handleCloseModal} disabled={loading}>
            取消
          </Button>,
          <Button key='saveDraft' icon={<SaveOutlined />} form='pushForm' htmlType='submit' name='saveDraft' loading={loading}>
            存为草稿
          </Button>,
          <Button key='send' type='primary' icon={<SendOutlined />} form='pushForm' htmlType='submit' name='send' loading={loading}>
            {currentEmailId ? '更新并发送' : '立即发送'}
          </Button>
        ]}
      >
        <Form
          form={form}
          id='pushForm'
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            receiver: '',
            sender: adminOptions[0]?.value
          }}
        >
          <Form.Item
            name='title'
            label='标题'
            rules={[
              { required: true, message: '请输入标题' },
              { max: 50, message: '标题长度不能超过50字' }
            ]}
          >
            <Input placeholder='请输入邮件标题' />
          </Form.Item>
          <Form.Item name='subtitle' label='副标题' rules={[{ max: 100, message: '副标题长度不能超过100字' }]}>
            <Input placeholder='请输入副标题' />
          </Form.Item>
          <Form.Item name='content' label='内容' rules={[{ max: 500, message: '内容长度不能超过500字' }]}>
            <Input.TextArea placeholder='请输入邮件内容' rows={5} showCount />
          </Form.Item>

          {/* 附加物品选择区域 */}
          <Form.Item label='附加物品'>
            <div style={{ marginBottom: 16 }}>
              <Space align='baseline' style={{ width: '100%' }}>
                <Select
                  placeholder='选择物品'
                  style={{ width: 200 }}
                  value={currentItem.uniqueId}
                  onChange={handleItemChange}
                  showSearch
                  filterOption={(input, option) => (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())}
                >
                  {goodsOptions.map(item => (
                    <Option key={item.uniqueId} value={item.uniqueId}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
                <InputNumber placeholder='数量' min={1} value={currentItem.quantity} onChange={handleCountChange} style={{ width: 120 }} />
                <Button type='default' onClick={handleAddItem} icon={<PlusOutlined />}>
                  添加
                </Button>
                {selectedItems.length > 0 && (
                  <Button type='default' danger onClick={handleClearItems} icon={<DeleteOutlined />}>
                    清空
                  </Button>
                )}
              </Space>
            </div>

            {/* 已添加物品列表 */}
            {selectedItems.length > 0 && (
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>已添加物品 ({selectedItems.length})：</div>
                {selectedItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < selectedItems.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                  >
                    <div>
                      <span>{item.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span>数量: {item.quantity}</span>
                      <Button type='text' danger size='small' icon={<DeleteOutlined />} onClick={() => handleRemoveItem(index)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form.Item>

          <Form.Item name='receiver' label='收信人'>
            <Input placeholder='不输入ID表示全体，ARRAY(JSON)' />
          </Form.Item>
          <Form.Item name='sender' label='发信人' rules={[{ required: true, message: '请选择发信人' }]}>
            <Select
              placeholder='请选择管理员'
              showSearch
              style={{ width: '100%' }}
              filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}
            >
              {adminOptions.map(o => (
                <Option key={o.value} value={o.value}>
                  {o.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessageManagement;
