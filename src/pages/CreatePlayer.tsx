import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { playerApi } from '../api';
import { useNotificationStore } from '../store';

export default function CreatePlayer() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    playerName: '',
    playerId: '',
    phone: '',
    wecomUserId: '',
    shareRatio: 70,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerName || !form.playerId) {
      addNotification('error', '请填写必填项');
      return;
    }

    try {
      setLoading(true);
      const response = await playerApi.createPlayer({
        ...form,
        status: 'offline',
        creditScore: 100,
        balance: 0,
        totalEarnings: 0,
        orderCount: 0,
        completedCount: 0,
        failedCount: 0,
        completionRate: 100,
        rating: 5.0,
      });

      if (response.success) {
        addNotification('success', '打手创建成功');
        navigate('/players');
      } else {
        addNotification('error', response.message || '创建打手失败');
      }
    } catch (error) {
      addNotification('error', '创建打手失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">添加打手</h1>
          <p className="text-gray-500 mt-1">填写打手信息创建新的打手账号</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                打手名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.playerName}
                onChange={(e) => setForm({ ...form, playerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入打手名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                打手ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.playerId}
                onChange={(e) => setForm({ ...form, playerId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入打手ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系电话
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入联系电话"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                企业微信用户ID
              </label>
              <input
                type="text"
                value={form.wecomUserId}
                onChange={(e) => setForm({ ...form, wecomUserId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入企业微信用户ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分成比例 (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.shareRatio}
                onChange={(e) => setForm({ ...form, shareRatio: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入分成比例"
              />
              <p className="text-sm text-gray-500 mt-1">打手获得的订单金额比例</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
