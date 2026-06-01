import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Gamepad2, Coins, Tag, FileText } from 'lucide-react';
import { serviceApi } from '../api';
import { ServiceContent, GameType } from '../types';
import { useNotificationStore } from '../store';
import { useAuthStore } from '../store';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (id) {
      loadService(id);
    }
  }, [id]);

  const loadService = async (serviceId: string) => {
    try {
      setLoading(true);
      const response = await serviceApi.getService(serviceId);
      if (response.success && response.data) {
        setService(response.data);
      }
    } catch (error) {
      addNotification('error', '加载服务详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!service || !isAdmin) return;
    if (!window.confirm('确定要删除该服务内容吗？')) {
      return;
    }
    try {
      const response = await serviceApi.deleteService(service.id);
      if (response.success) {
        addNotification('success', '删除成功');
        window.location.href = '/services';
      }
    } catch (error) {
      addNotification('error', '删除失败');
    }
  };

  const getGameTypeLabel = (type: GameType) => {
    return type === 'pc' ? '端游' : '手游';
  };

  const getGameTypeColor = (type: GameType) => {
    return type === 'pc'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? '启用' : '禁用';
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
  };

  if (loading) {
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
        <Link
          to="/services"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          返回列表
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">服务详情</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h2>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getGameTypeColor(service.gameType)}`}
                >
                  <Gamepad2 size={14} className="mr-1" />
                  {getGameTypeLabel(service.gameType)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                  {getStatusLabel(service.status)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <>
                  <Link
                    to={`/services/${service.id}/edit`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Edit size={18} />
                    编辑
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    删除
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="text-blue-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">基准价格</h3>
                </div>
                <p className="text-4xl font-bold text-gray-900">¥{service.basePrice}</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="text-purple-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">保底哈夫币</h3>
                </div>
                <p className="text-4xl font-bold text-purple-600">{service.baseHafCoins}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-gray-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">服务描述</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {service.description || '暂无描述'}
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">创建时间</h3>
                <p className="text-gray-600">
                  {new Date(service.createdAt).toLocaleString('zh-CN')}
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">更新时间</h3>
                <p className="text-gray-600">
                  {new Date(service.updatedAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}