import { Sect } from '@/api/sect';
import { EditOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Space, Table, TableProps, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface SectTableProps {
  data: Sect[];
  onEdit: (sect: Sect) => void;
  onStatusChange: (sect: Sect) => void;
  pagination?: TableProps['pagination'];
}

export const SectTable: React.FC<SectTableProps> = ({ data, onEdit, onStatusChange, pagination }) => {
  const levelMap: Record<number, string> = {
    1: '一阶',
    2: '二阶',
    3: '三阶',
    4: '四阶',
    5: '五阶',
    6: '六阶'
  };

  const getLevelText = (levelNum?: number) => {
    const safeLevelNum = levelNum ?? 1;

    return levelMap[safeLevelNum] ?? '一阶';
  };

  // 修正：等级颜色映射（基于数值）
  const getLevelColor = (levelNum?: number) => {
    const colorMap: Record<number, string> = {
      1: 'black',
      2: 'gray',
      3: 'green',
      4: 'purple',
      5: 'gold',
      6: 'red'
    };

    return colorMap[levelNum ?? 1] ?? 'purple';
  };

  const columns = [
    {
      title: '宗门ID',
      dataIndex: 'id',
      key: 'id',
      width: 100
    },
    {
      title: '宗门名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '宗门等级',
      // 数据索引改为扁平字段（需用数组形式支持特殊键名）
      dataIndex: ['guildLevel.level'],
      key: 'level',
      width: 100,
      render: (levelNum?: number) => {
        return <Tag color={getLevelColor(levelNum)}>{getLevelText(levelNum)}</Tag>;
      }
    },
    {
      title: '宗门简介',
      dataIndex: 'intro',
      key: 'intro',
      width: 250,
      render: (intro: string | null) => intro ?? '-' // 处理 null 情况
    },
    {
      title: '宗门人数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (
        status = 0 // 默认值为0（正常）
      ) => <Tag color={status === 0 ? 'green' : 'red'}>{status === 0 ? '正常' : '关闭'}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm') // 处理字符串时间
    },
    {
      title: '宗主',
      dataIndex: 'leaderName',
      key: 'leaderName',
      width: 120,
      render: (name: string | null) => name ?? '暂无'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Sect) => (
        <Space>
          {record.status === 1 ? (
            <>
              <Button type='link' icon={<PlayCircleOutlined className='text-green-600' />} onClick={() => onStatusChange(record)}>
                启用
              </Button>
              <Button type='link' icon={<EditOutlined className='text-blue-600' />} onClick={() => onEdit(record)}>
                编辑
              </Button>
            </>
          ) : (
            <>
              <Button type='link' icon={<PauseCircleOutlined className='text-red-600' />} onClick={() => onStatusChange(record)}>
                禁用
              </Button>
              <Button type='link' icon={<EditOutlined className='text-blue-600' />} onClick={() => onEdit(record)}>
                编辑
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey='id'
      // 修正：分页配置从父组件传递（不再硬编码）
      pagination={pagination ?? { pageSize: 10 }}
      scroll={{ x: 'max-content' }}
    />
  );
};
