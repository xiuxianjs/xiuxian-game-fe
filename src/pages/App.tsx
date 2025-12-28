import { Outlet } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { menuItems } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const { Header, Sider, Content } = Layout;

export default function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
        setMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    void logout();
    void navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const menuItemsWithKeys = menuItems.map(item => {
    if (item.children) {
      return {
        key: item.key,
        icon: <span>{item.icon}</span>,
        label: item.label,
        children: item.children.map(child => ({
          key: child.path,
          label: child.label
        }))
      };
    }

    return {
      key: item.path,
      icon: <span>{item.icon}</span>,
      label: item.label
    };
  });

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人设置'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'profile') {
      void navigate('/profile');
    } else if (key === 'logout') {
      void handleLogout();
    }
  };

  return (
    <Layout className='min-h-screen'>
      {/* 移动端遮罩层 */}
      {isMobile && mobileMenuOpen && <div className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden' onClick={closeMobileMenu} />}

      <Sider
        trigger={null}
        collapsible
        collapsed={isMobile ? false : sidebarCollapsed}
        width={200}
        collapsedWidth={80}
        className={`fixed left-0 top-0 bottom-0 z-50 ${isMobile && !mobileMenuOpen ? '-translate-x-full' : ''}`}
      >
        <div className='h-16 flex items-center justify-center border-b border-gray-200'>
          <div className='w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-base'>👑</div>
          {(!sidebarCollapsed || isMobile) && (
            <div className='ml-3 text-white'>
              <div className='font-bold text-base'>修仙MIS</div>
              <div className='text-xs opacity-80'>管理系统</div>
            </div>
          )}
        </div>
        <div
          className='scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800'
          style={{
            height: 'calc(100vh - 64px)',
            overflowY: 'auto'
          }}
        >
          <Menu
            theme='dark'
            mode='inline'
            selectedKeys={[]}
            items={menuItemsWithKeys}
            onClick={({ key }) => {
              void navigate(key);
              if (isMobile) {
                void closeMobileMenu();
              }
            }}
          />
        </div>
      </Sider>

      <Layout className={isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-20' : 'ml-50'}>
        <Header className='px-4 bg-white flex items-center justify-between border-b border-gray-200'>
          <Button type='text' icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={toggleSidebar} className='text-base w-16 h-16' />

          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick
            }}
            placement='bottomRight'
          >
            <div className='flex items-center cursor-pointer px-3 py-2 rounded transition-colors hover:bg-gray-100'>
              <Avatar size='small' icon={<UserOutlined />} />
              <span className='ml-2 mr-1'>{user?.username ?? '管理员'}</span>
            </div>
          </Dropdown>
        </Header>

        <Content className='m-4 p-6 bg-white min-h-screen overflow-auto'>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
