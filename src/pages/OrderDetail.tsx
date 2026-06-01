import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Clock, DollarSign, Star, CheckCircle } from 'lucide-react';
import { orderApi, customerApi, playerApi } from '../api';
import { Order, Customer, Player } from '../types';
import { useNotificationStore } from '../store';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrder(id!);
      if (response.success && response.data) {
        setOrder(response.data);
        
        if (response.data.customerId) {
          const customerResponse = await customerApi.getCustomer(response.data.customerId);
          if (customerResponse.success && customerResponse.data) {
            setCustomer(customerResponse.data);
          }
        }
        
        if (response.data.playerId) {
          const playerResponse = await playerApi.getPlayer(response.data.playerId);
          if (playerResponse.success && playerResponse.data) {
            setPlayer(playerResponse.data);
          }
        }
      }
    } catch (error) {
      addNotification('error', '加载订单详情失败');
    } finally {
      setLoading(false);
    }
  };

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

  if (!order) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">订单不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">订单详情</h1>
          <p className="text-gray-500 mt-1">订单号: {order.orderNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">订单信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">游戏</p>
                <p className="font-medium text-gray-900">{order.game}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">代练内容</p>
                <p className="font-medium text-gray-900">{order.content}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">价格</p>
                <p className="font-medium text-gray-900">¥{order.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">所需打手数量</p>
                <p className="font-medium text-gray-900">{order.requiredPlayersCount || 1}名</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">完成时间</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock size={16} />
                  {order.completionTime ? new Date(order.completionTime).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">进度</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${order.progress}%` }}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900">{order.progress}%</span>
                </div>
              </div>
            </div>
          </div>

          {order.requirements && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">特殊要求</h2>
              <p className="text-gray-700">{order.requirements}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">时间线</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">订单创建</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {order.startedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">开始执行</p>
                    <p className="text-sm text-gray-500">{new Date(order.startedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {order.completedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">订单完成</p>
                    <p className="text-sm text-gray-500">{new Date(order.completedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {customer && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">客户信息</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {customer.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{customer.customerName}</p>
                  <p className="text-sm text-gray-500">总订单: {customer.totalOrders}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  {customer.phone || '-'}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  {customer.email || '-'}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <DollarSign size={16} />
                  总消费: ¥{customer.totalSpent}
                </p>
              </div>
            </div>
          )}

          {player && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">打手信息</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {player.playerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{player.playerName}</p>
                  <p className="text-sm text-gray-500">ID: {player.playerId}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">信誉分</span>
                  <span className={`font-medium ${player.creditScore >= 80 ? 'text-green-600' : player.creditScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {player.creditScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">评分</span>
                  <span className="font-medium flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    {player.rating}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">分成比例</span>
                  <span className="font-medium text-blue-600">{player.shareRatio}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">状态</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${player.status === 'online' ? 'bg-green-100 text-green-700' : player.status === 'busy' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                    {player.status === 'online' ? '在线' : player.status === 'busy' ? '忙碌' : '离线'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
