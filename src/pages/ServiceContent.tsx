import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { serviceApi } from '../api';
import { ServiceContent, GameType } from '../types';
import { useNotificationStore } from '../store';
import { useAuthStore } from '../store';

export default function ServiceContentPage() {
  const [services, setServices] = useState<ServiceContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameTypeFilter, setGameTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadServices();
  }, [currentPage, gameTypeFilter]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await serviceApi.getServices({
        gameType: gameTypeFilter || undefined,
        page: currentPage,
        pageSize: 10,
      });
      if (response.success && response.data) {
        setServices(response.data.items);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      addNotification('error', '加载服务内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      addNotification('error', '无权限删除');
      return;
    }
    if (!window.confirm('确定要删除该服务内容吗？')) {
      return;
    }
    try {
      const response = await serviceApi.deleteService(id);
      if (response.success) {
        addNotification('success', '删除成功');
        loadServices();
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

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">服务内容管理</h1>
          <p className="text-gray-500 mt-1">管理代练服务项目</p>
        </div>
        {isAdmin && (
          <Link
            to="/services/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            添加服务
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索服务名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={gameTypeFilter}
              onChange={(e) => {
                setGameTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部类型</option>
              <option value="pc">端游</option>
              <option value="mobile">手游</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  服务名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  游戏类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  基准价格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  保底哈夫币
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/services/${service.id}`}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {service.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getGameTypeColor(service.gameType)}`}
                      >
                        {getGameTypeLabel(service.gameType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">¥{service.basePrice}</td>
                    <td className="px-6 py-4 font-semibold text-purple-600">{service.baseHafCoins}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {getStatusLabel(service.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {service.description || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/services/${service.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={18} />
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              to={`/services/${service.id}/edit`}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="编辑"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(service.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="删除"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    暂无服务内容
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
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
