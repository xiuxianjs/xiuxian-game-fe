import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Modal, Space, Tag, Typography } from 'antd';
import React, { useState } from 'react';
// 修正：从合并后的 api/sect 导入类型
import { Sect } from '@/api/sect';

const { Text } = Typography;

interface SectStatusModalProps {
  sect: Sect | null;
  isOpen: boolean;
  onClose: () => void;
  // 修正：id 类型从 string 改为 number
  onConfirm: (id: number, status: number) => Promise<void>;
}

export const SectStatusModal: React.FC<SectStatusModalProps> = ({ sect, isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!sect) {
    return null;
  }

  // 修正：状态逻辑与后端对齐（0=正常，1=关闭，目标状态取反）
  const targetStatus = sect.status === 0 ? 1 : 0;
  const isEnable = targetStatus === 0;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 修正：传递数字类型的 id
      await onConfirm(sect.id, targetStatus);
      onClose();
    } catch (err: any) {
      Modal.error({ title: '操作失败', content: err.message ?? '状态更新失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEnable ? '启用宗门' : '禁用宗门'}
      open={isOpen}
      onCancel={onClose}
      onOk={() => void handleSubmit()}
      confirmLoading={loading}
      okText={isEnable ? '确认启用' : '确认禁用'}
      cancelText='取消'
      okButtonProps={{ type: 'primary', danger: !isEnable }}
      width={500}
    >
      <Space direction='vertical' align='center' className='w-full py-4'>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isEnable ? 'bg-green-100' : 'bg-red-100'}`}>
          {isEnable ? <CheckCircleOutlined className='text-2xl text-green-600' /> : <CloseCircleOutlined className='text-2xl text-red-600' />}
        </div>
        <Text className='text-center text-gray-700'>
          {isEnable ? '启用后，玩家可查看并加入该宗门，是否确认？' : '禁用后，玩家将无法查看和加入该宗门，是否确认？'}
        </Text>
        <Tag color={sect.status === 0 ? 'green' : 'red'} className='my-3'>
          当前状态：{sect.status === 0 ? '正常' : '关闭'}
        </Tag>
        <Text strong className='text-lg'>
          {sect.name}
        </Text>
      </Space>
    </Modal>
  );
};
