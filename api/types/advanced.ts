export interface Member {
  id: string;
  memberNo: string;
  memberName: string;
  phone: string;
  email?: string;
  level: MemberLevel;
  balance: number;
  totalConsumed: number;
  totalRecharged: number;
  totalOrders: number;
  status: 'active' | 'inactive' | 'frozen';
  birthday?: string;
  createdAt: string;
  updatedAt: string;
}

export type MemberLevel = 'normal' | 'silver' | 'gold' | 'diamond';

export interface MemberLevelConfig {
  level: MemberLevel;
  name: string;
  openFee: number;
  rechargeBonus: number;
  serviceDiscount: number;
  privileges: string[];
}

export interface Recharge {
  id: string;
  memberId: string;
  amount: number;
  bonus: number;
  actualAmount: number;
  paymentMethod: 'wechat' | 'alipay' | 'bank_transfer' | 'cash';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  operatorId: string;
  createdAt: string;
  completedAt?: string;
}

export interface Consumption {
  id: string;
  memberId: string;
  orderId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: 'order' | 'refund' | 'adjustment' | 'recharge';
  description?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeNo: string;
  name: string;
  phone: string;
  email?: string;
  username?: string;
  positionId: string;
  departmentId: string;
  status: 'active' | 'inactive' | 'leave' | 'vacation';
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  managerId?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  level: number;
  description?: string;
  status: 'active' | 'inactive';
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  category: PermissionCategory;
  description?: string;
  createdAt: string;
}

export type PermissionCategory =
  | 'dashboard'
  | 'order'
  | 'service'
  | 'player'
  | 'customer'
  | 'member'
  | 'withdrawal'
  | 'finance'
  | 'employee'
  | 'permission'
  | 'handover'
  | 'system';

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Handover {
  id: string;
  handoverNo: string;
  shiftType: ShiftType;
  handoverUserId: string;
  receiverUserId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  orders: HandoverOrder[];
  messages: HandoverMessage[];
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
}

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'custom';

export interface HandoverOrder {
  orderId: string;
  orderNo: string;
  customerName: string;
  status: string;
  progress?: number;
  note?: string;
}

export interface HandoverMessage {
  content: string;
  type: 'pending_reply' | 'complaint' | 'important';
  customerName?: string;
  status: 'pending' | 'replied' | 'escalated';
}

export interface HandoverRecord {
  id: string;
  handoverId: string;
  userId: string;
  action: 'create' | 'confirm' | 'cancel' | 'update';
  description?: string;
  createdAt: string;
}

