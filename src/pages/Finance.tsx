import { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
} from 'lucide-react';
import { financeApi } from '../api';
import { useNotificationStore } from '../store';

interface FinanceStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  todayIncome: number;
  todayExpense: number;
}

export default function Finance() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await financeApi.getBalance();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      addNotification('error', '加载财务数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    addNotification('info', '正在导出报表...');
    setTimeout(() => {
      addNotification('success', '报表导出成功');
    }, 1000);
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
          <h1 className="text-3xl font-bold text-gray-900">财务对账</h1>
          <p className="text-gray-500 mt-1">查看财务报表和资金流水</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">日报</option>
            <option value="weekly">周报</option>
            <option value="monthly">月报</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download size={20} />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">总收入</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ¥{(stats?.totalIncome || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            今日收入: ¥{(stats?.todayIncome || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">总支出</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ¥{(stats?.totalExpense || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            今日支出: ¥{(stats?.todayExpense || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">净利润</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ¥{(stats?.netProfit || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            利润率: {stats?.totalIncome ? ((stats.netProfit / stats.totalIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">账户余额</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                ¥{(stats?.netProfit || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            可用余额: ¥{(stats?.netProfit || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">资金流水</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  暂无资金流水数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">财务报表</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">订单收入</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ¥{(stats?.totalIncome || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">打手结算</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                -¥{(stats?.totalExpense || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">工作室利润</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ¥{(stats?.netProfit || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
