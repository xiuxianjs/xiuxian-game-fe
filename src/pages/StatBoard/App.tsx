import { PlayerRankItem, SectRankItem, StatSummary, statAPI } from '@/api/stat';
import { ReloadOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Button, Card, Space, Table, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

const StatBoard: React.FC = () => {
  const [stats, setStats] = useState<StatSummary | null>(null);
  const [playerRanks, setPlayerRanks] = useState<PlayerRankItem[]>([]);
  const [sectRanks, setSectRanks] = useState<SectRankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateTime, setUpdateTime] = useState<string>('暂无更新时间');

  // 玩家境界排名表格列定义
  const playerRankColumns: TableColumnsType<PlayerRankItem> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      className: 'font-medium'
    },
    {
      title: '玩家名称',
      dataIndex: 'name',
      key: 'name',
      className: 'font-medium'
    },
    {
      title: '境界',
      dataIndex: 'realm',
      key: 'realm'
    }
  ];

  // 宗门排名表格列定义
  const sectRankColumns: TableColumnsType<SectRankItem> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      className: 'font-medium'
    },
    {
      title: '宗门名称',
      dataIndex: 'name',
      key: 'name',
      className: 'font-medium'
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level'
    }
  ];

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 传递 limit 参数（默认30，可调整）
      const [summaryRes, playerRankRes, sectRankRes] = await Promise.all([
        statAPI.getSummary(),
        statAPI.getPlayerRank({ limit: 50 }), // 最多返回50条排名
        statAPI.getSectRank({ limit: 50 })
      ]);

      if (!summaryRes.success) {
        throw new Error(summaryRes.message);
      }
      if (!playerRankRes.success) {
        throw new Error(playerRankRes.message);
      }
      if (!sectRankRes.success) {
        throw new Error(sectRankRes.message);
      }

      setStats(summaryRes.data ?? null);
      setPlayerRanks(playerRankRes.data ?? []); // 兜底空数组
      setSectRanks(sectRankRes.data ?? []);
      setUpdateTime(new Date().toLocaleString());
      message.success('统计数据更新成功');
    } catch (err: any) {
      message.error(err.message ?? '统计数据获取失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  return (
    <div className='p-6  min-h-full'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <Text type='secondary'>最后更新：{updateTime}</Text>
        <Button
          type='primary'
          icon={<ReloadOutlined />}
          onClick={() => void fetchStats()}
          loading={loading}
          className=' shadow-md hover:shadow-lg transition-all duration-300 border-0'
        >
          更新统计
        </Button>
      </div>

      <Space className='mb-8' size='large' wrap>
        <Card title='玩家总数' bordered={false} className='w-64 text-center rounded-xl shadow-md bg-gradient-to-br gray-100 overflow-hidden'>
          <div className='text-2xl font-bold text-gray-700 py-4'>{stats?.playerTotal ?? '--'}</div>
        </Card>
        <Card title='高级玩家数' bordered={false} className='w-64 text-center rounded-xl shadow-md bg-gradient-to-br gray-100 overflow-hidden'>
          <div className='text-2xl font-bold text-gray-700 py-4'>{stats?.advancedPlayerTotal ?? '--'}</div>
        </Card>
        <Card title='宗门总数' bordered={false} className='w-64 text-center rounded-xl shadow-md bg-gradient-to-br gray-100 overflow-hidden'>
          <div className='text-2xl font-bold text-gray-700 py-4'>{stats?.sectTotal ?? '--'}</div>
        </Card>
      </Space>

      <div className='flex flex-col md:flex-row gap-6 '>
        <div className='flex-1'>
          <Table
            dataSource={playerRanks}
            columns={playerRankColumns}
            pagination={false}
            bordered={false}
            rowKey='rank' // 排名唯一，作为行键
            loading={loading}
            className='shadow-sm'
            rowClassName='hover:bg-gray-50 transition-colors duration-200'
            tableLayout='auto'
          />
        </div>
        <div className='flex-1'>
          <Table
            dataSource={sectRanks}
            columns={sectRankColumns}
            pagination={false}
            bordered={false}
            rowKey='rank' // 排名唯一，作为行键
            loading={loading}
            className='shadow-sm'
            rowClassName='hover:bg-gray-50 transition-colors duration-200'
            tableLayout='auto'
          />
        </div>
      </div>
    </div>
  );
};

export default StatBoard;
