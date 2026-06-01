import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { serviceApi } from '../api';
import { ServiceContent, GameType } from '../types';
import { useNotificationStore } from '../store';
import { useAuthStore } from '../store';

export default function EditService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceContent | null>(null);

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">无权限访问此页面</p>
      </div>
    );
  }

  const [form, setForm] = useState({
    name: '',
    gameType: 'pc' as GameType,
    basePrice: '',
    baseHafCoins: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await serviceApi.getService(id!);
      if (response.success && response.data) {
        setService(response.data);
        setForm({
          name: response.data.name,
          gameType: response.data.gameType,
          basePrice: String(response.data.basePrice),
          baseHafCoins: String(response.data.baseHafCoins),
          description: response.data.description || '',
          status: response.data.status,
        });
      }
    } catch (error) {
      addNotification('error', '加载服务内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.basePrice || !form.baseHafCoins) {
      addNotification('error', '请填写必填项');
      return;
    }

    try {
      setLoading(true);
      const response = await serviceApi.updateService(id!, {
        ...form,
        basePrice: parseFloat(form.basePrice),
        baseHafCoins: parseInt(form.baseHafCoins),
      });

      if (response.success) {
        addNotification('success', '服务内容更新成功');
        navigate('/services');
      } else {
        addNotification('error', response.message || '更新失败');
      }
    } catch (error) {
      addNotification('error', '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !service) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">服务内容不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/services')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">编辑服务内容</h1>
          <p className="text-gray-500 mt-1">修改服务项目信息</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                服务名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入服务名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                游戏类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={form.gameType}
                onChange={(e) => setForm({ ...form, gameType: e.target.value as GameType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pc">端游</option>
                <option value="mobile">手游</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                基准价格 (元) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                保底哈夫币 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.baseHafCoins}
                onChange={(e) => setForm({ ...form, baseHafCoins: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入保底哈夫币"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入服务描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
