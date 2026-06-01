import express from 'express';
import feishuService from '../services/feishu';

const router = express.Router();

router.get('/config', (req, res) => {
  const config = feishuService.getConfig();
  res.json({
    success: true,
    data: {
      appId: config.appId ? '******' : '',
      appSecret: config.appSecret ? '******' : '',
      baseToken: config.baseToken ? '******' : '',
      configured: !!(config.appId && config.appSecret && config.baseToken),
    },
  });
});

router.post('/config', (req, res) => {
  try {
    const { appId, appSecret, baseToken } = req.body;
    feishuService.updateConfig({ appId, appSecret, baseToken });
    res.json({ success: true, message: '飞书配置已更新' });
  } catch (error) {
    res.status(500).json({ success: false, message: '配置更新失败' });
  }
});

router.post('/test', async (req, res) => {
  try {
    const success = await feishuService.testConnection();
    if (success) {
      res.json({ success: true, message: '飞书连接测试成功' });
    } else {
      res.json({ success: false, message: '飞书连接测试失败' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/order', async (req, res) => {
  try {
    const { order } = req.body;
    const recordId = await feishuService.saveOrderToFeishu(order);
    res.json({ success: true, message: '订单已同步到飞书', data: { recordId } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/customer', async (req, res) => {
  try {
    const { customer } = req.body;
    const recordId = await feishuService.saveCustomerToFeishu(customer);
    res.json({ success: true, message: '客户已同步到飞书', data: { recordId } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/player', async (req, res) => {
  try {
    const { player } = req.body;
    const recordId = await feishuService.savePlayerToFeishu(player);
    res.json({ success: true, message: '打手已同步到飞书', data: { recordId } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const result = await feishuService.queryRecords('tblOrders');
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
