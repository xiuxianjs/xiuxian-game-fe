import { useAuth } from '@/contexts/AuthContext';
import { LockOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(values.username, values.password);

      if (result.success) {
        void navigate('/');
      } else {
        setError(result.message ?? '登录失败');
      }
    } catch (_err) {
      setError('错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <div className='w-full max-w-md'>
        <Card
          title={
            <div className='text-center'>
              <h2 className='m-0 text-2xl font-bold'>管理员登录</h2>
            </div>
          }
          className='shadow-lg'
        >
          {/* 登录表单 */}
          <Form name='login' onFinish={values => void handleSubmit(values)} autoComplete='off' layout='vertical'>
            <Form.Item
              label='用户名'
              name='username'
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder='请输入管理员用户名' size='large' />
            </Form.Item>

            <Form.Item
              label='密码'
              name='password'
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder='请输入密码' size='large' />
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit' loading={loading} size='large' block icon={<LoginOutlined />}>
                {loading ? '登录中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>

          {/* 错误提示 */}
          {error && <Alert message='登录失败' description={error} type='error' showIcon className='mb-4' />}
        </Card>
      </div>
    </div>
  );
}
