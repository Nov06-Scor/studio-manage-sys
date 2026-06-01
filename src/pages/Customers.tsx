import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Edit, Phone, Mail, CreditCard } from 'lucide-react';
import { customerApi, memberApi } from '../api';
import { Customer, Member, MemberLevel, MemberStatus } from '../types';
import { useNotificationStore } from '../store';
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

export default function Customers() {
  const [customers, setCustomers] = useState<(Customer & { member?: Member })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addNotification } = useNotificationStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showOpenCardModal, setShowOpenCardModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer & { member?: Member } | null>(null);
  
  const [addForm, setAddForm] = useState({
    customerName: '',
    phone: '',
    email: '',
  });
  
  const [openCardForm, setOpenCardForm] = useState({
    memberName: '',
    phone: '',
    email: '',
    birthday: '',
  });
  
  const [rechargeData, setRechargeData] = useState({
    amount: '',
    paymentMethod: 'wechat',
  });

  useEffect(() => {
    loadCustomers();
  }, [currentPage]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getCustomers({
        page: currentPage,
        pageSize: 10,
      });
      if (response.success && response.data) {
        const customerList = response.data.items;
        
        const customersWithMember = await Promise.all(
          customerList.map(async (customer: Customer) => {
            try {
              const memberResponse = await memberApi.getMemberByPhone(customer.phone || '');
              if (memberResponse.success && memberResponse.data) {
                return { ...customer, member: memberResponse.data };
              }
            } catch (error) {
              // 没有会员信息，不处理
            }
            return { ...customer, member: undefined };
          })
        );
        
        setCustomers(customersWithMember);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      addNotification('error', '加载客户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    try {
      const response = await customerApi.createCustomer(addForm);
      if (response.success) {
        setShowAddModal(false);
        setAddForm({ customerName: '', phone: '', email: '' });
        loadCustomers();
        addNotification('success', '客户添加成功');
      }
    } catch (error) {
      addNotification('error', '添加客户失败');
    }
  };

  const handleOpenCard = async () => {
    if (!selectedCustomer) return;
    
    try {
      const response = await memberApi.createMember({
        memberName: openCardForm.memberName || selectedCustomer.customerName,
        phone: openCardForm.phone || selectedCustomer.phone || '',
        email: openCardForm.email || selectedCustomer.email,
        birthday: openCardForm.birthday,
      });
      if (response.success) {
        setShowOpenCardModal(false);
        setOpenCardForm({ memberName: '', phone: '', email: '', birthday: '' });
        setSelectedCustomer(null);
        loadCustomers();
        addNotification('success', '开卡成功');
      }
    } catch (error) {
      addNotification('error', '开卡失败');
    }
  };

  const handleRecharge = async () => {
    if (!selectedCustomer?.member) return;
    
    try {
      const response = await memberApi.rechargeMember(selectedCustomer.member.id, {
        amount: parseFloat(rechargeData.amount),
        paymentMethod: rechargeData.paymentMethod,
        operatorId: '1',
      });
      if (response.success) {
        setShowRechargeModal(false);
        setSelectedCustomer(null);
        setRechargeData({ amount: '', paymentMethod: 'wechat' });
        loadCustomers();
        addNotification('success', '储值成功');
      }
    } catch (error) {
      addNotification('error', '储值失败');
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

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm)) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-3xl font-bold text-gray-900">客户管理</h1>
          <p className="text-gray-500 mt-1">管理所有客户信息，支持开卡和储值</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            添加客户
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索客户名称、电话或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  会员状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  会员余额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总消费
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.customerName}</p>
                          <p className="text-xs text-gray-500">
                            创建于 {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone size={14} />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail size={14} />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.member ? (
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-blue-500" />
                          <span className={`px-2 py-1 text-xs rounded-full ${getLevelBadgeColor(customer.member.level)}`}>
                            {memberLevelLabels[customer.member.level]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">非会员</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {customer.member ? (
                        <span className="font-semibold text-gray-900">{formatCurrency(customer.member.balance)}</span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      ¥{customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {customer.status === 'active' ? '活跃' : '非活跃'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="编辑"
                        >
                          <Edit size={18} />
                        </button>
                        {!customer.member && (
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setOpenCardForm({
                                memberName: customer.customerName,
                                phone: customer.phone || '',
                                email: customer.email || '',
                                birthday: '',
                              });
                              setShowOpenCardModal(true);
                            }}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm transition-colors"
                            title="开卡"
                          >
                            开卡
                          </button>
                        )}
                        {customer.member && (
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowRechargeModal(true);
                            }}
                            className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm transition-colors"
                            title="储值"
                          >
                            储值
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    暂无客户数据
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">添加客户</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户名称</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={addForm.customerName}
                  onChange={(e) => setAddForm({ ...addForm, customerName: e.target.value })}
                  placeholder="请输入客户名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="请输入邮箱（可选）"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showOpenCardModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">为 {selectedCustomer.customerName} 开卡</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会员姓名</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={openCardForm.memberName}
                  onChange={(e) => setOpenCardForm({ ...openCardForm, memberName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={openCardForm.phone}
                  onChange={(e) => setOpenCardForm({ ...openCardForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={openCardForm.email}
                  onChange={(e) => setOpenCardForm({ ...openCardForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生日</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={openCardForm.birthday}
                  onChange={(e) => setOpenCardForm({ ...openCardForm, birthday: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowOpenCardModal(false);
                  setSelectedCustomer(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleOpenCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                确认开卡
              </button>
            </div>
          </div>
        </div>
      )}

      {showRechargeModal && selectedCustomer?.member && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">储值 - {selectedCustomer.customerName}</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">当前余额</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(selectedCustomer.member.balance)}</div>
              <div className="text-sm text-gray-600 mt-2">
                会员等级：{memberLevelLabels[selectedCustomer.member.level]}
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
                  setSelectedCustomer(null);
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
