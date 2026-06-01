import { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { employeeApi, authApi } from '../api';
import type { Department, Position, Employee, EmployeeStatus, Permission } from '../types';
import { useAuthStore, useNotificationStore } from '../store';
import { usePermission } from '../hooks/usePermission';

const permissionList: Permission[] = [
  { id: '1', name: '查看控制台', code: 'dashboard:view', category: 'dashboard', description: '查看系统仪表盘', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: '订单查看', code: 'order:view', category: 'order', description: '查看订单列表和详情', createdAt: '2024-01-01T00:00:00Z' },
  { id: '3', name: '订单创建', code: 'order:create', category: 'order', description: '创建新订单', createdAt: '2024-01-01T00:00:00Z' },
  { id: '4', name: '订单编辑', code: 'order:edit', category: 'order', description: '编辑订单信息', createdAt: '2024-01-01T00:00:00Z' },
  { id: '5', name: '订单删除', code: 'order:delete', category: 'order', description: '删除订单', createdAt: '2024-01-01T00:00:00Z' },
  { id: '6', name: '订单分配', code: 'order:assign', category: 'order', description: '分配订单给打手', createdAt: '2024-01-01T00:00:00Z' },
  { id: '7', name: '订单审核', code: 'order:review', category: 'order', description: '审核订单完成情况', createdAt: '2024-01-01T00:00:00Z' },
  { id: '8', name: '服务查看', code: 'service:view', category: 'service', description: '查看服务列表', createdAt: '2024-01-01T00:00:00Z' },
  { id: '9', name: '服务创建', code: 'service:create', category: 'service', description: '创建新服务', createdAt: '2024-01-01T00:00:00Z' },
  { id: '10', name: '服务编辑', code: 'service:edit', category: 'service', description: '编辑服务信息', createdAt: '2024-01-01T00:00:00Z' },
  { id: '11', name: '服务删除', code: 'service:delete', category: 'service', description: '删除服务', createdAt: '2024-01-01T00:00:00Z' },
  { id: '12', name: '打手查看', code: 'player:view', category: 'player', description: '查看打手列表', createdAt: '2024-01-01T00:00:00Z' },
  { id: '13', name: '打手创建', code: 'player:create', category: 'player', description: '创建打手账号', createdAt: '2024-01-01T00:00:00Z' },
  { id: '14', name: '打手编辑', code: 'player:edit', category: 'player', description: '编辑打手信息', createdAt: '2024-01-01T00:00:00Z' },
  { id: '15', name: '打手删除', code: 'player:delete', category: 'player', description: '删除打手账号', createdAt: '2024-01-01T00:00:00Z' },
  { id: '16', name: '打手审核', code: 'player:approve', category: 'player', description: '审核打手申请', createdAt: '2024-01-01T00:00:00Z' },
  { id: '17', name: '客户查看', code: 'customer:view', category: 'customer', description: '查看客户列表', createdAt: '2024-01-01T00:00:00Z' },
  { id: '18', name: '客户创建', code: 'customer:create', category: 'customer', description: '创建客户信息', createdAt: '2024-01-01T00:00:00Z' },
  { id: '19', name: '客户编辑', code: 'customer:edit', category: 'customer', description: '编辑客户信息', createdAt: '2024-01-01T00:00:00Z' },
  { id: '20', name: '客户删除', code: 'customer:delete', category: 'customer', description: '删除客户', createdAt: '2024-01-01T00:00:00Z' },
  { id: '21', name: '会员查看', code: 'member:view', category: 'member', description: '查看会员信息', createdAt: '2024-01-01T00:00:00Z' },
  { id: '22', name: '会员管理', code: 'member:manage', category: 'member', description: '管理会员等级和充值', createdAt: '2024-01-01T00:00:00Z' },
  { id: '23', name: '提现查看', code: 'withdrawal:view', category: 'withdrawal', description: '查看提现申请', createdAt: '2024-01-01T00:00:00Z' },
  { id: '24', name: '提现审核通过', code: 'withdrawal:approve', category: 'withdrawal', description: '批准提现申请', createdAt: '2024-01-01T00:00:00Z' },
  { id: '25', name: '提现审核拒绝', code: 'withdrawal:reject', category: 'withdrawal', description: '拒绝提现申请', createdAt: '2024-01-01T00:00:00Z' },
  { id: '26', name: '财务查看', code: 'finance:view', category: 'finance', description: '查看财务数据', createdAt: '2024-01-01T00:00:00Z' },
  { id: '27', name: '财务审核', code: 'finance:audit', category: 'finance', description: '审核财务数据', createdAt: '2024-01-01T00:00:00Z' },
  { id: '28', name: '财务导出', code: 'finance:export', category: 'finance', description: '导出财务报表', createdAt: '2024-01-01T00:00:00Z' },
  { id: '29', name: '员工查看', code: 'employee:view', category: 'employee', description: '查看员工列表', createdAt: '2024-01-01T00:00:00Z' },
  { id: '30', name: '员工管理', code: 'employee:manage', category: 'employee', description: '管理员工信息', createdAt: '2024-01-01T00:00:00Z' },
  { id: '31', name: '岗位管理', code: 'permission:position', category: 'permission', description: '管理岗位信息', createdAt: '2024-01-01T00:00:00Z' },
  { id: '32', name: '权限配置', code: 'permission:manage', category: 'permission', description: '配置系统权限', createdAt: '2024-01-01T00:00:00Z' },
  { id: '33', name: '交接班查看', code: 'handover:view', category: 'handover', description: '查看交接班记录', createdAt: '2024-01-01T00:00:00Z' },
  { id: '34', name: '交接班管理', code: 'handover:manage', category: 'handover', description: '创建和管理交接班', createdAt: '2024-01-01T00:00:00Z' },
  { id: '35', name: '系统设置', code: 'system:settings', category: 'system', description: '配置系统参数', createdAt: '2024-01-01T00:00:00Z' },
];

const categoryLabels: Record<string, string> = {
  dashboard: '控制台',
  order: '订单管理',
  service: '服务管理',
  player: '哈夫天梯',
  customer: '客户管理',
  member: '会员管理',
  withdrawal: '提现管理',
  employee: '人员管理',
  permission: '权限管理',
  finance: '财务管理',
  system: '系统设置',
  handover: '交接班',
};

const employeeStatusLabels: Record<EmployeeStatus, string> = {
  active: '在职',
  inactive: '离职',
  leave: '请假',
  vacation: '休假',
};

const getStatusBadgeColor = (status: EmployeeStatus) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    leave: 'bg-yellow-100 text-yellow-800',
    vacation: 'bg-blue-100 text-blue-800',
  };
  return colors[status];
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email: string): boolean => {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateEmployeeNo = () => {
  const today = new Date();
  const dateStr = today.getFullYear().toString() + 
    (today.getMonth() + 1).toString().padStart(2, '0') + 
    today.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EMP${dateStr}${random}`;
};

export default function Employees() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'departments' | 'positions' | 'employees'>('departments');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'department' | 'position' | 'employee'>('department');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filters, setFilters] = useState({
    departmentId: '',
    positionId: '',
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [formData, setFormData] = useState<any>({
    name: '',
    code: '',
    managerId: '',
    parentId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [showWecomHelp, setShowWecomHelp] = useState(false);
  const { hasPermission, isAdmin } = usePermission();

  useEffect(() => {
    loadData();
  }, [activeTab, filters, pagination.page]);

  useEffect(() => {
    if (formData.departmentId) {
      const filtered = positions.filter(pos => pos.departmentId === formData.departmentId);
      setFilteredPositions(filtered);
    } else {
      setFilteredPositions(positions);
    }
  }, [formData.departmentId, positions]);

  useEffect(() => {
    const loadPositions = async () => {
      const response = await employeeApi.getPositions({});
      if (response.success) {
        setPositions(response.data || []);
      }
    };
    loadPositions();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'departments') {
        const response = await employeeApi.getDepartments();
        if (response.success) {
          setDepartments(response.data || []);
        }
      } else if (activeTab === 'positions') {
        const response = await employeeApi.getPositions({ departmentId: filters.departmentId });
        if (response.success) {
          setPositions(response.data || []);
        }
      } else {
        const response = await employeeApi.getEmployees({
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize,
        });
        if (response.success) {
          setEmployees(response.data?.items || []);
          setPagination(prev => ({
            ...prev,
            total: response.data?.total || 0,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (modalType === 'employee') {
      if (!formData.name?.trim()) {
        newErrors.name = '请输入员工姓名';
      }
      if (!formData.phone) {
        newErrors.phone = '请输入手机号';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = '请输入正确的手机号格式（11位数字，以1开头）';
      }
      if (formData.email && !validateEmail(formData.email)) {
        newErrors.email = '请输入正确的邮箱格式';
      }
      if (!formData.departmentId) {
        newErrors.departmentId = '请选择部门';
      }
      if (!formData.positionId) {
        newErrors.positionId = '请选择岗位';
      }
      if (selectedItem === null) {
        if (!formData.username?.trim()) {
          newErrors.username = '请输入登录账号';
        }
        if (!formData.password) {
          newErrors.password = '请设置初始密码';
        } else if (formData.password.length < 3) {
          newErrors.password = '密码长度至少为3位';
        }
      }
    } else if (modalType === 'department') {
      if (!formData.name?.trim()) {
        newErrors.name = '请输入部门名称';
      }
      if (!formData.code?.trim()) {
        newErrors.code = '请输入部门编码';
      }
    } else if (modalType === 'position') {
      if (!formData.name?.trim()) {
        newErrors.name = '请输入岗位名称';
      }
      if (!formData.code?.trim()) {
        newErrors.code = '请输入岗位编码';
      }
      if (!formData.departmentId) {
        newErrors.departmentId = '请选择所属部门';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      let response;
      if (modalType === 'department') {
        response = await employeeApi.createDepartment(formData);
      } else if (modalType === 'position') {
        response = await employeeApi.createPosition(formData);
      } else {
        response = await employeeApi.createEmployee(formData);
      }
      
      if (response?.success) {
        setShowModal(false);
        setFormData({});
        setErrors({});
        loadData();
      }
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    if (!validateForm()) return;
    
    try {
      let response;
      if (modalType === 'department') {
        response = await employeeApi.updateDepartment(selectedItem.id, formData);
      } else if (modalType === 'position') {
        // 首先更新岗位基本信息
        response = await employeeApi.updatePosition(selectedItem.id, formData);
        
        // 如果有权限配置，单独更新权限
        if (formData.permissions) {
          await employeeApi.updatePositionPermissions(selectedItem.id, {
            permissionIds: formData.permissions
          });
          
          // 更新权限后，刷新当前用户信息
          const { refreshUser } = useAuthStore.getState();
          const currentUser = useAuthStore.getState().user;
          
          // 检查当前用户是否属于这个岗位
          const employees = await employeeApi.getEmployees({ page: 1, pageSize: 100 });
          if (employees.success && employees.data.items) {
            const currentEmployee = employees.data.items.find(
              (emp: Employee) => emp.username === currentUser?.username
            );
            
            if (currentEmployee && currentEmployee.positionId === selectedItem.id) {
              // 如果当前用户在这个岗位下，刷新用户权限
              const userResponse = await authApi.getCurrentUser();
              if (userResponse.success && userResponse.data) {
                refreshUser(userResponse.data);
              }
            }
          }
        }
      } else {
        response = await employeeApi.updateEmployee(selectedItem.id, formData);
      }
      
      if (response?.success) {
        setShowModal(false);
        setSelectedItem(null);
        setFormData({});
        setErrors({});
        loadData();
      }
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const openEditModal = async (type: 'department' | 'position' | 'employee', item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setErrors({});
    setShowModal(true);

    // 如果是编辑岗位，加载该岗位的权限配置
    if (type === 'position' && item) {
      try {
        const response = await employeeApi.getPositionPermissions(item.id);
        if (response.success && response.data) {
          setFormData({
            ...item,
            permissions: response.data.permissionIds || []
          });
        }
      } catch (error) {
        console.error('Failed to load position permissions:', error);
      }
    }
  };

  const openCreateModal = (type: 'department' | 'position' | 'employee') => {
    setModalType(type);
    setSelectedItem(null);
    setErrors({});
    
    if (type === 'employee') {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      setFormData({
        employeeNo: generateEmployeeNo(),
        hireDate: dateStr,
        status: 'active',
        username: '',
        password: '123',
      });
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const getModalTitle = () => {
    if (selectedItem) {
      return `编辑${modalType === 'department' ? '部门' : modalType === 'position' ? '岗位' : '员工'}`;
    }
    return `创建${modalType === 'department' ? '部门' : modalType === 'position' ? '岗位' : '员工'}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">人员管理</h1>
          <p className="text-gray-600 mt-1">管理系统组织架构、部门、岗位和员工信息</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'departments' && hasPermission('permission:position') && (
            <button
              onClick={() => openCreateModal('department')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              新建部门
            </button>
          )}
          {activeTab === 'positions' && hasPermission('permission:position') && (
            <button
              onClick={() => openCreateModal('position')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              新建岗位
            </button>
          )}
          {activeTab === 'employees' && hasPermission('employee:manage') && (
            <button
              onClick={() => openCreateModal('employee')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              新建员工
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'departments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              部门管理
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'positions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              岗位管理
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              员工管理
            </button>
          </nav>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              {activeTab === 'employees' && (
                <>
                  <input
                    type="text"
                    placeholder="搜索员工姓名..."
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.departmentId}
                    onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                  >
                    <option value="">全部部门</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">全部状态</option>
                    {Object.entries(employeeStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : (
            <>
              {activeTab === 'departments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">暂无部门数据</div>
                  ) : (
                    departments.map((dept) => (
                      <div key={dept.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">编码：{dept.code}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${
                            dept.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {dept.status === 'active' ? '正常' : '停用'}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {hasPermission('permission:position') && (
                            <button
                              onClick={() => openEditModal('department', dept)}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              编辑
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'positions' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">岗位名称</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">编码</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">所属部门</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">级别</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {positions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">暂无岗位数据</td>
                        </tr>
                      ) : (
                        positions.map((position) => (
                          <tr key={position.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{position.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {departments.find((d) => d.id === position.departmentId)?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{position.level}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded ${
                                position.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {position.status === 'active' ? '正常' : '停用'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {hasPermission('permission:position') && (
                                <button
                                  onClick={() => openEditModal('position', position)}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  编辑
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'employees' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">工号</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">登录账号</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">部门</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">岗位</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入职日期</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-gray-500">暂无员工数据</td>
                        </tr>
                      ) : (
                        employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.employeeNo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.username || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {departments.find((d) => d.id === employee.departmentId)?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {positions.find((p) => p.id === employee.positionId)?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.hireDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(employee.status)}`}>
                                {employeeStatusLabels[employee.status]}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {hasPermission('employee:manage') && (
                                <button
                                  onClick={() => openEditModal('employee', employee)}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  编辑
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {activeTab === 'employees' && pagination.total > pagination.pageSize && (
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{getModalTitle()}</h2>
            <div className="space-y-4">
              {modalType === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    员工编码 <span className="text-gray-400 text-xs">（自动生成）</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    value={formData.employeeNo || ''}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modalType === 'department' ? '部门名称' : modalType === 'position' ? '岗位名称' : '员工姓名'}
                  {modalType === 'employee' && <span className="text-red-500"> *</span>}
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {modalType === 'employee' && selectedItem === null && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      企业微信用户ID <span className="text-red-500"> *</span>
                      <button
                        onClick={() => setShowWecomHelp(true)}
                        className="ml-2 inline-flex items-center p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                        title="查看查询指引"
                      >
                        <HelpCircle size={16} />
                      </button>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="请输入企业微信用户ID"
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      初始密码 <span className="text-red-500"> *</span>
                      <span className="text-gray-400 text-xs ml-2">（默认：123）</span>
                    </label>
                    <input
                      type="password"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="初始密码"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                </>
              )}

              {modalType !== 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">编码</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>
              )}

              {modalType === 'position' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所属部门 <span className="text-red-500"> *</span></label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.departmentId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.departmentId || ''}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">请选择部门</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-red-500 text-sm mt-1">{errors.departmentId}</p>}
                </div>
              )}

              {modalType === 'position' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">级别</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.level || ''}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  />
                </div>
              )}

              {modalType === 'position' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">权限配置</label>
                  <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {Object.entries(categoryLabels).map(([category, label]) => (
                      <div key={category} className="mb-4 last:mb-0">
                        <div className="font-medium text-gray-700 mb-2">{label}</div>
                        <div className="space-y-2">
                          {permissionList
                            .filter((p) => p.category === category)
                            .map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={(formData.permissions || []).includes(permission.id)}
                                  onChange={(e) => {
                                    const currentPermissions = formData.permissions || [];
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        permissions: [...currentPermissions, permission.id],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        permissions: currentPermissions.filter(
                                          (p: string) => p !== permission.id
                                        ),
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-600">
                                  {permission.name}
                                  {permission.description && (
                                    <span className="text-gray-400 ml-1">({permission.description})</span>
                                  )}
                                </span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalType === 'employee' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">手机号 <span className="text-red-500"> *</span></label>
                    <input
                      type="tel"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="请输入11位手机号"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <input
                      type="email"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="请输入邮箱地址"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">部门 <span className="text-red-500"> *</span></label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.departmentId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.departmentId || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, departmentId: e.target.value, positionId: '' });
                      }}
                    >
                      <option value="">请选择部门</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    {errors.departmentId && <p className="text-red-500 text-sm mt-1">{errors.departmentId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">岗位 <span className="text-red-500"> *</span></label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.positionId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.positionId || ''}
                      onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                      disabled={!formData.departmentId}
                    >
                      <option value="">请选择岗位</option>
                      {filteredPositions.map((pos) => (
                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                      ))}
                    </select>
                    {errors.positionId && <p className="text-red-500 text-sm mt-1">{errors.positionId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">入职日期</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.hireDate || ''}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">在职</option>
                      <option value="inactive">离职</option>
                      <option value="leave">请假</option>
                      <option value="vacation">休假</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedItem(null);
                    setFormData({});
                    setErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={selectedItem ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedItem ? '更新' : '创建'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWecomHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">企业微信用户ID查询指引</h2>
              <button
                onClick={() => setShowWecomHelp(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">📱 移动端查询步骤</h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">①</span>
                    <span>打开企业微信，点击底部导航栏的「通讯录」</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">②</span>
                    <span>在「企业通讯录」中找到目标企业</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">③</span>
                    <span>点击右上角的「...」更多按钮，选择「管理通讯录」</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">④</span>
                    <span>选择要查询的成员，进入「编辑成员」页面</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">⑤</span>
                    <span>找到「账号」字段，该字段的值即为企业微信用户ID</span>
                  </li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">💻 电脑端查询步骤</h3>
                <ol className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">①</span>
                    <span>打开企业微信电脑端，点击左侧导航栏的「通讯录」</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">②</span>
                    <span>在组织架构中找到目标成员</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">③</span>
                    <span>右键点击成员，选择「查看资料」</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">④</span>
                    <span>在资料页面中找到「账号」字段</span>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">📷 移动端操作示意图</h3>
                <img
                  src="https://picsum.photos/800/450?random=1"
                  alt="企业微信用户ID查询示意图"
                  className="w-full rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"%3E%3Crect fill="%23f3f4f6" width="800" height="450"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E示意图：打开企业微信 → 通讯录 → 管理通讯录 → 选择成员 → 查看账号%3C/text%3E%3C/svg%3E';
                  }}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  示意图仅供参考，实际界面可能因版本略有差异
                </p>
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">操作步骤图示说明：</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-lg mb-1">①</div>
                      <div className="text-blue-700">点击通讯录</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-lg mb-1">②</div>
                      <div className="text-green-700">选择企业</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <div className="text-lg mb-1">③</div>
                      <div className="text-purple-700">管理通讯录</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <div className="text-lg mb-1">④</div>
                      <div className="text-orange-700">编辑成员</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg col-span-2">
                      <div className="text-lg mb-1">⑤</div>
                      <div className="text-red-700">查看账号字段</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 注意事项</h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• 企业微信用户ID通常以字母开头，如：zhangsan</li>
                  <li>• 请确保查询的是用户的「账号」而非「姓名」</li>
                  <li>• 只有企业管理员才能查看成员的账号信息</li>
                  <li>• 如果找不到账号字段，请检查您的管理员权限</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <button
                onClick={() => setShowWecomHelp(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
