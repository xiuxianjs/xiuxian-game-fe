import { Sect, SectListData, UpdateSectData, sectAPI } from '@/api/sect';
import { EditSectModal } from '@/components/SectManagement/SectFormModal';
import { SectStatusModal } from '@/components/SectManagement/SectStatusModal';
import { SectTable } from '@/components/SectManagement/SectTable';
import { Button, Card, Spin, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

const SectManagement: React.FC = () => {
  const [sects, setSects] = useState<Sect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 分页状态
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // 弹窗状态
  const [editModal, setEditModal] = useState({ isOpen: false, sect: null as Sect | null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, sect: null as Sect | null });

  // 加载宗门列表

  const fetchSects = async (params?: { page?: number; pageSize?: number; keyword?: string }) => {
    setLoading(true);
    try {
      // 合并分页参数
      const queryParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...params
      };
      const res = await sectAPI.getList(queryParams);

      // 校验接口返回是否成功
      if (!res.success) {
        throw new Error(res.message);
      }

      // 解析分页数据（SectListData 类型包含 list/total/page 等字段）
      const { list, total, page, pageSize, totalPages } = res.data as SectListData;

      setSects(list);
      setPagination({ total, page, pageSize, totalPages }); // 更新分页状态
      setError(null);
    } catch (err: any) {
      setError('获取宗门列表失败，请刷新重试');
      setSects([]);
      message.error(err.message ?? '获取宗门数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSects();
  }, []);

  // 编辑宗门

  const handleUpdate = async (id: number, data: UpdateSectData) => {
    try {
      const res = await sectAPI.update({ ...data, id });

      if (!res.success) {
        throw new Error(res.message);
      }

      message.success('宗门编辑成功');
      setEditModal({ isOpen: false, sect: null });
      void fetchSects();
    } catch (err: any) {
      message.error(err.message ?? '宗门编辑失败');
    }
  };

  // 更新宗门状态

  const handleStatusChange = async (id: number, status: number) => {
    try {
      const res = await sectAPI.updateStatus({ id, status });

      if (!res.success) {
        throw new Error(res.message);
      }

      const statusText = status === 0 ? '启用' : '禁用';

      message.success(`宗门${statusText}成功`);
      setStatusModal({ isOpen: false, sect: null });
      void fetchSects(); // 刷新列表
    } catch (err: any) {
      const statusText = status === 0 ? '启用' : '禁用';

      message.error(err.message ?? `宗门${statusText}失败`);
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, page, pageSize }));
    void fetchSects({ page, pageSize }); // 加载新分页数据
  };

  return (
    <div>
      {loading ? (
        <div className='flex justify-center items-center py-12'>
          <Spin size='large' tip='加载中...' />
        </div>
      ) : error ? (
        <Card className='max-w-2xl mx-auto'>
          <div className='text-center py-12'>
            <Text type='danger' className='text-lg block mb-4'>
              {error}
            </Text>
            <Button type='primary' onClick={() => void fetchSects()}>
              重试加载
            </Button>
          </div>
        </Card>
      ) : sects.length === 0 ? (
        <Card className='max-w-2xl mx-auto bg-gradient-to-br gray-100'>
          <div className='text-center py-12'>
            <Text type='secondary' className='mb-4 block'>
              暂无宗门数据（请通过后端接口添加后刷新）
            </Text>
            <Button type='primary' onClick={() => void fetchSects()}>
              刷新列表
            </Button>
          </div>
        </Card>
      ) : (
        // 7. 修正：给 SectTable 传递分页参数和分页回调
        <SectTable
          data={sects}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange, // 分页变更回调
            showSizeChanger: true, // 显示每页大小切换器
            showTotal: (total: number) => `共 ${total} 个宗门` // 显示总条数
          }}
          onEdit={sect => setEditModal({ isOpen: true, sect })}
          onStatusChange={sect => setStatusModal({ isOpen: true, sect })}
        />
      )}

      <EditSectModal
        sect={editModal.sect}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, sect: null })}
        onSave={handleUpdate} // 传递修正后的 handleUpdate（id 为 number 类型）
      />

      <SectStatusModal
        sect={statusModal.sect}
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, sect: null })}
        onConfirm={handleStatusChange} // 传递修正后的 handleStatusChange（id 为 number 类型）
      />
    </div>
  );
};

export default SectManagement;
