import { GameConfig } from '@/api/gameConfig';
import { CategoryOption } from '@/api/gameConfigCategory';
import { App, Button, Form, Input, Modal, Select, Space } from 'antd';
import { useEffect } from 'react';

const { Option } = Select;
const { TextArea } = Input;

interface ConfigFormProps {
  config: GameConfig | null;
  categories: CategoryOption[];
  onSave: (data: Partial<GameConfig>) => Promise<void>;
  onCancel: () => void;
}

export default function ConfigForm({ config, categories, onSave, onCancel }: ConfigFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        key: config.key,
        label: config.label,
        value: config.value,
        type: config.type,
        categoryId: config.categoryId ?? undefined,
        description: config.description ?? ''
      });
    } else {
      form.resetFields();
    }
  }, [config, form]);

  const handleSubmit = async (values: any) => {
    // 数据类型验证
    const { type, value } = values;

    // 验证 number 类型
    if (type === 'number') {
      if (isNaN(Number(value)) || value.trim() === '') {
        message.error('数值类型的值必须是有效数字');

        return;
      }
    }

    // 验证 boolean 类型
    if (type === 'boolean') {
      const lowerValue = value.toLowerCase().trim();

      if (lowerValue !== 'true' && lowerValue !== 'false' && lowerValue !== '1' && lowerValue !== '0') {
        message.error('布尔类型的值必须是 true、false、1 或 0');

        return;
      }
    }

    // 验证 JSON 格式
    if (type === 'json') {
      try {
        const parsed = JSON.parse(value);

        if (typeof parsed !== 'object' || parsed === null) {
          message.error('JSON 类型的值必须是对象或数组格式，如: {"key": "value"} 或 [1, 2, 3]');

          return;
        }
      } catch {
        message.error('JSON 格式错误，请检查语法');

        return;
      }
    }

    // 验证 array 格式
    if (type === 'array') {
      try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          message.error('数组类型的值必须是数组格式，如: [1, 2, 3]');

          return;
        }
      } catch {
        message.error('数组格式错误，请检查语法');

        return;
      }
    }

    try {
      await onSave(values);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ?? err.message ?? '保存失败';

      message.error(errorMessage);
    }
  };

  return (
    <Modal title={config ? '编辑配置' : '添加配置'} open={true} onCancel={onCancel} footer={null} width={600}>
      <Form form={form} layout='vertical' onFinish={e => void handleSubmit(e)} initialValues={{ type: 'string' }}>
        <Form.Item label='配置键 (Key)' name='key' rules={[{ required: true, message: '请输入配置键' }]} extra={config ? '配置键不可修改' : ''}>
          <Input placeholder='如: MAX_LEVEL' disabled={!!config} />
        </Form.Item>

        <Form.Item label='中文标签 (Label)' name='label' rules={[{ required: true, message: '请输入中文标签' }]}>
          <Input placeholder='如: 最大等级' />
        </Form.Item>

        <Form.Item label='数据类型' name='type' rules={[{ required: true, message: '请选择数据类型' }]}>
          <Select placeholder='请选择数据类型'>
            <Option value='string'>字符串 (string)</Option>
            <Option value='number'>数值 (number)</Option>
            <Option value='boolean'>布尔值 (boolean)</Option>
            <Option value='json'>JSON 对象/数组 (json)</Option>
            <Option value='array'>数组 (array)</Option>
          </Select>
        </Form.Item>

        <Form.Item label='分类' name='categoryId' rules={[{ required: true, message: '请选择分类' }]}>
          <Select
            placeholder='请选择分类'
            showSearch
            filterOption={(input, option) => {
              const cat = categories.find(c => c.id === option?.value);

              return cat?.displayName.toLowerCase().includes(input.toLowerCase()) ?? false;
            }}
          >
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>
                {cat.displayName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
          {({ getFieldValue }) => {
            const type = getFieldValue('type');

            return (
              <Form.Item label='配置值 (Value)' name='value' rules={[{ required: true, message: '请输入配置值' }]}>
                {type === 'json' || type === 'array' ? (
                  <TextArea placeholder={type === 'json' ? '{"key": "value"} 或 [1, 2, 3]' : '[1, 2, 3]'} rows={6} style={{ fontFamily: 'monospace' }} />
                ) : (
                  <Input placeholder={type === 'number' ? '100' : type === 'boolean' ? 'true 或 false' : '请输入值'} />
                )}
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item label='描述' name='description'>
          <TextArea placeholder='详细说明（可选）' rows={3} />
        </Form.Item>

        <Form.Item className='mb-0'>
          <Space className='w-full justify-end'>
            <Button onClick={onCancel}>取消</Button>
            <Button type='primary' htmlType='submit'>
              {config ? '更新' : '创建'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
