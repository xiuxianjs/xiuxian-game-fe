import { GameConfigCategory, gameConfigCategoryApi } from '@/api/gameConfigCategory';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Space, Table, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

const { TextArea } = Input;

interface CategoryFormData {
  name: string;
  displayName: string;
  description?: string;
  sortOrder: number;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<GameConfigCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GameConfigCategory | null>(null);
  const [form] = Form.useForm();
  const [api] = notification.useNotification();

  // 获取分类列表
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await gameConfigCategoryApi.getList();

      setCategories(res.data.list);
    } catch (error) {
      console.error('获取分类失败:', error);
      api.error({ message: '获取分类失败' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  // 打开新增对话框
  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑对话框
  const handleEdit = (category: GameConfigCategory) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      displayName: category.displayName,
      description: category.description,
      sortOrder: category.sortOrder
    });
    setModalVisible(true);
  };

  // 删除分类
  const handleDelete = (category: GameConfigCategory) => {
    if (window.confirm(`确定要删除分类 "${category.displayName}" 吗？\n\n注意：如果该分类下还有配置项，将无法删除`)) {
      void handleDeleteConfirmed(category);
    }
  };

  // 执行删除操作
  const handleDeleteConfirmed = async (category: GameConfigCategory) => {
    try {
      await gameConfigCategoryApi.delete(category.id);
      api.success({ message: '删除成功' });
      await fetchCategories();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message ?? '删除失败';

      api.error({
        message: '删除失败',
        description: errorMsg,
        duration: 6
      });
    }
  };

  // 保存分类
  const handleSave = async (values: CategoryFormData) => {
    try {
      if (editingCategory) {
        // 更新
        await gameConfigCategoryApi.update(editingCategory.id, values);
        api.success({ message: '更新成功' });
      } else {
        // 新增
        await gameConfigCategoryApi.create(values);
        api.success({ message: '创建成功' });
      }
      setModalVisible(false);
      form.resetFields();

      await fetchCategories();
    } catch (error: any) {
      console.error('保存失败:', error);
      const errorMsg = error?.response?.data?.message ?? '保存失败';

      api.error({ message: '保存失败', description: errorMsg });
    }
  };

  const columns: ColumnsType<GameConfigCategory> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: text => <code>{text}</code>
    },
    {
      title: '显示名称',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      sorter: (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size='middle'>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)} size='small'>
            编辑
          </Button>
          <Button type='link' danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} size='small'>
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
        新建分类
      </Button>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey='id'
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
      />

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout='vertical' onFinish={values => void handleSave(values)} initialValues={{ sortOrder: categories.length + 1 }}>
          <Form.Item
            label='分类名称 (唯一标识)'
            name='name'
            rules={[
              { required: true, message: '请输入分类名称' },
              { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线' },
              { max: 50, message: '最多50个字符' }
            ]}
            tooltip='用于程序内部标识，建议使用英文，如：player_attributes'
            extra={editingCategory ? '分类名称（唯一标识）不可修改' : ''}
          >
            <Input placeholder='例如: player_attributes' disabled={!!editingCategory} />
          </Form.Item>

          <Form.Item
            label='显示名称'
            name='displayName'
            rules={[
              { required: true, message: '请输入显示名称' },
              { max: 100, message: '最多100个字符' }
            ]}
            tooltip='用于前端显示的中文名称'
          >
            <Input placeholder='例如: 玩家属性' />
          </Form.Item>

          <Form.Item label='描述' name='description'>
            <TextArea rows={3} placeholder='请输入分类描述' />
          </Form.Item>

          <Form.Item label='排序' name='sortOrder' rules={[{ required: true, message: '请输入排序值' }]} tooltip='数字越小，排序越靠前'>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
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
