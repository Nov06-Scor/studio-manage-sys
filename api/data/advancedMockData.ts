import {
  Member,
  Recharge,
  Consumption,
  Employee,
  Department,
  Position,
  Role,
  Permission,
  Handover,
  OrderProof,
  OrderReview,
  MEMBER_LEVEL_CONFIG,
  ROLE_TEMPLATES,
  PERMISSION_LIST,
} from '../types/advanced';

export const mockMembers: Member[] = [
  {
    id: '1',
    memberNo: 'MB202401001',
    memberName: '王老板',
    phone: '13900139000',
    email: 'wang@example.com',
    level: 'diamond',
    balance: 2500.00,
    totalConsumed: 8500.00,
    totalRecharged: 12000.00,
    totalOrders: 15,
    status: 'active',
    birthday: '1990-05-15',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    memberNo: 'MB202401002',
    memberName: '李总',
    phone: '13700137000',
    email: 'li@example.com',
    level: 'gold',
    balance: 1200.00,
    totalConsumed: 3000.00,
    totalRecharged: 4500.00,
    totalOrders: 8,
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: '3',
    memberNo: 'MB202401003',
    memberName: '张小姐',
    phone: '13600136000',
    level: 'silver',
    balance: 500.00,
    totalConsumed: 800.00,
    totalRecharged: 1500.00,
    totalOrders: 5,
    status: 'active',
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
  },
];

export const mockRecharges: Recharge[] = [
  {
    id: '1',
    memberId: '1',
    amount: 1000.00,
    bonus: 500.00,
    actualAmount: 1000.00,
    paymentMethod: 'wechat',
    transactionId: 'wx_trans_001',
    status: 'completed',
    operatorId: '1',
    createdAt: '2024-01-10T10:00:00Z',
    completedAt: '2024-01-10T10:01:00Z',
  },
  {
    id: '2',
    memberId: '2',
    amount: 500.00,
    bonus: 125.00,
    actualAmount: 500.00,
    paymentMethod: 'alipay',
    transactionId: 'ali_trans_001',
    status: 'completed',
    operatorId: '1',
    createdAt: '2024-01-12T14:30:00Z',
    completedAt: '2024-01-12T14:31:00Z',
  },
];

