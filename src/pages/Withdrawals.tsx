import { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
} from 'lucide-react';
import { financeApi, playerApi } from '../api';
import { Withdrawal, Player } from '../types';
import { useNotificationStore } from '../store';

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadWithdrawals();
    loadPlayers();
  }, [currentPage, statusFilter]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await financeApi.getWithdrawals({
        status: statusFilter || undefined,
        page: currentPage,
        pageSize: 10,
      });
      if (response.success && response.data) {
        setWithdrawals(response.data.items);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      addNotification('error', '加载提现列表失败');
    } finally {
      setLoading(false);
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

  const handleReview = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setActionLoading(id);
    try {
      const response = await financeApi.reviewWithdrawal(id, {
        status,
        rejectionReason: reason,
      });
      if (response.success) {
        addNotification('success', status === 'approved' ? '已通过审核' : '已拒绝');
        loadWithdrawals();
      }
    } catch (error) {
      addNotification('error', '操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecute = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await financeApi.executeWithdrawal(id);
      if (response.success) {
        addNotification('success', '打款成功');
        loadWithdrawals();
      }
    } catch (error) {
      addNotification('error', '打款失败');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      processing: 'bg-purple-100 text-purple-700 border-purple-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已拒绝',
      processing: '打款中',
      completed: '已完成',
    };
    return labels[status] || status;
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player?.playerName || playerId;
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
          <h1 className="text-3xl font-bold text-gray-900">提现管理</h1>
          <p className="text-gray-500 mt-1">管理打手提现申请</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索打手名称..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
              <option value="processing">打款中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申请人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申请金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  手续费
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  实发金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  银行信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申请时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.length > 0 ? (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getPlayerName(withdrawal.playerId)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      ¥{withdrawal.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      ¥{withdrawal.fee.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                      ¥{withdrawal.actualAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{withdrawal.bankName}</p>
                        <p className="text-xs text-gray-500">{withdrawal.bankAccount}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          withdrawal.status
                        )}`}
                      >
                        {getStatusLabel(withdrawal.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {withdrawal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReview(withdrawal.id, 'approved')}
                              disabled={actionLoading === withdrawal.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="通过"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleReview(withdrawal.id, 'rejected', '信息核实不符')}
                              disabled={actionLoading === withdrawal.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="拒绝"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {withdrawal.status === 'approved' && (
                          <button
                            onClick={() => handleExecute(withdrawal.id)}
                            disabled={actionLoading === withdrawal.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="执行打款"
                          >
                            <DollarSign size={18} />
                          </button>
                        )}
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    暂无提现数据
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
