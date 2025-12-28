import { GameConfig } from '@/api/gameConfig';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';

interface ConfigTableProps {
  configs: GameConfig[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onEdit: (config: GameConfig) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export default function ConfigTable({ configs, total, page, pageSize, loading, onEdit, onDelete, onPageChange }: ConfigTableProps) {
  const formatValue = (value: string, type: string) => {
    if (type === 'json' || type === 'array') {
      try {
        const parsed = JSON.parse(value);
        const str = JSON.stringify(parsed);

        return str.length > 50 ? str.slice(0, 50) + '...' : str;
      } catch {
        return value;
      }
    }

    return value.length > 50 ? value.slice(0, 50) + '...' : value;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'number':
        return 'blue';
      case 'string':
        return 'green';
      case 'boolean':
        return 'purple';
      case 'json':
        return 'orange';
      case 'array':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '配置键 (Key)',
      dataIndex: 'key',
      key: 'key',
      width: 200,
      render: (key: string) => <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{key}</span>
    },
    {
      title: '中文标签',
      dataIndex: 'label',
      key: 'label',
      width: 180
    },
    {
      title: '值 (Value)',
      dataIndex: 'value',
      key: 'value',
      ellipsis: {
        showTitle: false
      },
      render: (value: string, record: GameConfig) => (
        <Tooltip title={value}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{formatValue(value, record.type)}</span>
        </Tooltip>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color={getTypeColor(type)}>{type}</Tag>
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (_: any, record: GameConfig) => record.category?.displayName ?? '-'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false
      },
      render: (description: string) => {
        return description ? (
          <Tooltip title={description}>
            <span style={{ color: '#666' }}>{description.length > 30 ? description.slice(0, 30) + '...' : description}</span>
          </Tooltip>
        ) : (
          <span style={{ color: '#ccc' }}>-</span>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: GameConfig) => (
        <Space size='middle'>
          <Button type='link' icon={<EditOutlined />} onClick={() => onEdit(record)} size='small'>
            编辑
          </Button>
          <Popconfirm title='确定要删除这个配置吗？' onConfirm={() => onDelete(record.id)} okText='确定' cancelText='取消'>
            <Button type='link' danger icon={<DeleteOutlined />} size='small'>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={configs}
      rowKey='id'
      loading={loading}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        onChange: onPageChange
      }}
    />
  );
}