export const mockConsumptions: Consumption[] = [
  {
    id: '1',
    memberId: '1',
    orderId: '4',
    amount: 1500.00,
    balanceBefore: 4000.00,
    balanceAfter: 2500.00,
    type: 'order',
    createdAt: '2024-01-13T16:30:00Z',
  },
];

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: '管理部',
    code: 'MANAGE',
    managerId: '1',
    description: '负责工作室整体管理',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '客服部',
    code: 'CS',
    parentId: '1',
    managerId: '2',
    description: '客户接待与订单处理',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: '审核部',
    code: 'QC',
    parentId: '1',
    managerId: '3',
    description: '订单审核与质量把控',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: '运营部',
    code: 'OPS',
    parentId: '1',
    managerId: '4',
    description: '日常运营与数据分析',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: '打手团队',
    code: 'PLAYER',
    parentId: '1',
    description: '代练执行团队',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: '财务部',
    code: 'FIN',
    parentId: '1',
    managerId: '5',
    description: '财务管理与账务核对',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockPositions: Position[] = [
  { id: '1', name: '店长', code: 'OWNER', departmentId: '1', level: 1, description: '全面管理', status: 'active', permissions: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: '副店长', code: 'DEPUTY', departmentId: '1', level: 2, description: '协助管理', status: 'active', permissions: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '3', name: '客服主管', code: 'CS_SUP', departmentId: '2', level: 3, description: '客服团队管理', status: 'active', permissions: ['1','2','3','4','6','17','18','19','21','22','33','34'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '4', name: '客服', code: 'CS', departmentId: '2', level: 4, description: '客户接待', status: 'active', permissions: ['1','2','3','17','18','19','21','22','33','34'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '5', name: '考官主管', code: 'QC_SUP', departmentId: '3', level: 3, description: '审核团队管理', status: 'active', permissions: ['1','2','7','12'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '6', name: '考官', code: 'QC', departmentId: '3', level: 4, description: '订单审核', status: 'active', permissions: ['1','2','7'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '7', name: '运营主管', code: 'OPS_SUP', departmentId: '4', level: 3, description: '运营管理', status: 'active', permissions: ['1','2','8','9','10','11','12','17','21','26'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '8', name: '运营', code: 'OPS', departmentId: '4', level: 4, description: '日常运营', status: 'active', permissions: ['1','2','8','12','17','21','26'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '9', name: '打手组长', code: 'PLAYER_LEAD', departmentId: '5', level: 3, description: '打手团队管理', status: 'active', permissions: ['1','2','12','13','14','16'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '10', name: '打手', code: 'PLAYER', departmentId: '5', level: 4, description: '代练执行', status: 'active', permissions: ['1','2','12'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '11', name: '财务', code: 'FIN', departmentId: '6', level: 3, description: '财务管理', status: 'active', permissions: ['1','2','17','21','23','24','25','26','27','28'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

export const mockEmployees: Employee[] = [
  { id: '1', employeeNo: 'EMP001', name: '张三', phone: '13800001001', email: 'zhangsan@example.com', username: 'manager', positionId: '1', departmentId: '1', status: 'active', hireDate: '2023-01-01', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: '2', employeeNo: 'EMP002', name: '李四', phone: '13800001002', username: 'deputy', positionId: '2', departmentId: '1', status: 'active', hireDate: '2023-03-01', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: '3', employeeNo: 'EMP003', name: '王芳', phone: '13800001003', email: 'wangfang@example.com', username: 'cs_sup', positionId: '3', departmentId: '2', status: 'active', hireDate: '2023-05-01', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: '4', employeeNo: 'EMP004', name: '赵敏', phone: '13800001004', email: 'zhaomin@example.com', username: 'cs', positionId: '4', departmentId: '2', status: 'active', hireDate: '2023-07-01', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: '5', employeeNo: 'EMP005', name: '钱伟', phone: '13800001005', username: 'finance', positionId: '11', departmentId: '6', status: 'active', hireDate: '2023-09-01', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
];

export const mockPermissions: Permission[] = PERMISSION_LIST.map((p, index) => ({
  ...p,
  id: String(index + 1),
  createdAt: '2024-01-01T00:00:00Z',
}));

export const mockRoles: Role[] = ROLE_TEMPLATES.map((template, index) => ({
  id: String(index + 1),
  name: template.name,
  code: template.code,
  description: `${template.name}角色`,
  permissions: template.permissions,
  isSystem: template.code === 'owner',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}));

export const mockHandoffs: Handover[] = [
  {
    id: '1',
    handoverNo: 'HB-20240115-001',
    shiftType: 'afternoon',
    handoverUserId: '4',
    receiverUserId: '5',
    status: 'completed',
    orders: [
      {
        orderId: '1',
        orderNo: 'ORD20240115001',
        customerName: '王老板',
        status: 'in_progress',
        progress: 65,
        note: '专家→荣耀段位，预计2小时完成',
      },
      {
        orderId: '2',
        orderNo: 'ORD20240115002',
        customerName: '李总',
        status: 'pending_review',
        note: '凭证已提交，待审核',
      },
    ],
    messages: [
      {
        content: '王老板询问进度',
        type: 'pending_reply',
        customerName: '王老板',
        status: 'pending',
      },
    ],
    notes: '赵总VIP客户，优先处理',
    createdAt: '2024-01-15T15:55:00Z',
    confirmedAt: '2024-01-15T16:05:00Z',
  },
];

export const mockOrderProofs = [
  {
    id: '1',
    orderId: '4',
    type: 'screenshot' as const,
    url: '/uploads/proof_1.png',
    description: '段位对比截图',
    uploadedBy: '1',
    createdAt: '2024-01-13T15:30:00Z',
  },
];

export const mockOrderReviews = [
  {
    id: '1',
    orderId: '4',
    reviewerId: '3',
    result: 'approved' as const,
    comment: '段位达标，审核通过',
    createdAt: '2024-01-13T16:00:00Z',
  },
];
