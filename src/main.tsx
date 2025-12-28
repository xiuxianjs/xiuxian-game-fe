import { AuthProvider } from '@/contexts/AuthContext';
import '@/input.scss';
import route from '@/route';
import { App as AntApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      cssVar: true
    }}
    warning={{
      strict: false
    }}
  >
    <AntApp>
      <AuthProvider>
        <RouterProvider router={route} />
      </AuthProvider>
    </AntApp>
  </ConfigProvider>
);
