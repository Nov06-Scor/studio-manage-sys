export interface ModuleConfig {
  path: string;
  label: string;
  icon: string;
  permissions: string[];
}

export interface PermissionCategory {
  id: string;
  name: string;
  permissions: PermissionItem[];
}

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export const MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: ['dashboard:view'],
  orders: ['order:view', 'order:create', 'order:edit', 'order:delete'],
  services: ['service:view', 'service:create', 'service:edit', 'service:delete'],
  players: ['player:view', 'player:create', 'player:edit', 'player:delete'],
  customers: ['customer:view', 'customer:create', 'customer:edit', 'customer:delete'],
  withdrawals: ['withdrawal:view', 'withdrawal:approve', 'withdrawal:reject'],
  finance: ['finance:view', 'finance:audit', 'finance:export'],
  employees: ['employee:view', 'employee:manage', 'permission:position', 'permission:manage'],
  handoffs: ['handover:view', 'handover:manage'],
  system: ['system:settings'],
};

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'dashboard',
    name: '控制台',
    permissions: [
      { id: '1', code: 'dashboard:view', name: '查看控制台', description: '查看系统仪表盘' },
    ],
  },
  {
    id: 'order',
    name: '订单管理',
    permissions: [
      { id: '2', code: 'order:view', name: '订单查看', description: '查看订单列表和详情' },
      { id: '3', code: 'order:create', name: '订单创建', description: '创建新订单' },
      { id: '4', code: 'order:edit', name: '订单编辑', description: '编辑订单信息' },
      { id: '5', code: 'order:delete', name: '订单删除', description: '删除订单' },
      { id: '6', code: 'order:assign', name: '订单分配', description: '分配订单给打手' },
      { id: '7', code: 'order:review', name: '订单审核', description: '审核订单完成情况' },
    ],
  },
  {
    id: 'service',
    name: '服务管理',
    permissions: [
      { id: '8', code: 'service:view', name: '服务查看', description: '查看服务列表' },
      { id: '9', code: 'service:create', name: '服务创建', description: '创建新服务' },
      { id: '10', code: 'service:edit', name: '服务编辑', description: '编辑服务信息' },
      { id: '11', code: 'service:delete', name: '服务删除', description: '删除服务' },
    ],
  },
  {
    id: 'player',
    name: '哈夫天梯',
    permissions: [
      { id: '12', code: 'player:view', name: '打手查看', description: '查看打手列表' },
      { id: '13', code: 'player:create', name: '打手创建', description: '创建打手账号' },
      { id: '14', code: 'player:edit', name: '打手编辑', description: '编辑打手信息' },
      { id: '15', code: 'player:delete', name: '打手删除', description: '删除打手账号' },
      { id: '16', code: 'player:approve', name: '打手审核', description: '审核打手申请' },
    ],
  },
  {
    id: 'customer',
    name: '客户管理',
    permissions: [
      { id: '17', code: 'customer:view', name: '客户查看', description: '查看客户列表' },
      { id: '18', code: 'customer:create', name: '客户创建', description: '创建客户信息' },
      { id: '19', code: 'customer:edit', name: '客户编辑', description: '编辑客户信息' },
      { id: '20', code: 'customer:delete', name: '客户删除', description: '删除客户' },
      { id: '21', code: 'member:view', name: '会员查看', description: '查看会员信息' },
      { id: '22', code: 'member:manage', name: '会员管理', description: '管理会员等级和充值' },
    ],
  },
  {
    id: 'withdrawal',
    name: '提现管理',
    permissions: [
      { id: '23', code: 'withdrawal:view', name: '提现查看', description: '查看提现申请' },
      { id: '24', code: 'withdrawal:approve', name: '提现审核通过', description: '批准提现申请' },
      { id: '25', code: 'withdrawal:reject', name: '提现审核拒绝', description: '拒绝提现申请' },
    ],
  },
  {
    id: 'finance',
    name: '财务管理',
    permissions: [
      { id: '26', code: 'finance:view', name: '财务查看', description: '查看财务数据' },
      { id: '27', code: 'finance:audit', name: '财务审核', description: '审核财务数据' },
      { id: '28', code: 'finance:export', name: '财务导出', description: '导出财务报表' },
    ],
  },
  {
    id: 'employee',
    name: '人员管理',
    permissions: [
      { id: '29', code: 'employee:view', name: '员工查看', description: '查看员工列表' },
      { id: '30', code: 'employee:manage', name: '员工管理', description: '管理员工信息' },
    ],
  },
  {
    id: 'permission',
    name: '权限管理',
    permissions: [
      { id: '31', code: 'permission:position', name: '岗位管理', description: '管理岗位信息' },
      { id: '32', code: 'permission:manage', name: '权限配置', description: '配置系统权限' },
    ],
  },
  {
    id: 'handover',
    name: '交接班',
    permissions: [
      { id: '33', code: 'handover:view', name: '交接班查看', description: '查看交接班记录' },
      { id: '34', code: 'handover:manage', name: '交接班管理', description: '创建和管理交接班' },
    ],
  },
  {
    id: 'system',
    name: '系统设置',
    permissions: [
      { id: '35', code: 'system:settings', name: '系统设置', description: '配置系统参数' },
    ],
  },
];

export const ALL_PERMISSION_CODES = PERMISSION_CATEGORIES.flatMap(cat => 
  cat.permissions.map(p => p.code)
);

export const getModulePermissions = (moduleKey: string): string[] => {
  return MODULE_PERMISSIONS[moduleKey] || [];
};

export const getPermissionByCode = (code: string): PermissionItem | undefined => {
  for (const category of PERMISSION_CATEGORIES) {
    const permission = category.permissions.find(p => p.code === code);
    if (permission) return permission;
  }
  return undefined;
};

export const getCategoryPermissions = (categoryId: string): PermissionItem[] => {
  const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
  return category?.permissions || [];
};