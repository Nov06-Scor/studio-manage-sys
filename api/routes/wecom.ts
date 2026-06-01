import { Router, Request, Response } from 'express';
import wecomService from '../services/wecom';
import { mockWeComConfig } from '../data/mockData';
import { ApiResponse } from '../types';

const router = Router();

router.get('/config', (req: Request, res: Response) => {
  try {
    const config = wecomService.getConfig();
    const safeConfig = { ...config };
    if (safeConfig.agentSecret) {
      safeConfig.agentSecret = '********';
    }

    const response: ApiResponse = {
      success: true,
      data: safeConfig,
    };

    res.json(response);
  } catch (error) {
    console.error('Get WeCom config error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取企业微信配置失败',
    };
    res.status(500).json(response);
  }
});

router.put('/config', (req: Request, res: Response) => {
  try {
    const {
      wecomCorpId,
      wecomAgentId,
      wecomAgentSecret,
      wecomGroupChatId,
      wecomCallbackToken,
      wecomEncodingAesKey,
      messagePushType,
      webhookUrl,
    } = req.body;

    wecomService.updateConfig({
      corpId: wecomCorpId,
      agentId: wecomAgentId,
      agentSecret: wecomAgentSecret,
      groupChatId: wecomGroupChatId,
      callbackToken: wecomCallbackToken,
      encodingAesKey: wecomEncodingAesKey,
      messagePushType,
      webhookUrl,
    });

    const response: ApiResponse = {
      success: true,
      message: '配置保存成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update WeCom config error:', error);
    const response: ApiResponse = {
      success: false,
      message: '保存配置失败',
    };
    res.status(500).json(response);
  }
});

router.post('/test-message', async (req: Request, res: Response) => {
  try {
    const testOrder = {
      orderNo: 'TEST' + Date.now(),
      game: '测试游戏',
      content: '测试代练服务',
      price: 100,
      deadline: new Date(Date.now() + 86400000).toISOString(),
      requirements: '测试消息',
    };

    const result = await wecomService.sendOrderToGroup(testOrder);

    const response: ApiResponse = {
      success: result,
      message: result ? '测试消息发送成功' : '测试消息发送失败',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Send test message error:', error);
    const response: ApiResponse = {
      success: false,
      message: error.message || '测试消息发送失败，请检查配置',
    };
    res.status(500).json(response);
  }
});

router.post('/send', async (req: Request, res: Response) => {
  try {
    const { msgType, content, mentionedList } = req.body;

    await wecomService.sendMessage(msgType, content, mentionedList);

    const response: ApiResponse = {
      success: true,
      message: '消息发送成功',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Send WeCom message error:', error);
    const response: ApiResponse = {
      success: false,
      message: error.message || '发送消息失败',
    };
    res.status(500).json(response);
  }
});

router.post('/webhook', (req: Request, res: Response) => {
  try {
    const { msgType, content, fromUser } = req.body;

    if (msgType === 'text') {
      const parsed = wecomService.parseOrderTakingMessage(content);

      if (parsed) {
        console.log(`Player ${parsed.playerId} is trying to take an order`);
      }
    }

    res.json({ errcode: 0, errmsg: 'ok' });
  } catch (error) {
    console.error('WeCom webhook error:', error);
    res.json({ errcode: 0, errmsg: 'ok' });
  }
});

export default router;
