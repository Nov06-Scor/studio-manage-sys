-- 初始化 Supabase 数据库表
-- 在 Supabase Dashboard 的 SQL Editor 中运行此脚本
-- 链接: https://supabase.com/dashboard/project/zuidiahuriqdqtwvfo/sql/new

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'customer_service',
  permissions TEXT[],
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  position_id TEXT,
  position_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  game TEXT NOT NULL,
  content TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  required_players_count INTEGER DEFAULT 1,
  player_ids TEXT[],
  progress INTEGER DEFAULT 0,
  completion_time TIMESTAMP,
  requirements TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 打手表
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  player_name TEXT NOT NULL,
  player_id TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'tech',
  credit_score INTEGER DEFAULT 100,
  balance DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'online',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 提现表
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  bank_account TEXT,
  bank_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 支付表
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT DEFAULT 'wechat',
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 授权 anon 角色访问表（重要！）
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 完成！
SELECT '数据库表初始化成功！' AS message;
