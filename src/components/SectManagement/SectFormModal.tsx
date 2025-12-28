import { Form as AntForm, Button, Form, Input, Modal, Space, message } from 'antd';
import React, { useEffect, useState } from 'react';
// 修正：从合并后的 api/sect 导入类型（或保留原 types/sect，确保路径正确）
import { Sect, UpdateSectData } from '@/api/sect';

// 弹窗Props
interface EditSectModalProps {
  sect: Sect | null;
  isOpen: boolean;
  onClose: () => void;
  // 修正：id 类型从 string 改为 number（后端 id 为数字）
  onSave: (id: number, data: UpdateSectData) => Promise<void>;
}

// 弹窗
export const EditSectModal: React.FC<EditSectModalProps> = ({ sect, isOpen, onClose, onSave }) => {
  const [form] = AntForm.useForm<UpdateSectData>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sect && isOpen) {
      form.setFieldsValue({
        name: sect.name,
        // 修正：字段名从 description 改为 intro（后端字段名）
        intro: sect.intro
      });
    }
  }, [sect, isOpen, form]);

  const handleSubmit = async (values: UpdateSectData) => {
    if (!sect) {
      return;
    }
    setLoading(true);
    try {
      // 修正：传递数字类型的 id
      await onSave(sect.id, values);
      message.success('编辑成功');
      onClose();
    } catch (err: any) {
      message.error(err.message ?? '编辑失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title='编辑宗门' open={isOpen} onCancel={onClose} footer={null} width={600} destroyOnClose>
      <Form
        form={form}
        layout='vertical'
        onFinish={e => void handleSubmit(e)}
        // 修正：初始值字段名从 description 改为 intro
        initialValues={{ name: '', intro: '' }}
      >
        <Form.Item
          name='name'
          label='宗门名称'
          rules={[
            { required: true, message: '请输入宗门名称' },
            { max: 64, message: '名称不超过64字' }
          ]} // 修正：长度限制改为64（后端要求）
        >
          <Input placeholder='请输入宗门名称' />
        </Form.Item>
        <Form.Item
          name='intro' // 修正：字段名改为 intro
          label='宗门简介'
          rules={[
            { required: true, message: '请输入宗门简介' },
            { max: 256, message: '简介不超过256字' }
          ]} // 修正：长度限制改为256（后端要求）
        >
          <Input.TextArea rows={3} placeholder='请输入宗门简介' />
        </Form.Item>
        {/* 可选：新增支持编辑公告的字段（根据 UpdateSectData 类型） */}
        <Form.Item name='notice' label='宗门公告' rules={[{ max: 512, message: '公告不超过512字' }]}>
          <Input.TextArea rows={2} placeholder='请输入宗门公告（选填）' />
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
