import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { dashboardApi } from '../api';
import { useAuthStore } from '../store';
import { DashboardStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: '今日订单',
      value: stats?.todayOrders || 0,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: '今日收益',
      value: `¥${(stats?.todayRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: '待处理订单',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      trend: '-5%',
      trendUp: false,
    },
    {
      label: '活跃打手',
      value: stats?.activePlayers || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      trend: '+3%',
      trendUp: true,
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      verified: 'bg-blue-100 text-blue-700',
      published: 'bg-purple-100 text-purple-700',
      assigned: 'bg-indigo-100 text-indigo-700',
      in_progress: 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
      disputed: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待审核',
      verified: '已审核',
      published: '已发布',
      assigned: '已分配',
      in_progress: '进行中',
      completed: '已完成',
      cancelled: '已取消',
      disputed: '争议中',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.username}
          </h1>
          <p className="text-gray-500 mt-1">这里是您的工作概览</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/orders/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart size={20} />
            创建订单
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon size={24} className={`bg-gradient-to-br ${stat.color} bg-clip-text`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">最新订单</h2>
              <Link
                to="/orders"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                查看全部 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">{order.orderNo}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.game} - {order.content}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">¥{order.price}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                暂无订单数据
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">风险预警</h2>
              <Link
                to="/system/alerts"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                查看全部 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-red-900">订单即将逾期</p>
                <p className="text-sm text-red-600 mt-1">3个订单将在24小时内逾期</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-yellow-900">打手信誉分过低</p>
                <p className="text-sm text-yellow-600 mt-1">2名打手信誉分低于60分</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <AlertCircle className="text-blue-600 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-blue-900">待审核提现</p>
                <p className="text-sm text-blue-600 mt-1">{stats?.pendingWithdrawals || 0}笔提现待处理</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
}
