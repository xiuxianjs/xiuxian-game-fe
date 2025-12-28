import { getMuteLogsAPI, type MuteLog } from '@/api';
import { Button, Card, Empty, message, Select, Space, Tabs, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

// 禁言日志页面
const MuteLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mute');
  const [logs, setLogs] = useState<MuteLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 获取日志
  const fetchLogs = async (type: 'mute' | 'unmute') => {
    setLoading(true);
    try {
      const result = await getMuteLogsAPI(type, 100);

      if (result.success && result.data) {
        setLogs(result.data.list ?? []);
      } else {
        message.error(result.message ?? '获取日志失败');
      }
    } catch (error) {
      console.error('获取日志错误:', error);
      message.error('获取日志失败');
    } finally {
      setLoading(false);
    }
  };

  // 标签页切换
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    setCurrent(1); // 切换标签页重置页码
    void fetchLogs(tabName as 'mute' | 'unmute');
  };

  // 分页处理
  const paginatedLogs = logs.slice((current - 1) * pageSize, current * pageSize);

  // 初始化加载日志
  useEffect(() => {
    void fetchLogs(activeTab as 'mute' | 'unmute');
  }, [activeTab]);

  const tabItems = [
    {
      key: 'mute',
      label: '禁言记录',
      children: (
        <div>
          <div className='max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div>加载中...</div>
              </div>
            ) : paginatedLogs.length === 0 ? (
              <Empty description='暂无禁言记录' />
            ) : (
              <div>
                {paginatedLogs.map((log, index) => (
                  <Card key={`mute-${log.userId}-${index}`} size='small' style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            background: '#f5f5f5',
                            padding: '2px 6px',
                            borderRadius: 4
                          }}
                        >
                          {log.userId}
                        </span>
                        {log.reason && <Tag color='orange'>{log.reason}</Tag>}
                        {log.duration && <Tag color='blue'>{Math.floor(log.duration / 60)}分钟</Tag>}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>{dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                    </div>
                    {log.adminId && <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>操作管理员: {log.adminId}</div>}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <span style={{ marginRight: 8, fontSize: 12, color: '#666' }}>
              第 {current}-{Math.min(current * pageSize, logs.length)} 条，共 {logs.length} 条
            </span>
            <Space size='small'>
              <Button size='small' disabled={current === 1} onClick={() => setCurrent(prev => prev - 1)}>
                上一页
              </Button>
              <Button size='small' disabled={current * pageSize >= logs.length} onClick={() => setCurrent(prev => prev + 1)}>
                下一页
              </Button>
              <Select size='small' value={pageSize.toString()} onChange={value => setPageSize(Number(value))} style={{ width: 80 }}>
                <Option value='10'>10条/页</Option>
                <Option value='20'>20条/页</Option>
                <Option value='50'>50条/页</Option>
              </Select>
            </Space>
          </div>
        </div>
      )
    },
    {
      key: 'unmute',
      label: '解除记录',
      children: (
        <div>
          <div className='max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div>加载中...</div>
              </div>
            ) : paginatedLogs.length === 0 ? (
              <Empty description='暂无解除禁言记录' />
            ) : (
              <div>
                {paginatedLogs.map((log, index) => (
                  <Card key={`unmute-${log.userId}-${index}`} size='small' style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            background: '#f5f5f5',
                            padding: '2px 6px',
                            borderRadius: 4
                          }}
                        >
                          {log.userId}
                        </span>
                        {log.reason && <Tag color='green'>{log.reason}</Tag>}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>{dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                    </div>
                    {log.adminId && <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>操作管理员: {log.adminId}</div>}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <span style={{ marginRight: 8, fontSize: 12, color: '#666' }}>
              第 {current}-{Math.min(current * pageSize, logs.length)} 条，共 {logs.length} 条
            </span>
            <Space size='small'>
              <Button size='small' disabled={current === 1} onClick={() => setCurrent(prev => prev - 1)}>
                上一页
              </Button>
              <Button size='small' disabled={current * pageSize >= logs.length} onClick={() => setCurrent(prev => prev + 1)}>
                下一页
              </Button>
              <Select size='small' value={pageSize.toString()} onChange={value => setPageSize(Number(value))} style={{ width: 80 }}>
                <Option value='10'>10条/页</Option>
                <Option value='20'>20条/页</Option>
                <Option value='50'>50条/页</Option>
              </Select>
            </Space>
          </div>
        </div>
      )
    }
  ];

  return <Tabs activeKey={activeTab} items={tabItems} onChange={handleTabChange} style={{ marginBottom: 16 }} />;
};

export default MuteLogs;
