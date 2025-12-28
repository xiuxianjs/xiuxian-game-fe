export const menuItems = [
  {
    key: 'stat',
    label: '统计板',
    icon: '🪧',
    path: '/stat-board'
  },
  {
    key: 'users',
    label: '玩家管理',
    icon: '🧑‍🤝‍🧑',
    children: [
      {
        key: 'user-list',
        label: '玩家列表',
        path: '/user-list'
      },
      {
        key: 'mute',
        label: '禁言管理',
        path: '/mute'
      },
      {
        key: 'mute-log',
        label: '禁言日志',
        path: '/mute-log'
      }
    ]
  },
  {
    label: '活动管理',
    icon: '🎉',
    path: '/activity-management'
  },
  {
    key: 'game-feedback',
    label: '游戏反馈',
    icon: '📝',
    children: [
      {
        key: 'feedback-categories',
        label: '反馈分类',
        path: '/feedback-categories'
      },
      {
        key: 'feedbacks',
        label: '反馈管理',
        path: '/feedbacks'
      }
    ]
  },
  {
    key: 'sensitive-words',
    label: '内容安全',
    icon: '🛡️',
    children: [
      {
        key: 'sensitive-words-list',
        label: '敏感词管理',
        path: '/sensitive-words/list'
      },
      {
        key: 'sensitive-wordslogs',
        label: '检测日志',
        path: '/sensitive-words/logs'
      },
      {
        key: 'sensitive-wordstatistics',
        label: '统计信息',
        path: '/sensitive-words/statistics'
      }
    ]
  },
  {
    key: 'admin',
    label: '账户管理',
    icon: '👥',
    children: [
      {
        key: 'admin-list',
        label: '账户列表',
        path: '/admin-management'
      },
      {
        key: 'role-management',
        label: '角色管理',
        path: '/role-management'
      }
    ]
  },
  {
    key: 'game-config',
    label: '游戏配置',
    icon: '⚙️',
    children: [
      {
        key: 'config-management',
        label: '配置管理',
        path: '/game-config'
      },
      {
        key: 'config-categories',
        label: '分类管理',
        path: '/game-config-categories'
      }
    ]
  },
  {
    key: 'notice',
    label: '公告管理',
    icon: '📢',
    path: '/notice'
  },
  {
    key: 'create',
    label: '邮件管理',
    icon: '✅',
    path: '/create-email'
  },
  {
    key: 'sect',
    label: '宗门管理',
    icon: '🏯',
    path: '/sect-management'
  },
  {
    key: 'recharge',
    label: '订单管理',
    icon: '💰',
    path: '/recharge'
  }
];

export const AssociationManagerPageSize = 10;
export const pageSize = 10;
