import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Tabs, Form, Input, Button, Row, Col, Avatar, Tag, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const [form] = Form.useForm();

  const handlePasswordSubmit = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');

      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('密码修改成功');
        form.resetFields();
      } else {
        message.error(result.message ?? '密码修改失败');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('密码修改失败');
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: '个人信息',
      children: (
        <div>
          <Row gutter={24}>
            <Col span={8}>
              <Card>
                <div className='text-center'>
                  <Avatar size={80} icon={<UserOutlined />} className='mb-4' />
                  <h3 className='m-0 mb-2'>{user?.username ?? '管理员'}</h3>
                  <p className='m-0 text-gray-500'>系统管理员</p>
                </div>
              </Card>
            </Col>
            <Col span={16}>
              <Card title='基本信息'>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div>
                      <div className='text-gray-500 text-xs'>用户名</div>
                      <div className='font-bold mt-1'>{user?.username ?? 'admin'}</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <div className='text-gray-500 text-xs'>角色</div>
                      <div className='mt-1'>
                        <Tag color='red'>超级管理员</Tag>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <div className='text-gray-500 text-xs'>登录时间</div>
                      <div className='font-bold mt-1'>{new Date().toLocaleString('zh-CN')}</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <div className='text-gray-500 text-xs'>账户状态</div>
                      <div className='mt-1'>
                        <Tag color='green'>正常</Tag>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'password',
      label: '修改密码',
      children: (
        <Card>
          <Form form={form} layout='vertical' onFinish={values => void handlePasswordSubmit(values)} className='max-w-md'>
            <Form.Item label='当前密码' name='currentPassword' rules={[{ required: true, message: '请输入当前密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder='请输入当前密码' />
            </Form.Item>

            <Form.Item
              label='新密码'
              name='newPassword'
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder='请输入新密码' />
            </Form.Item>

            <Form.Item
              label='确认新密码'
              name='confirmPassword'
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error('两次输入的密码不一致'));
                  }
                })
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder='请再次输入新密码' />
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit' block>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    }
  ];

  return (
    <div className=''>
      <Card className='mb-4'>
        <h2 className='m-0 text-2xl font-bold'>个人设置</h2>
        <p className='mt-2 mb-0 text-gray-500'>管理您的个人信息和账户设置</p>
      </Card>

      <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />
    </div>
  );
}
