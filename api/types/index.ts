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
  password?: string;
  role: UserRole;
  permissions: string[];
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'banned';
  lastLogin?: string;
  positionId?: string;
  positionName?: string;
  createdAt: string;
  updatedAt: string;
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
  notes?: string;
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
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
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
  method?: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
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

export interface WeComConfig {
  corpId: string;
  agentId: string;
  agentSecret: string;
  groupChatId: string;
  callbackToken?: string;
  encodingAesKey?: string;
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

export type GameType = 'pc' | 'mobile';

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
