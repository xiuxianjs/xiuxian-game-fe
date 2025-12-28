import { lazy } from 'react';
import { Navigate, createHashRouter } from 'react-router-dom';
const ProtectedRoute = lazy(() => import('@/components/ProtectedRoute'));
const Login = lazy(() => import('@/pages/Login/App'));
const MuteManager = lazy(() => import('@/pages/MuteManager/App'));
const MuteLogs = lazy(() => import('@/pages/MuteLog/App'));

const AdminManagement = lazy(() => import('@/pages/AdminManagement/App'));
const RoleManagement = lazy(() => import('@/pages/RoleManagement/App'));
const ActivityManagement = lazy(() => import('@/pages/ActivityManagement/App'));
const App = lazy(() => import('@/pages/App'));
const Profile = lazy(() => import('@/pages/Profile/App'));
const GameConfig = lazy(() => import('@/pages/GameConfig/App'));
const GameConfigCategories = lazy(() => import('@/pages/GameConfigCategories/App'));
const FeedbackCategories = lazy(() => import('@/pages/FeedbackCategories/App'));
const Feedbacks = lazy(() => import('@/pages/Feedbacks/App'));
const UserList = lazy(() => import('@/pages/UserList/App'));
const Email = lazy(() => import('@/pages/email/App'));
const SensitiveWords = lazy(() => import('@/pages/SensitiveWords/App'));

const NoticeManagement = lazy(() => import('@/pages/NoticeManagement/App'));
const SectManagement = lazy(() => import('@/pages/SectManagement/App'));
const StatBoard = lazy(() => import('@/pages/StatBoard/App'));
const Recharge = lazy(() => import('@/pages/Recharge/App'));

export default createHashRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        // 禁言管理
        path: '/mute',
        element: <MuteManager />
      },
      {
        // 禁言日志
        path: '/mute-log',
        element: <MuteLogs />
      },
      {
        // 玩家列表
        path: '/user-list',
        element: <UserList />
      },
      {
        // 管理员管理
        path: '/admin-management',
        element: <AdminManagement />
      },
      {
        // 角色管理
        path: '/role-management',
        element: <RoleManagement />
      },
      {
        // 游戏配置管理
        path: '/game-config',
        element: <GameConfig />
      },
      {
        // 游戏配置分类管理
        path: '/game-config-categories',
        element: <GameConfigCategories />
      },
      // 个人设置
      {
        path: '/profile',
        element: <Profile />
      },
      {
        path: '/activity-management',
        element: <ActivityManagement />
      },
      {
        path: '/feedback-categories',
        element: <FeedbackCategories />
      },
      {
        path: '/feedbacks',
        element: <Feedbacks />
      },
      {
        path: '/create-email',
        element: <Email />
      },
      {
        path: '/sensitive-words',
        children: [
          {
            path: 'list',
            element: <SensitiveWords />
          },
          {
            path: 'logs',
            element: <SensitiveWords />
          },
          {
            path: 'statistics',
            element: <SensitiveWords />
          },
          {
            path: '',
            element: <Navigate to='/sensitive-words/list' replace />
          }
        ]
      },

      {
        path: '/notice',
        element: <NoticeManagement />
      },
      // 宗门管理
      {
        path: '/sect-management',
        element: <SectManagement />
      },
      // 统计板
      {
        path: '/stat-board',
        element: <StatBoard />
      },
      // 充值订单管理
      {
        path: '/recharge',
        element: <Recharge />
      }
    ]
  }
]);
