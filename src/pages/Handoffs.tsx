import { useState, useEffect } from 'react';
import { handoffApi, employeeApi } from '../api';
import type { Handover, ShiftType, HandoverStatus, Employee, Order } from '../types';
import { formatCurrency } from '../lib/utils';

const shiftTypeLabels: Record<ShiftType, string> = {
  morning: '早班',
  afternoon: '中班',
  night: '晚班',
  custom: '自定义',
};

const handoverStatusLabels: Record<HandoverStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  cancelled: '已取消',
};

const getStatusBadgeColor = (status: HandoverStatus) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
};

interface HandoffOrder {
  id: string;
  orderNo: string;
  customerName: string;
  status: string;
}

export default function Handoffs() {
  const [handoffs, setHandoffs] = useState<Handover[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orders, setOrders] = useState<HandoffOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHandoff, setSelectedHandoff] = useState<Handover | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    shiftType: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const [formData, setFormData] = useState({
    shiftType: 'morning' as ShiftType,
    handoverUserId: '',
    receiverUserId: '',
    orderIds: [] as string[],
    notes: '',
  });

  useEffect(() => {
    loadHandoffs();
    loadEmployees();
  }, [filters, pagination.page]);

  useEffect(() => {
    if (showModal) {
      loadOrders();
    }
  }, [showModal]);

  const loadHandoffs = async () => {
    setLoading(true);
    try {
      const response = await handoffApi.getHandoffs({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (response.success) {
        setHandoffs(response.data?.items || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data?.total || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load handoffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getEmployees({
        status: 'active',
        page: 1,
        pageSize: 100,
      });
      if (response.success) {
        setEmployees(response.data?.items || []);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await handoffApi.getHandoffs({
        status: 'pending',
        page: 1,
        pageSize: 100,
      });
      if (response.success) {
        const allOrders: Array<{ id: string; orderNo: string; customerName: string; status: string }> = [];
        (response.data?.items || []).forEach((handoff: Handover) => {
          handoff.orders.forEach((order) => {
            allOrders.push({
              id: order.orderId,
              orderNo: order.orderNo,
              customerName: order.customerName,
              status: order.status,
            });
          });
        });
        setOrders(allOrders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleCreateHandoff = async () => {
    try {
      const response = await handoffApi.createHandoff({
        ...formData,
        orders: formData.orderIds.map((orderId) => {
          const order = orders.find((o) => o.id === orderId);
          return {
            orderId,
            orderNo: order?.orderNo || '',
            customerName: order?.customerName || '',
            status: 'pending',
          };
        }),
      });
      if (response.success) {
        setShowModal(false);
        setFormData({
          shiftType: 'morning',
          handoverUserId: '',
          receiverUserId: '',
          orderIds: [],
          notes: '',
        });
        loadHandoffs();
      }
    } catch (error) {
      console.error('Failed to create handoff:', error);
    }
  };

  const handleConfirmHandoff = async (id: string) => {
    try {
      const response = await handoffApi.confirmHandoff(id);
      if (response.success) {
        loadHandoffs();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Failed to confirm handoff:', error);
    }
  };

  const handleCancelHandoff = async (id: string, reason: string) => {
    try {
      const response = await handoffApi.cancelHandoff(id, { reason });
      if (response.success) {
        loadHandoffs();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Failed to cancel handoff:', error);
    }
  };

  const openDetailModal = (handoff: Handover) => {
    setSelectedHandoff(handoff);
    setShowDetailModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">客服交接班</h1>
        <p className="text-gray-600 mt-1">管理客服工作交接，确保服务连续性</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="搜索交接单号..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.shiftType}
                onChange={(e) => setFilters({ ...filters, shiftType: e.target.value })}
              >
                <option value="">全部班次</option>
                {Object.entries(shiftTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">全部状态</option>
                {Object.entries(handoverStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建交接单
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">交接单号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">班次</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">交班人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">接班人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">交接订单数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : handoffs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    暂无交接记录
                  </td>
                </tr>
              ) : (
                handoffs.map((handoff) => (
                  <tr key={handoff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {handoff.handoverNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {shiftTypeLabels[handoff.shiftType]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {handoff.handoverUser?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {handoff.receiverUser?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {handoff.orders.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(handoff.status)}`}>
                        {handoverStatusLabels[handoff.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(handoff.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openDetailModal(handoff)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        详情
                      </button>
                      {handoff.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmHandoff(handoff.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          确认
                        </button>
                      )}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">创建交接单</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">班次类型</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as ShiftType })}
                >
                  {Object.entries(shiftTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">交班人</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.handoverUserId}
                  onChange={(e) => setFormData({ ...formData, handoverUserId: e.target.value })}
                >
                  <option value="">请选择交班人</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">接班人</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.receiverUserId}
                  onChange={(e) => setFormData({ ...formData, receiverUserId: e.target.value })}
                >
                  <option value="">请选择接班人</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">交接订单</label>
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {orders.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">暂无待交接订单</div>
                  ) : (
                    orders.map((order) => (
                      <label
                        key={order.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.orderIds.includes(order.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                orderIds: [...formData.orderIds, order.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                orderIds: formData.orderIds.filter((id) => id !== order.id),
                              });
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{order.orderNo}</div>
                          <div className="text-sm text-gray-500">{order.customerName}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'in_progress' ? '进行中' :
                           order.status === 'pending' ? '待处理' : order.status}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注说明</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="请输入交接备注信息..."
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
                onClick={handleCreateHandoff}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建交接单
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedHandoff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">交接单详情</h2>
                <p className="text-gray-600 mt-1">{selectedHandoff.handoverNo}</p>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeColor(selectedHandoff.status)}`}>
                {handoverStatusLabels[selectedHandoff.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">班次</div>
                <div className="font-semibold text-gray-900">{shiftTypeLabels[selectedHandoff.shiftType]}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">交接订单数</div>
                <div className="font-semibold text-gray-900">{selectedHandoff.orders.length}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">交班人</div>
                <div className="font-semibold text-gray-900">
                  {selectedHandoff.handoverUser?.name || '-'}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">接班人</div>
                <div className="font-semibold text-gray-900">
                  {selectedHandoff.receiverUser?.name || '-'}
                </div>
              </div>
            </div>

            {selectedHandoff.notes && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">备注说明</h3>
                <div className="p-4 bg-gray-50 rounded-lg text-gray-700">{selectedHandoff.notes}</div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">交接订单</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedHandoff.orders.map((order, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{order.orderNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.customerName}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded ${
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'in_progress' ? '进行中' :
                             order.status === 'pending' ? '待处理' : order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedHandoff.messages.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">交接消息</h3>
                <div className="space-y-3">
                  {selectedHandoff.messages.map((message) => (
                    <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{message.senderName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(message.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div className="text-gray-700">{message.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
              {selectedHandoff.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      const reason = prompt('请输入取消原因：');
                      if (reason) {
                        handleCancelHandoff(selectedHandoff.id, reason);
                      }
                    }}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    取消交接
                  </button>
                  <button
                    onClick={() => handleConfirmHandoff(selectedHandoff.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    确认接收
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
