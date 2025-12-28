import {
  batchImportSensitiveWords,
  createSensitiveWord,
  deleteSensitiveWord,
  exportSensitiveWords,
  getLogs,
  getSensitiveWords,
  getStatistics,
  refreshCache,
  SensitiveWordAction,
  SensitiveWordLevel,
  SensitiveWordType,
  testDetection,
  updateSensitiveWord,
  type CreateSensitiveWordParams,
  type SensitiveWord,
  type SensitiveWordLog,
  type SensitiveWordQueryParams,
  type Statistics,
  type UpdateSensitiveWordParams
} from '@/api/sensitiveWords';
import {
  BarChartOutlined,
  CloudSyncOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  FileTextOutlined,
  ImportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Select, Space, Statistic, Switch, Table, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

dayjs.locale('zh-cn');

const { TextArea } = Input;
const { Option } = Select;

// 类型标签颜色映射
const TYPE_COLORS: Record<SensitiveWordType, string> = {
  [SensitiveWordType.POLITICAL]: 'red',
  [SensitiveWordType.VIOLENT]: 'orange',
  [SensitiveWordType.PORNOGRAPHIC]: 'magenta',
  [SensitiveWordType.ADVERTISING]: 'blue',
  [SensitiveWordType.ABUSE]: 'volcano',
  [SensitiveWordType.CHEAT]: 'purple',
  [SensitiveWordType.OTHER]: 'default'
};

// 类型标签文本映射
const TYPE_LABELS: Record<SensitiveWordType, string> = {
  [SensitiveWordType.POLITICAL]: '政治敏感',
  [SensitiveWordType.VIOLENT]: '暴力血腥',
  [SensitiveWordType.PORNOGRAPHIC]: '色情低俗',
  [SensitiveWordType.ADVERTISING]: '广告营销',
  [SensitiveWordType.ABUSE]: '辱骂诋毁',
  [SensitiveWordType.CHEAT]: '作弊外挂',
  [SensitiveWordType.OTHER]: '其他'
};

// 等级标签颜色映射
const LEVEL_COLORS: Record<SensitiveWordLevel, string> = {
  [SensitiveWordLevel.LOW]: 'green',
  [SensitiveWordLevel.MEDIUM]: 'orange',
  [SensitiveWordLevel.HIGH]: 'red'
};

// 等级标签文本映射
const LEVEL_LABELS: Record<SensitiveWordLevel, string> = {
  [SensitiveWordLevel.LOW]: '低',
  [SensitiveWordLevel.MEDIUM]: '中',
  [SensitiveWordLevel.HIGH]: '高'
};

// 动作标签颜色映射
const ACTION_COLORS: Record<SensitiveWordAction, string> = {
  [SensitiveWordAction.REPLACE]: 'blue',
  [SensitiveWordAction.REJECT]: 'red',
  [SensitiveWordAction.WARN]: 'orange'
};

// 动作标签文本映射
const ACTION_LABELS: Record<SensitiveWordAction, string> = {
  [SensitiveWordAction.REPLACE]: '替换',
  [SensitiveWordAction.REJECT]: '拒绝',
  [SensitiveWordAction.WARN]: '警告'
};

export default function SensitiveWords() {
  const location = useLocation();
  const pathToTabKey = {
    '/sensitive-words/list': 'words',
    '/sensitive-words/logs': 'logs',
    '/sensitive-words/statistics': 'statistics'
  };

  // 监听并同步tab
  useEffect(() => {
    const currentTab = pathToTabKey[location.pathname as keyof typeof pathToTabKey] || 'words';

    setActiveTab(currentTab);
  }, [location.pathname]);

  const { message, modal } = App.useApp();
  const [words, setWords] = useState<SensitiveWord[]>([]);
  const [logs, setLogs] = useState<SensitiveWordLog[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState<SensitiveWord | null>(null);
  const [form] = Form.useForm();
  const [testForm] = Form.useForm();
  const [importForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('words');

  // 搜索条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState<SensitiveWordType | undefined>(undefined);
  const [searchLevel, setSearchLevel] = useState<SensitiveWordLevel | undefined>(undefined);
  const [searchEnabled, setSearchEnabled] = useState<boolean | undefined>(undefined);

  // 分页
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const [logPagination, setLogPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // 获取敏感词列表
  const fetchWords = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params: SensitiveWordQueryParams = {
        page,
        pageSize,
        keyword: searchKeyword || undefined,
        type: searchType,
        level: searchLevel,
        enabled: searchEnabled
      };

      const response = await getSensitiveWords(params);

      console.log('API Response:', response);

      if (!response?.items) {
        throw new Error('响应数据格式错误');
      }

      setWords(response.items);
      setPagination({
        current: response.page,
        pageSize: response.pageSize,
        total: response.total
      });
    } catch (error) {
      console.error('获取敏感词列表失败:', error);
      message.error('获取敏感词列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取日志列表
  const fetchLogs = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const response = await getLogs({ page, pageSize });

      setLogs(response.items);
      setLogPagination({
        current: response.page,
        pageSize: response.pageSize,
        total: response.total
      });
    } catch (error) {
      console.error('获取日志失败:', error);
      message.error('获取日志失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      const response = await getStatistics();

      setStatistics(response);
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'words') {
      void fetchWords();
    } else if (activeTab === 'logs') {
      void fetchLogs();
    } else if (activeTab === 'statistics') {
      void fetchStatistics();
    }
  }, [activeTab]);

  // 搜索
  const handleSearch = () => {
    void fetchWords(1, pagination.pageSize);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchKeyword('');
    setSearchType(undefined);
    setSearchLevel(undefined);
    setSearchEnabled(undefined);
    setPagination({ ...pagination, current: 1 });
    void fetchWords(1, pagination.pageSize);
  };

  // 打开编辑弹窗
  const handleEdit = (word: SensitiveWord) => {
    setCurrentWord(word);
    form.setFieldsValue(word);
    setEditModalVisible(true);
  };

  // 打开新增弹窗
  const handleAdd = () => {
    setCurrentWord(null);
    form.resetFields();
    form.setFieldsValue({
      type: SensitiveWordType.ABUSE,
      level: SensitiveWordLevel.MEDIUM,
      action: SensitiveWordAction.REPLACE,
      replacement: '***',
      enabled: true
    });
    setEditModalVisible(true);
  };

  // 保存敏感词
  const handleSave = async (values: CreateSensitiveWordParams | UpdateSensitiveWordParams) => {
    try {
      if (currentWord) {
        // 更新 - 将 id 合并到 values 中
        await updateSensitiveWord({ id: currentWord.id, ...values });
        message.success('更新成功');
      } else {
        await createSensitiveWord(values as CreateSensitiveWordParams);
        message.success('创建成功');
      }
      setEditModalVisible(false);
      void fetchWords(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error('保存失败:', error);
      const errorMessage = error?.response?.data?.message ?? '保存失败';

      message.error(errorMessage);
    }
  };

  // 删除敏感词
  const handleDelete = async (id: number) => {
    try {
      await deleteSensitiveWord(id);
      message.success('删除成功');
      void fetchWords(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 刷新缓存
  const handleRefreshCache = async () => {
    try {
      setLoading(true);
      await refreshCache();
      message.success('缓存刷新成功');
    } catch (error) {
      console.error('刷新缓存失败:', error);
      message.error('刷新缓存失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试检测
  const handleTest = () => {
    testForm.resetFields();
    setTestModalVisible(true);
  };

  const handleTestSubmit = async (values: { text: string }) => {
    try {
      console.log('表单提交的值:', values);
      console.log('文本内容:', values.text);

      const result = await testDetection(values.text);

      console.log('检测结果:', result);

      // 兼容旧格式和新格式
      const detection = result.detection || result;
      const originalText = result.originalText || values.text;
      const filteredText = result.filterResult?.filteredText || '无过滤结果';
      const matchedWords = (detection.matchedWords ?? []) as Array<{
        word: string;
        type: SensitiveWordType;
        level: SensitiveWordLevel;
        action: SensitiveWordAction;
      }>;

      modal.info({
        title: '检测结果',
        width: 600,
        content: (
          <div>
            <p>
              <strong>原始文本：</strong>
              {originalText}
            </p>
            <p>
              <strong>过滤后文本：</strong>
              {filteredText}
            </p>
            <p>
              <strong>是否包含敏感词：</strong>
              {detection.hasSensitiveWord ? '是' : '否'}
            </p>
            {detection.hasSensitiveWord && (
              <>
                <p>
                  <strong>是否应拒绝：</strong>
                  {detection.shouldReject ? '是' : '否'}
                </p>
                <p>
                  <strong>最高等级：</strong>
                  {LEVEL_LABELS[detection.maxLevel as SensitiveWordLevel]}
                </p>
                <p>
                  <strong>匹配的敏感词：</strong>
                </p>
                <ul>
                  {matchedWords.map((w, i: number) => (
                    <li key={i}>
                      {w.word} - <Tag color={TYPE_COLORS[w.type]}>{TYPE_LABELS[w.type]}</Tag>
                      <Tag color={LEVEL_COLORS[w.level]}>{LEVEL_LABELS[w.level]}</Tag>
                      <Tag color={ACTION_COLORS[w.action]}>{ACTION_LABELS[w.action]}</Tag>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )
      });
    } catch (error) {
      console.error('测试失败:', error);
      message.error('测试失败');
    }
  };

  // 导出
  const handleExport = async () => {
    try {
      const data = await exportSensitiveWords();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `sensitive-words-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  // 批量导入
  const handleImport = () => {
    importForm.resetFields();
    setImportModalVisible(true);
  };

  const handleImportSubmit = async (values: { content: string }) => {
    try {
      const wordsRaw: unknown = JSON.parse(values.content);

      if (!Array.isArray(wordsRaw)) {
        message.error('格式错误：应该是一个数组');

        return;
      }

      const words = wordsRaw as CreateSensitiveWordParams[];
      const result = await batchImportSensitiveWords(words);

      message.success(`导入完成：成功${result.success}个，失败${result.failed}个，重复${result.duplicate}个`);
      setImportModalVisible(false);
      void fetchWords(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('导入失败:', error);
      message.error('导入失败，请检查格式是否正确');
    }
  };

  // 表格列定义
  const columns: ColumnsType<SensitiveWord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '敏感词',
      dataIndex: 'word',
      key: 'word',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: SensitiveWordType) => <Tag color={TYPE_COLORS[type]}>{TYPE_LABELS[type]}</Tag>
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: SensitiveWordLevel) => <Tag color={LEVEL_COLORS[level]}>{LEVEL_LABELS[level]}</Tag>
    },
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: SensitiveWordAction) => <Tag color={ACTION_COLORS[action]}>{ACTION_LABELS[action]}</Tag>
    },
    {
      title: '替换文本',
      dataIndex: 'replacement',
      key: 'replacement',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => <Tag color={enabled ? 'green' : 'red'}>{enabled ? '启用' : '禁用'}</Tag>
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: SensitiveWord) => (
        <Space size='small'>
          <Button
            type='link'
            size='small'
            icon={<EditOutlined />}
            onClick={() => {
              handleEdit(record);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title='确定删除吗？'
            onConfirm={() => {
              void handleDelete(record.id);
            }}
          >
            <Button type='link' size='small' danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 日志表格列定义
  const logColumns: ColumnsType<SensitiveWordLog> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100
    },
    {
      title: '原始内容',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      ellipsis: true
    },
    {
      title: '过滤后内容',
      dataIndex: 'filteredContent',
      key: 'filteredContent',
      width: 200,
      ellipsis: true
    },
    {
      title: '匹配词汇',
      dataIndex: 'matchedWords',
      key: 'matchedWords',
      width: 150,
      render: (text: string) => {
        try {
          const words = JSON.parse(text);

          return words.map((w: any) => w.word).join(', ');
        } catch {
          return '-';
        }
      }
    },
    {
      title: '采取动作',
      dataIndex: 'actionTaken',
      key: 'actionTaken',
      width: 100
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'words',
            label: (
              <span>
                <FileTextOutlined />
                敏感词管理
              </span>
            ),
            children: (
              <Space direction='vertical' style={{ width: '100%' }} size='large'>
                {/* 搜索区域 */}
                <Card size='small'>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Input
                        placeholder='搜索关键词'
                        value={searchKeyword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setSearchKeyword(e.target.value);
                        }}
                        onPressEnter={handleSearch}
                      />
                    </Col>
                    <Col span={4}>
                      <Select placeholder='类型' style={{ width: '100%' }} value={searchType} onChange={setSearchType} allowClear>
                        {Object.entries(TYPE_LABELS).map(([key, label]) => (
                          <Option key={key} value={key}>
                            {label}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={4}>
                      <Select placeholder='等级' style={{ width: '100%' }} value={searchLevel} onChange={setSearchLevel} allowClear>
                        {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                          <Option key={key} value={Number(key)}>
                            {label}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={4}>
                      <Select placeholder='状态' style={{ width: '100%' }} value={searchEnabled} onChange={setSearchEnabled} allowClear>
                        <Option value={true}>启用</Option>
                        <Option value={false}>禁用</Option>
                      </Select>
                    </Col>
                    <Col span={6}>
                      <Space>
                        <Button type='primary' icon={<SearchOutlined />} onClick={handleSearch}>
                          搜索
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>
                          重置
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* 操作按钮 */}
                <Space>
                  <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
                    新增敏感词
                  </Button>
                  <Button icon={<CloudSyncOutlined />} onClick={() => void handleRefreshCache()}>
                    刷新缓存
                  </Button>
                  <Button icon={<FileTextOutlined />} onClick={handleTest}>
                    测试检测
                  </Button>
                  <Button icon={<ExportOutlined />} onClick={() => void handleExport()}>
                    导出
                  </Button>
                  <Button icon={<ImportOutlined />} onClick={handleImport}>
                    批量导入
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      void fetchWords(pagination.current, pagination.pageSize);
                    }}
                  >
                    刷新列表
                  </Button>
                </Space>

                {/* 表格 */}
                <Table
                  columns={columns}
                  dataSource={words}
                  rowKey='id'
                  loading={loading}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total: number) => `共 ${total} 条`,
                    onChange: (page: number, pageSize: number) => {
                      void fetchWords(page, pageSize);
                    }
                  }}
                  scroll={{ x: 1500 }}
                />
              </Space>
            )
          },
          {
            key: 'logs',
            label: (
              <span>
                <FileTextOutlined />
                检测日志
              </span>
            ),
            children: (
              <Table
                columns={logColumns}
                dataSource={logs}
                rowKey='id'
                loading={loading}
                pagination={{
                  current: logPagination.current,
                  pageSize: logPagination.pageSize,
                  total: logPagination.total,
                  showSizeChanger: true,
                  showTotal: (total: number) => `共 ${total} 条`,
                  onChange: (page: number, pageSize: number) => {
                    void fetchLogs(page, pageSize);
                  }
                }}
                scroll={{ x: 1500 }}
              />
            )
          },
          {
            key: 'statistics',
            label: (
              <span>
                <BarChartOutlined />
                统计信息
              </span>
            ),
            children: (
              <div>
                {statistics && (
                  <>
                    <Card title='敏感词统计'>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Statistic title='总数' value={statistics.totalWords} />
                        </Col>
                        <Col span={8}>
                          <Statistic title='启用数' value={statistics.enabledWords} />
                        </Col>
                        <Col span={8}>
                          <Statistic title='禁用数' value={statistics.disabledWords} />
                        </Col>
                      </Row>
                    </Card>

                    <Card title='检测日志统计'>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic title='总检测次数' value={statistics.totalLogs} />
                        </Col>
                        <Col span={12}>
                          <Statistic title='最近7天' value={statistics.recentLogs} />
                        </Col>
                      </Row>
                    </Card>
                  </>
                )}
              </div>
            )
          }
        ]}
      />

      {/* 编辑/新增弹窗 */}
      <Modal
        title={currentWord ? '编辑敏感词' : '新增敏感词'}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
        }}
        onOk={() => {
          void form.validateFields().then(handleSave);
        }}
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item name='word' label='敏感词' rules={[{ required: true, message: '请输入敏感词' }]}>
            <Input placeholder='请输入敏感词' />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name='type' label='类型' rules={[{ required: true, message: '请选择类型' }]}>
                <Select>
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <Select.Option key={key} value={key}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name='level' label='等级' rules={[{ required: true, message: '请选择等级' }]}>
                <Select>
                  {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                    <Select.Option key={key} value={Number(key)}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name='action' label='动作' rules={[{ required: true, message: '请选择动作' }]}>
                <Select>
                  {Object.entries(ACTION_LABELS).map(([key, label]) => (
                    <Select.Option key={key} value={key}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name='replacement' label='替换文本'>
            <Input placeholder='请输入替换文本（动作为替换时使用）' />
          </Form.Item>

          <Form.Item name='description' label='描述'>
            <TextArea rows={3} placeholder='请输入描述' />
          </Form.Item>

          <Form.Item name='enabled' label='状态' valuePropName='checked'>
            <Switch checkedChildren='启用' unCheckedChildren='禁用' />
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试检测弹窗 */}
      <Modal
        title='测试敏感词检测'
        open={testModalVisible}
        onCancel={() => {
          setTestModalVisible(false);
        }}
        onOk={() => {
          void testForm.validateFields().then(handleTestSubmit);
        }}
        width={600}
      >
        <Form form={testForm} layout='vertical'>
          <Form.Item name='text' label='测试文本' rules={[{ required: true, message: '请输入测试文本' }]}>
            <TextArea rows={6} placeholder='请输入要测试的文本' />
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量导入弹窗 */}
      <Modal
        title='批量导入敏感词'
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
        }}
        onOk={() => {
          void importForm.validateFields().then(handleImportSubmit);
        }}
        width={700}
      >
        <Form form={importForm} layout='vertical'>
          <Form.Item
            name='content'
            label='JSON 数据'
            rules={[{ required: true, message: '请输入 JSON 数据' }]}
            extra='请输入 JSON 格式的敏感词数组，格式示例：[{"word":"测试","type":"abuse","level":2,"action":"replace","replacement":"***"}]'
          >
            <TextArea rows={12} placeholder='请输入 JSON 格式数据' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
