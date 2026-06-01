import express from 'express';
import supabaseService from '../services/supabase';
import { mockUsers, mockOrders, mockPlayers, mockCustomers, mockWithdrawals, mockPayments } from '../data/mockData';

const router = express.Router();

router.get('/config', (req, res) => {
  const config = supabaseService.getConfig();
  res.json({ success: true, data: config });
});

router.post('/config', (req, res) => {
  try {
    const { url, key } = req.body;
    supabaseService.setConfig({ url, key });
    res.json({ success: true, message: 'Supabase配置已更新' });
  } catch (error) {
    res.status(500).json({ success: false, message: '配置更新失败' });
  }
});

router.post('/test', async (req, res) => {
  try {
    const result = await supabaseService.testConnection();
    if (result.success) {
      res.json({ success: true, message: 'Supabase连接测试成功' });
    } else {
      res.json({ success: false, message: 'Supabase连接测试失败', error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/initialize', async (req, res) => {
  try {
    await supabaseService.initializeTables();
    res.json({ success: true, message: 'Supabase表初始化完成' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/all', async (req, res) => {
  try {
    await supabaseService.syncAllData(
      mockUsers,
      mockOrders,
      mockPlayers,
      mockCustomers,
      mockWithdrawals,
      mockPayments
    );
    res.json({
      success: true,
      message: '所有数据已同步到Supabase',
      data: {
        users: mockUsers.length,
        orders: mockOrders.length,
        players: mockPlayers.length,
        customers: mockCustomers.length,
        withdrawals: mockWithdrawals.length,
        payments: mockPayments.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/users', async (req, res) => {
  try {
    for (const user of mockUsers) {
      await supabaseService.saveUser(user);
    }
    res.json({ success: true, message: `已同步 ${mockUsers.length} 个用户` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/orders', async (req, res) => {
  try {
    for (const order of mockOrders) {
      await supabaseService.saveOrder(order);
    }
    res.json({ success: true, message: `已同步 ${mockOrders.length} 个订单` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/players', async (req, res) => {
  try {
    for (const player of mockPlayers) {
      await supabaseService.savePlayer(player);
    }
    res.json({ success: true, message: `已同步 ${mockPlayers.length} 个打手` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/customers', async (req, res) => {
  try {
    for (const customer of mockCustomers) {
      await supabaseService.saveCustomer(customer);
    }
    res.json({ success: true, message: `已同步 ${mockCustomers.length} 个客户` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await supabaseService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await supabaseService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/players', async (req, res) => {
  try {
    const players = await supabaseService.getAllPlayers();
    res.json({ success: true, data: players });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const customers = await supabaseService.getAllCustomers();
    res.json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
