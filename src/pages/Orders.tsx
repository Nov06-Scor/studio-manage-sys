import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { orderApi } from '../api';
import { Order } from '../types';
import { useNotificationStore } from '../store';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrders({
        status: statusFilter || undefined,
        page: currentPage,
        pageSize: 10,
      });
      if (response.success && response.data) {
        setOrders(response.data.items);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      addNotification('error', '加载订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishOrder = async (orderId: string) => {
    try {
      const response = await orderApi.publishOrder(orderId);
      if (response.success) {
        addNotification('success', '订单已发布到派单群');
        loadOrders();
      }
    } catch (error) {
      addNotification('error', '发布订单失败');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('确定要删除该订单吗？')) {
      return;
    }
    try {
      const response = await orderApi.deleteOrder(orderId);
      if (response.success) {
        addNotification('success', '订单已删除');
        loadOrders();
      }
    } catch (error) {
      addNotification('error', '删除订单失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      verified: 'bg-blue-100 text-blue-700 border-blue-200',
      published: 'bg-purple-100 text-purple-700 border-purple-200',
      assigned: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      in_progress: 'bg-orange-100 text-orange-700 border-orange-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
      disputed: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
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

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">订单管理</h1>
          <p className="text-gray-500 mt-1">管理所有代练订单</p>
        </div>
        <Link
          to="/orders/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          创建订单
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索订单号、游戏、内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="verified">已审核</option>
                <option value="published">已发布</option>
                <option value="assigned">已分配</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
                <option value="disputed">争议中</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter size={20} />
                筛选
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  游戏/内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  价格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  完成时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {order.orderNo}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.game}</p>
                        <p className="text-sm text-gray-500 mt-1">{order.content}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      ¥{order.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.completionTime ? new Date(order.completionTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/orders/${order.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/orders/${order.id}/edit`}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="编辑"
                        >
                          <Edit size={18} />
                        </Link>
                        {order.status === 'verified' && (
                          <button
                            onClick={() => handlePublishOrder(order.id)}
                            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                            title="发布到派单群"
                          >
                            <Send size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    暂无订单数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              第 {currentPage} 页，共 {totalPages} 页
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
