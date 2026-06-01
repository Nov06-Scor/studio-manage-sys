export type UserRole = 'admin' | 'manager' | 'deputy' | 'customer_service' | 'player' | 'finance';

export type OrderStatus = 'pending' | 'verified' | 'published' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export type PlayerStatus = 'online' | 'offline' | 'busy';

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface User {
  id: string;
  username: string;
  name?: string;
  role: UserRole;
  permissions: string[];
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'banned';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  positionId?: string;
  positionName?: string;
}

export interface Player {
  id: string;
  userId: string;
  playerName: string;
  playerId: string;
  type: 'star' | 'demon' | 'tech' | 'entertainment';
  creditScore: number;
  balance: number;
  totalEarnings: number;
  orderCount: number;
  completedCount: number;
  failedCount: number;
  completionRate: number;
  rating: number;
  status: PlayerStatus;
  shareRatio: number;
  wecomUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  userId?: string;
  customerName: string;
  phone?: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  playerId?: string;
  playerIds?: string[];
  game: string;
  content: string;
  requirements?: string;
  price: number;
  actualPrice?: number;
  status: OrderStatus;
  playerShareRatio: number;
  completionTime?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  requiredPlayersCount?: 1 | 2;
  assignedBy?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  player?: Player;
  players?: Player[];
}

export interface OrderLog {
  id: string;
  orderId: string;
  action: string;
  operatorId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  type: 'income' | 'payout';
  amount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  playerId: string;
  amount: number;
  fee: number;
  actualAmount: number;
  status: WithdrawalStatus;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  player?: Player;
}

export interface Performance {
  id: string;
  playerId: string;
  recordDate: string;
  ordersCompleted: number;
  ordersFailed: number;
  earnings: number;
  rating: number;
  avgCompletionHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  orderId: string;
  customerId: string;
  playerId?: string;
  rating: number;
  comment?: string;
  images?: string[];
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activePlayers: number;
  pendingWithdrawals: number;
  recentOrders: Order[];
}

// 会员等级
export type MemberLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// 会员状态
export type MemberStatus = 'active' | 'inactive' | 'frozen';

// 会员信息
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
  status: MemberStatus;
  birthday?: string;
  createdAt: string;
  updatedAt: string;
}

// 储值记录
export interface Recharge {
  id: string;
  memberId: string;
  amount: number;
  bonus: number;
  actualAmount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  operatorId: string;
  createdAt: string;
  completedAt?: string;
  member?: Member;
}

// 部门
export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  parentId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 岗位
export interface Position {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  level: number;
  status: 'active' | 'inactive';
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

// 员工状态
export type EmployeeStatus = 'active' | 'inactive' | 'leave' | 'vacation';

// 员工信息
export interface Employee {
  id: string;
  employeeNo: string;
  name: string;
  phone: string;
  email?: string;
  username?: string;
  positionId: string;
  departmentId: string;
  status: EmployeeStatus;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
  position?: Position;
  department?: Department;
}

// 权限分类
export type PermissionCategory = 'dashboard' | 'order' | 'service' | 'player' | 'customer' | 'member' | 'withdrawal' | 'finance' | 'employee' | 'permission' | 'handover' | 'system';

// 权限项
export interface Permission {
  id: string;
  name: string;
  code: string;
  category: PermissionCategory;
  description?: string;
  createdAt: string;
}

// 岗位权限
export interface PositionPermission {
  id: string;
  positionId: string;
  permissionId: string;
  createdAt: string;
  permission?: Permission;
}

// 交接班类型
export type ShiftType = 'morning' | 'afternoon' | 'night' | 'custom';

// 交接班状态
export type HandoverStatus = 'pending' | 'confirmed' | 'cancelled';

// 交接订单
export interface HandoverOrder {
  orderId: string;
  orderNo: string;
  customerName: string;
  status: string;
  notes?: string;
}

// 交接消息
export interface HandoverMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  senderId: string;
  senderName: string;
  createdAt: string;
}

// 交接班记录
export interface Handover {
  id: string;
  handoverNo: string;
  shiftType: ShiftType;
  handoverUserId: string;
  receiverUserId: string;
  status: HandoverStatus;
  orders: HandoverOrder[];
  messages: HandoverMessage[];
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
  handoverUser?: Employee;
  receiverUser?: Employee;
}

// 游戏类型
export type GameType = 'pc' | 'mobile';

// 服务内容
export interface ServiceContent {
  id: string;
  name: string;
  gameType: GameType;
  basePrice: number;
  baseHafCoins: number;
  description?: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 订单扩展字段
export interface OrderExtended {
  id: string;
  orderNo: string;
  daySequence: number;
  customerId: string;
  playerId?: string;
  gameType: GameType;
  game: string;
  gameAccount?: string;
  accountPassword?: string;
  serviceContentId?: string;
  serviceContentName?: string;
  content: string;
  requirements?: string;
  price: number;
  originalPrice?: number;
  hafCoins: number;
  originalHafCoins?: number;
  status: OrderStatus;
  playerShareRatio: number;
  deadline?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  priority: OrderPriority;
  assignedBy?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  player?: Player;
  serviceContent?: ServiceContent;
}
