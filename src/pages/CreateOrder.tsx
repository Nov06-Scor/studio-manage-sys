import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Info } from 'lucide-react';
import { orderApi, customerApi, serviceApi, playerApi } from '../api';
import { useNotificationStore, useAuthStore } from '../store';
import { Customer, ServiceContent, GameType, Player } from '../types';

export default function CreateOrder() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceContent[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    gameType: 'pc' as GameType,
    game: '三角洲行动',
    serviceContentId: '',
    content: '',
    price: '',
    originalPrice: '',
    hafCoins: '',
    originalHafCoins: '',
    requirements: '',
    requiredPlayersCount: 1 as 1 | 2,
    player1Id: '',
    player2Id: '',
  });

  const [priceModified, setPriceModified] = useState(false);
  const [hafCoinsModified, setHafCoinsModified] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadServices();
    loadPlayers();
  }, []);

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

  const loadServices = async () => {
    try {
      const response = await serviceApi.getServices({ status: 'active' });
      if (response.success && response.data) {
        setServices(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
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

  const handleServiceChange = (serviceId: string) => {
    setFormData((prev) => ({ ...prev, serviceContentId: serviceId }));
    
    if (serviceId) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        setFormData((prev) => ({
          ...prev,
          content: service.name,
          price: String(service.basePrice),
          originalPrice: String(service.basePrice),
          hafCoins: String(service.baseHafCoins),
          originalHafCoins: String(service.baseHafCoins),
        }));
        setPriceModified(false);
        setHafCoinsModified(false);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        content: '',
        price: '',
        originalPrice: '',
        hafCoins: '',
        originalHafCoins: '',
      }));
      setPriceModified(false);
      setHafCoinsModified(false);
    }
  };

  const handlePriceChange = (value: string) => {
    setFormData((prev) => {
      const isModified = prev.originalPrice && value !== prev.originalPrice;
      setPriceModified(isModified);
      return { ...prev, price: value };
    });
  };

  const handleHafCoinsChange = (value: string) => {
    setFormData((prev) => {
      const isModified = prev.originalHafCoins && value !== prev.originalHafCoins;
      setHafCoinsModified(isModified);
      return { ...prev, hafCoins: value };
    });
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

    setLoading(true);
    try {
      const playerIds: string[] = [];
      if (formData.player1Id) playerIds.push(formData.player1Id);
      if (formData.requiredPlayersCount === 2 && formData.player2Id) {
        playerIds.push(formData.player2Id);
      }

      const response = await orderApi.createOrder({
        ...formData,
        price: parseFloat(formData.price),
        hafCoins: parseInt(formData.hafCoins) || 0,
        originalPrice: parseFloat(formData.originalPrice) || undefined,
        originalHafCoins: parseInt(formData.originalHafCoins) || undefined,
        playerShareRatio: 80,
        assignedBy: user?.id,
        playerIds,
        playerId: playerIds[0],
      });

      if (response.success && response.data) {
        addNotification('success', '订单创建成功');
        navigate(`/orders/${response.data.id}`);
      } else {
        addNotification('error', response.message || '创建失败');
      }
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.customerId || !formData.content || !formData.price) {
      addNotification('error', '请先填写必填项');
      return;
    }

    setLoading(true);
    try {
      const playerIds: string[] = [];
      if (formData.player1Id) playerIds.push(formData.player1Id);
      if (formData.requiredPlayersCount === 2 && formData.player2Id) {
        playerIds.push(formData.player2Id);
      }

      addNotification('info', '正在创建订单...');

      const response = await orderApi.createOrder({
        ...formData,
        price: parseFloat(formData.price),
        hafCoins: parseInt(formData.hafCoins) || 0,
        originalPrice: parseFloat(formData.originalPrice) || undefined,
        originalHafCoins: parseInt(formData.originalHafCoins) || undefined,
        playerShareRatio: 80,
        assignedBy: user?.id,
        playerIds,
        playerId: playerIds[0],
      });

      if (response.success && response.data) {
        addNotification('info', '订单创建成功，正在发布到派单群...');
        
        const publishResponse = await orderApi.publishOrder(response.data.id);
        if (publishResponse.success) {
          addNotification('success', '订单创建并已成功发布到派单群');
          navigate('/orders');
        } else {
          addNotification('error', publishResponse.message || '订单创建成功，但发布到派单群失败');
          navigate(`/orders/${response.data.id}`);
        }
      } else {
        addNotification('error', response.message || '订单创建失败');
      }
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">创建订单</h1>
          <p className="text-gray-500 mt-1">填写订单信息</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开单客服 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300">
                <span className="font-medium text-gray-900">{user?.name || user?.username || '未知'}</span>
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">自动生成</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                游戏类型 <span className="text-red-500">*</span>
              </label>
              <select
                name="gameType"
                value={formData.gameType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="pc">端游</option>
                <option value="mobile">手游</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                老板名称 <span className="text-red-500">*</span>
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
                服务内容 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.serviceContentId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择服务内容</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                订单价格 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    priceModified ? 'border-orange-400 bg-orange-50' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {formData.originalPrice && priceModified && (
                <div className="flex items-center gap-2 mt-1 text-sm text-orange-600">
                  <Info size={14} />
                  <span>已修改，原始值: ¥{formData.originalPrice}</span>
                </div>
              )}
              {!priceModified && formData.originalPrice && (
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">自动填充</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                保底哈夫币
              </label>
              <input
                type="number"
                name="hafCoins"
                value={formData.hafCoins}
                onChange={(e) => handleHafCoinsChange(e.target.value)}
                placeholder="0"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  hafCoinsModified ? 'border-orange-400 bg-orange-50' : 'border-gray-300'
                }`}
              />
              {formData.originalHafCoins && hafCoinsModified && (
                <div className="flex items-center gap-2 mt-1 text-sm text-orange-600">
                  <Info size={14} />
                  <span>已修改，原始值: {formData.originalHafCoins}</span>
                </div>
              )}
              {!hafCoinsModified && formData.originalHafCoins && (
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">自动填充</span>
                </div>
              )}
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
                备注
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
              保存
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={20} />
              保存并发布
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
