import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { playerApi } from '../api';
import { Player } from '../types';
import { useNotificationStore } from '../store';

export default function EditPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);

  const [form, setForm] = useState({
    playerName: '',
    playerId: '',
    phone: '',
    wecomUserId: '',
    shareRatio: 70,
    status: 'offline',
    creditScore: 100,
  });

  useEffect(() => {
    if (id) {
      loadPlayer();
    }
  }, [id]);

  const loadPlayer = async () => {
    try {
      setLoading(true);
      const response = await playerApi.getPlayer(id!);
      if (response.success && response.data) {
        setPlayer(response.data);
        setForm({
          playerName: response.data.playerName,
          playerId: response.data.playerId,
          phone: '',
          wecomUserId: response.data.wecomUserId || '',
          shareRatio: response.data.shareRatio,
          status: response.data.status,
          creditScore: response.data.creditScore,
        });
      }
    } catch (error) {
      addNotification('error', '加载打手信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerName || !form.playerId) {
      addNotification('error', '请填写必填项');
      return;
    }

    try {
      setLoading(true);
      const response = await playerApi.updatePlayer(id!, form);

      if (response.success) {
        addNotification('success', '打手信息更新成功');
        navigate('/players');
      } else {
        addNotification('error', response.message || '更新打手失败');
      }
    } catch (error) {
      addNotification('error', '更新打手失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !player) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">编辑打手</h1>
          <p className="text-gray-500 mt-1">修改打手信息</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="online">在线</option>
                <option value="offline">离线</option>
                <option value="busy">忙碌</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                信誉分
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.creditScore}
                onChange={(e) => setForm({ ...form, creditScore: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入信誉分"
              />
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
