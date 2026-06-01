import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { orderApi, customerApi, playerApi } from '../api';
import { Order, Customer, Player } from '../types';
import { useNotificationStore } from '../store';

export default function EditOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    game: '三角洲行动',
    content: '',
    requirements: '',
    price: '',
    completionTime: '',
    requiredPlayersCount: 1 as 1 | 2,
    player1Id: '',
    player2Id: '',
  });

  useEffect(() => {
    loadCustomers();
    loadPlayers();
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getCustomers({ pageSize: 100 });
      if (response.success && response.data) {
        setCustomers(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadPlayers = async () => {
    try {
      const response = await playerApi.getPlayers({ pageSize: 100 });
      if (response.success && response.data) {
        setPlayers(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load players:', error);
    }
  };

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrder(id!);
      if (response.success && response.data) {
        setOrder(response.data);
        const playerIds = response.data.playerIds || [];
        setFormData({
          customerId: response.data.customerId,
          game: response.data.game,
          content: response.data.content,
          requirements: response.data.requirements || '',
          price: String(response.data.price),
          completionTime: response.data.completionTime ? new Date(response.data.completionTime).toISOString().slice(0, 16) : '',
          requiredPlayersCount: response.data.requiredPlayersCount || 1,
          player1Id: playerIds[0] || '',
          player2Id: playerIds[1] || '',
        });
      }
    } catch (error) {
      addNotification('error', '加载订单信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'requiredPlayersCount' ? Number(value) as 1 | 2 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.content || !formData.price) {
      addNotification('error', '请填写必填项');
      return;
    }

    try {
      setLoading(true);
      const playerIds: string[] = [];
      if (formData.player1Id) playerIds.push(formData.player1Id);
      if (formData.requiredPlayersCount === 2 && formData.player2Id) {
        playerIds.push(formData.player2Id);
      }

      const response = await orderApi.updateOrder(id!, {
        ...formData,
        price: parseFloat(formData.price),
        playerIds,
        playerId: playerIds[0],
      });

      if (response.success) {
        addNotification('success', '订单更新成功');
        navigate(`/orders/${id}`);
      } else {
        addNotification('error', response.message || '更新失败');
      }
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) {
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
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">编辑订单</h1>
          <p className="text-gray-500 mt-1">订单号: {order.orderNo}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客户 <span className="text-red-500">*</span>
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">选择客户</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customerName} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                游戏 <span className="text-red-500">*</span>
              </label>
              <select
                name="game"
                value={formData.game}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="三角洲行动">三角洲行动</option>
                <option value="王者荣耀">王者荣耀</option>
                <option value="英雄联盟">英雄联盟</option>
                <option value="和平精英">和平精英</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                所需打手数量
              </label>
              <select
                name="requiredPlayersCount"
                value={formData.requiredPlayersCount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1名</option>
                <option value={2}>2名</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                打手选择 {formData.requiredPlayersCount === 2 ? '(主)' : ''}
              </label>
              <select
                name="player1Id"
                value={formData.player1Id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择打手</option>
                {players.filter(p => p.status === 'online' || p.status === 'busy').map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.playerName} - {player.playerId} ({player.status === 'online' ? '在线' : '忙碌'})
                  </option>
                ))}
              </select>
            </div>

            {formData.requiredPlayersCount === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  打手选择 (副)
                </label>
                <select
                  name="player2Id"
                  value={formData.player2Id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">选择打手</option>
                  {players.filter(p => p.status === 'online' || p.status === 'busy').map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.playerName} - {player.playerId} ({player.status === 'online' ? '在线' : '忙碌'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                代练内容 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="例如：专家→荣耀段位代练"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                代练要求
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                placeholder="填写特殊要求、注意事项等"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                代练价格 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完成时间
              </label>
              <input
                type="datetime-local"
                name="completionTime"
                value={formData.completionTime}
                onChange={handleChange}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">订单完成时自动填充</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
