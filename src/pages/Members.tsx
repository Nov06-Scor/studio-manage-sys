import { useState, useEffect } from 'react';
import { memberApi } from '../api';
import type { Member, MemberLevel, MemberStatus } from '../types';
import { formatCurrency } from '../lib/utils';

const memberLevelLabels: Record<MemberLevel, string> = {
  bronze: '青铜',
  silver: '白银',
  gold: '黄金',
  platinum: '铂金',
  diamond: '钻石',
};

const memberStatusLabels: Record<MemberStatus, string> = {
  active: '正常',
  inactive: '未激活',
  frozen: '已冻结',
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    memberName: '',
    phone: '',
    email: '',
    birthday: '',
  });
  const [rechargeData, setRechargeData] = useState({
    amount: '',
    paymentMethod: 'wechat',
  });
  const [filters, setFilters] = useState({
    level: '',
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadMembers();
  }, [filters, pagination.page, pagination.pageSize]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await memberApi.getMembers({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (response.success) {
        setMembers(response.data?.items || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async () => {
    try {
      const response = await memberApi.createMember(formData);
      if (response.success) {
        setShowModal(false);
        setFormData({
          memberName: '',
          phone: '',
          email: '',
          birthday: '',
        });
        loadMembers();
      }
    } catch (error) {
      console.error('Failed to create member:', error);
    }
  };

  const handleRecharge = async () => {
    if (!selectedMember) return;
    
    try {
      const response = await memberApi.rechargeMember(selectedMember.id, {
        amount: parseFloat(rechargeData.amount),
        paymentMethod: rechargeData.paymentMethod,
        operatorId: '1',
      });
      if (response.success) {
        setShowRechargeModal(false);
        setSelectedMember(null);
        setRechargeData({
          amount: '',
          paymentMethod: 'wechat',
        });
        loadMembers();
      }
    } catch (error) {
      console.error('Failed to recharge:', error);
    }
  };

  const getLevelBadgeColor = (level: MemberLevel) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-indigo-100 text-indigo-800',
      diamond: 'bg-cyan-100 text-cyan-800',
    };
    return colors[level];
  };

  const getStatusBadgeColor = (status: MemberStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      frozen: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">会员管理</h1>
        <p className="text-gray-600 mt-1">管理会员信息、储值和消费记录</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="搜索会员姓名或手机号..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              >
                <option value="">全部等级</option>
                {Object.entries(memberLevelLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">全部状态</option>
                {Object.entries(memberStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              开卡
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会员编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会员姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">等级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">余额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">累计充值</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">累计消费</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    暂无会员数据
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.memberNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.memberName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getLevelBadgeColor(member.level)}`}>
                        {memberLevelLabels[member.level]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(member.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(member.totalRecharged)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(member.totalConsumed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(member.status)}`}>
                        {memberStatusLabels[member.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRechargeModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        储值
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 mr-3">
                        详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > pagination.pageSize && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              显示 {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，共 {pagination.total} 条
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page * pagination.pageSize >= pagination.total}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">开卡</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会员姓名</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.memberName}
                  onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生日</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                确认开卡
              </button>
            </div>
          </div>
        </div>
      )}

      {showRechargeModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">储值 - {selectedMember.memberName}</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">当前余额</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(selectedMember.balance)}</div>
              <div className="text-sm text-gray-600 mt-2">
                会员等级：{memberLevelLabels[selectedMember.level]}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">储值金额</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={rechargeData.amount}
                  onChange={(e) => setRechargeData({ ...rechargeData, amount: e.target.value })}
                  placeholder="请输入储值金额"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支付方式</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={rechargeData.paymentMethod}
                  onChange={(e) => setRechargeData({ ...rechargeData, paymentMethod: e.target.value })}
                >
                  <option value="wechat">微信支付</option>
                  <option value="alipay">支付宝</option>
                  <option value="cash">现金</option>
                  <option value="bankcard">银行卡</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRechargeModal(false);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleRecharge}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                确认储值
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