export interface OrderProof {
  id: string;
  orderId: string;
  type: 'screenshot' | 'video' | 'text';
  url: string;
  description?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface OrderReview {
  id: string;
  orderId: string;
  reviewerId: string;
  result: 'approved' | 'rejected' | 'disputed';
  comment?: string;
  evidence?: string;
  createdAt: string;
}

export const MEMBER_LEVEL_CONFIG: MemberLevelConfig[] = [
  {
    level: 'normal',
    name: '普通会员',
    openFee: 0,
    rechargeBonus: 0,
    serviceDiscount: 1,
    privileges: ['基本服务'],
  },
  {
    level: 'silver',
    name: '银卡会员',
    openFee: 99,
    rechargeBonus: 0.1,
    serviceDiscount: 0.95,
    privileges: ['优先派单'],
  },
  {
    level: 'gold',
    name: '金卡会员',
    openFee: 299,
    rechargeBonus: 0.25,
    serviceDiscount: 0.9,
    privileges: ['专属客服', '优先派单'],
  },
  {
    level: 'diamond',
    name: '钻石会员',
    openFee: 599,
    rechargeBonus: 0.5,
    serviceDiscount: 0.8,
    privileges: ['极速响应', '专属客服', '优先派单'],
  },
];

export const POSITION_HIERARCHY = {
  店长: { level: 1, children: ['副店长', '财务'] },
  副店长: { level: 2, children: ['客服主管', '考官主管', '运营主管'] },
  客服主管: { level: 3, children: ['客服'] },
  考官主管: { level: 3, children: ['考官'] },
  运营主管: { level: 3, children: ['运营'] },
  打手组长: { level: 3, children: ['打手'] },
};

export const SHIFT_TIMES = {
  morning: { name: '早班', start: '08:00', end: '16:00' },
  afternoon: { name: '中班', start: '16:00', end: '24:00' },
  night: { name: '晚班', start: '24:00', end: '08:00' },
};

export const PERMISSION_LIST: Omit<Permission, 'id' | 'createdAt'>[] = [
  { code: 'dashboard:view', name: '查看控制台', category: 'dashboard' },
  { code: 'order:view', name: '订单查看', category: 'order' },
  { code: 'order:create', name: '订单创建', category: 'order' },
  { code: 'order:edit', name: '订单编辑', category: 'order' },
  { code: 'order:delete', name: '订单删除', category: 'order' },
  { code: 'order:assign', name: '订单分配', category: 'order' },
  { code: 'order:review', name: '订单审核', category: 'order' },
  { code: 'service:view', name: '服务查看', category: 'service' },
  { code: 'service:create', name: '服务创建', category: 'service' },
  { code: 'service:edit', name: '服务编辑', category: 'service' },
  { code: 'service:delete', name: '服务删除', category: 'service' },
  { code: 'player:view', name: '打手查看', category: 'player' },
  { code: 'player:create', name: '打手创建', category: 'player' },
  { code: 'player:edit', name: '打手编辑', category: 'player' },
  { code: 'player:delete', name: '打手删除', category: 'player' },
  { code: 'player:approve', name: '打手审核', category: 'player' },
  { code: 'customer:view', name: '客户查看', category: 'customer' },
  { code: 'customer:create', name: '客户创建', category: 'customer' },
  { code: 'customer:edit', name: '客户编辑', category: 'customer' },
  { code: 'customer:delete', name: '客户删除', category: 'customer' },
  { code: 'member:view', name: '会员查看', category: 'member' },
  { code: 'member:manage', name: '会员管理', category: 'member' },
  { code: 'withdrawal:view', name: '提现查看', category: 'withdrawal' },
  { code: 'withdrawal:approve', name: '提现审核通过', category: 'withdrawal' },
  { code: 'withdrawal:reject', name: '提现审核拒绝', category: 'withdrawal' },
  { code: 'finance:view', name: '财务查看', category: 'finance' },
  { code: 'finance:audit', name: '财务审核', category: 'finance' },
  { code: 'finance:export', name: '财务导出', category: 'finance' },
  { code: 'employee:view', name: '员工查看', category: 'employee' },
  { code: 'employee:manage', name: '员工管理', category: 'employee' },
  { code: 'permission:position', name: '岗位管理', category: 'permission' },
  { code: 'permission:manage', name: '权限配置', category: 'permission' },
  { code: 'handover:view', name: '交接班查看', category: 'handover' },
  { code: 'handover:manage', name: '交接班管理', category: 'handover' },
  { code: 'system:settings', name: '系统设置', category: 'system' },
];

export const ROLE_TEMPLATES = [
  {
    name: '店长',
    code: 'owner',
    permissions: PERMISSION_LIST.map((p) => p.code),
  },
  {
    name: '副店长',
    code: 'deputy',
    permissions: PERMISSION_LIST.map((p) => p.code),
  },
  {
    name: '客服主管',
    code: 'cs_supervisor',
    permissions: [
      'dashboard:view',
      'order:view', 'order:create', 'order:edit', 'order:assign',
      'customer:view', 'customer:create', 'customer:edit',
      'member:view', 'member:manage',
      'handover:view', 'handover:manage',
    ],
  },
  {
    name: '客服',
    code: 'cs',
    permissions: [
      'dashboard:view',
      'order:view', 'order:create',
      'customer:view', 'customer:create', 'customer:edit',
      'member:view', 'member:manage',
      'handover:view', 'handover:manage',
    ],
  },
  {
    name: '运营',
    code: 'operation',
    permissions: [
      'dashboard:view',
      'order:view',
      'customer:view',
      'member:view',
      'finance:view',
      'player:view',
    ],
  },
  {
    name: '财务',
    code: 'finance',
    permissions: [
      'dashboard:view',
      'order:view',
      'customer:view',
      'member:view',
      'finance:view', 'finance:audit', 'finance:export',
      'withdrawal:view', 'withdrawal:approve', 'withdrawal:reject',
    ],
  },
  {
    name: '打手',
    code: 'player',
    permissions: [
      'dashboard:view',
      'order:view',
      'player:view',
    ],
  },
];
