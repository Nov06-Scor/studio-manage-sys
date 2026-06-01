import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  UserCog,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Building2,
  Trophy,
  RefreshCw,
  Package,
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { usePermission } from '../../hooks/usePermission';
import { authApi, employeeApi } from '../../api';
import type { Position } from '../../types';

const menuItems = [
  { path: '/', label: '控制台', icon: LayoutDashboard, moduleKey: 'dashboard' },
  { path: '/orders', label: '订单管理', icon: ShoppingCart, moduleKey: 'orders' },
  { path: '/services', label: '服务管理', icon: Package, moduleKey: 'services' },
  { path: '/players', label: '哈夫天梯', icon: Trophy, moduleKey: 'players' },
  { path: '/customers', label: '客户管理', icon: UserCog, moduleKey: 'customers' },
  { path: '/withdrawals', label: '提现管理', icon: Wallet, moduleKey: 'withdrawals' },
  { path: '/finance', label: '财务对账', icon: Wallet, moduleKey: 'finance' },
  { path: '/employees', label: '人员管理', icon: Building2, moduleKey: 'employees' },
  { path: '/handoffs', label: '客服交接', icon: RefreshCw, moduleKey: 'handoffs' },
  { path: '/system', label: '系统设置', icon: Settings, moduleKey: 'system' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentPositionName, setCurrentPositionName] = useState<string>('');
  const { user, logout, refreshUser } = useAuthStore();
  const { hasModuleAccess } = usePermission();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data) {
          refreshUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    if (!user) {
      fetchCurrentUser();
    }
  }, [user, refreshUser]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await employeeApi.getPositions();
        if (response.success && response.data) {
          setPositions(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch positions:', error);
      }
    };

    fetchPositions();
  }, []);

  useEffect(() => {
    const findPositionName = async () => {
      if (!user) return;

      if (user.positionName) {
        setCurrentPositionName(user.positionName);
        return;
      }

      if (user.positionId && positions.length > 0) {
        const position = positions.find(p => p.id === user.positionId);
        if (position) {
          setCurrentPositionName(position.name);
          return;
        }
      }

      if (user.username) {
        try {
          const response = await employeeApi.getEmployees({ pageSize: 100 });
          if (response.success && response.data) {
            const employee = response.data.items.find((e: any) => e.username === user.username);
            if (employee && employee.positionId) {
              const position = positions.find(p => p.id === employee.positionId);
              if (position) {
                setCurrentPositionName(position.name);
              } else {
                setCurrentPositionName(getRoleLabel(user.role));
              }
            } else {
              setCurrentPositionName(getRoleLabel(user.role));
            }
          } else {
            setCurrentPositionName(getRoleLabel(user.role));
          }
        } catch (error) {
          console.error('Failed to find employee:', error);
          setCurrentPositionName(getRoleLabel(user.role));
        }
      } else {
        setCurrentPositionName(getRoleLabel(user.role));
      }
    };

    findPositionName();
  }, [user, positions]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: '管理员',
      manager: '店长',
      deputy: '副店长',
      customer_service: '客服',
      player: '打手',
      finance: '财务',
    };
    return labels[role] || role;
  };

  const filteredMenuItems = menuItems.filter(item => {
    return hasModuleAccess(item.moduleKey);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              三角洲代练系统
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800">
                欢迎回来，{user?.name || user?.username || '用户'}
              </h2>
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {currentPositionName || getRoleLabel(user?.role || 'admin')}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {(user?.name || user?.username)?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="text-sm font-medium text-gray-700">
                        {user?.name || user?.username}
                      </span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserCog size={16} />
                      个人中心
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
