import { GameConfig, gameConfigApi, GameConfigListParams } from '@/api/gameConfig';
import { CategoryOption, gameConfigCategoryApi } from '@/api/gameConfigCategory';
import { ClearOutlined, CloudSyncOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import ConfigForm from './components/ConfigForm';
import ConfigTable from './components/ConfigTable';

const { Option } = Select;

export default function GameConfigPage() {
  const { message } = App.useApp();
  const [configs, setConfigs] = useState<GameConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<GameConfigListParams>({
    page: 1,
    pageSize: 20
  });
  const [formVisible, setFormVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<GameConfig | null>(null);
  const [searchKey, setSearchKey] = useState('');
  const [searchLabel, setSearchLabel] = useState('');
  const [searchCategory, setSearchCategory] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // 获取配置列表
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await gameConfigApi.getList(searchParams);

      setConfigs(res.data.list);
      setTotal(res.data.total);
    } catch (error) {
      console.error('获取配置失败:', error);
      message.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const res = await gameConfigCategoryApi.getCategories();

      setCategories(res.data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  useEffect(() => {
    void fetchConfigs();
  }, [searchParams]);

  useEffect(() => {
    void fetchCategories();
  }, []);

  // 搜索
  const handleSearch = () => {
    setSearchParams({
      ...searchParams,
      key: searchKey || undefined,
      label: searchLabel || undefined,
      categoryId: searchCategory,
      page: 1
    });
  };

  // 清空搜索
  const handleClear = () => {
    setSearchKey('');
    setSearchLabel('');
    setSearchCategory(undefined);
    setSearchParams({ page: 1, pageSize: 20 });
  };

  // 新增
  const handleAdd = () => {
    setEditingConfig(null);
    setFormVisible(true);
  };

  // 编辑
  const handleEdit = (config: GameConfig) => {
    setEditingConfig(config);
    setFormVisible(true);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await gameConfigApi.delete(id);
      message.success('删除配置成功');
      void fetchConfigs();
      void fetchCategories(); // 刷新分类列表
    } catch (error) {
      console.error('删除配置失败:', error);
      message.error('删除配置失败');
    }
  };

  // 保存
  const handleSave = async (data: Partial<GameConfig>) => {
    try {
      if (editingConfig) {
        await gameConfigApi.update(editingConfig.id, data);
        message.success('更新配置成功');
      } else {
        await gameConfigApi.create(data as any);
        message.success('创建配置成功');
      }
      // 只有成功时才关闭表单并刷新
      setFormVisible(false);
      void fetchConfigs();
      void fetchCategories();
    } catch (error: any) {
      console.error('保存配置失败:', error);
      const errorMessage = error?.response?.data?.message ?? '保存配置失败';

      message.error(errorMessage);
    }
  };

  // 分页
  const handlePageChange = (page: number, pageSize: number) => {
    setSearchParams({ ...searchParams, page, pageSize });
  };

  // 推送配置同步
  const handleSyncConfigs = async () => {
    try {
      setLoading(true);
      const res = await gameConfigApi.syncConfigs();

      message.success(`配置推送成功！所有游戏实例将更新配置 (${new Date(res.data.timestamp).toLocaleTimeString()})`);
    } catch (error) {
      console.error('推送配置失败:', error);
      message.error('推送配置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-4 flex justify-between'>
        <div className='flex gap-2'>
          <Select
            placeholder='选择分类'
            value={searchCategory}
            onChange={value => setSearchCategory(value)}
            allowClear
            onClear={() => setSearchCategory(undefined)}
            showSearch
            optionFilterProp='children'
            style={{ width: 200 }}
          >
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>
                {cat.displayName}
              </Option>
            ))}
          </Select>
          <Input
            placeholder='搜索配置键（Key）'
            value={searchKey}
            onChange={e => setSearchKey(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Input
            placeholder='搜索标签（Label）'
            value={searchLabel}
            onChange={e => setSearchLabel(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Button type='primary' icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            清空
          </Button>
        </div>
        <div className='flex gap-2'>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
            添加配置
          </Button>
          <Button icon={<CloudSyncOutlined />} loading={loading} onClick={() => void handleSyncConfigs()} style={{ color: '#1890ff', borderColor: '#1890ff' }}>
            推送配置
          </Button>
        </div>
      </div>

      <ConfigTable
        configs={configs}
        total={total}
        page={searchParams.page ?? 1}
        pageSize={searchParams.pageSize ?? 20}
        loading={loading}
        onEdit={handleEdit}
        onDelete={id => void handleDelete(id)}
        onPageChange={handlePageChange}
      />

      {formVisible && <ConfigForm config={editingConfig} categories={categories} onSave={handleSave} onCancel={() => setFormVisible(false)} />}
    </div>
  );
}
