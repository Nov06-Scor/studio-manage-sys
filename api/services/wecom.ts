import axios from 'axios';
import { mockWeComConfig } from '../data/mockData';

class WeComService {
  private config = mockWeComConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async updateConfig(config: Partial<typeof mockWeComConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig() {
    return { ...this.config };
  }

  async sendWebhookMessage(content: string, mentionedList?: string[]): Promise<boolean> {
    if (!this.config.webhookUrl) {
      throw new Error('Webhook配置不完整');
    }

    try {
      const messageData = {
        msgtype: 'text',
        text: {
          content,
          mentioned_list: mentionedList || [],
        },
      };

      const response = await axios.post(this.config.webhookUrl, messageData);

      if (response.data.errcode !== 0) {
        throw new Error(response.data.errmsg);
      }

      return true;
    } catch (error: any) {
      console.error('Failed to send webhook message:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.config.corpId || !this.config.agentId || !this.config.agentSecret) {
      throw new Error('企业微信配置不完整');
    }

    try {
      const response = await axios.get(
        'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
        {
          params: {
            corpid: this.config.corpId,
            corpsecret: this.config.agentSecret,
          },
        }
      );

      if (response.data.errcode !== 0) {
        throw new Error(response.data.errmsg);
      }

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 200) * 1000;

      return this.accessToken;
    } catch (error: any) {
      console.error('Failed to get access token:', error);
      throw new Error('获取Access Token失败');
    }
  }

  async sendMessage(
    msgType: 'text' | 'markdown' | 'image',
    content: string,
    mentionedList?: string[]
  ): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`;

      const messageData: any = {
        touser: mentionedList?.length ? mentionedList.join('|') : '@all',
        msgtype: msgType,
        agentid: this.config.agentId,
      };

      if (msgType === 'text') {
        messageData.text = { content };
      } else if (msgType === 'markdown') {
        messageData.markdown = { content };
      } else if (msgType === 'image') {
        messageData.image = { media_id: content };
      }

      const response = await axios.post(url, messageData);

      if (response.data.errcode !== 0) {
        throw new Error(response.data.errmsg);
      }

      return true;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async sendOrderToGroup(order: {
    orderNo: string;
    game: string;
    content: string;
    price: number;
    completionTime?: string;
    requirements?: string;
  }): Promise<boolean> {
    const message = `【新代练单】
游戏：${order.game}
内容：${order.content}
价格：¥${order.price}
完成时间：${order.completionTime ? new Date(order.completionTime).toLocaleString() : '待定'}
特殊要求：${order.requirements || '无'}
订单号：${order.orderNo}
回复"接单+ID"即可抢单！`;

    if (this.config.messagePushType === 'webhook') {
      return this.sendWebhookMessage(message, ['@all']);
    } else {
      return this.sendMessage('text', message);
    }
  }

  async sendOrderAssignmentNotification(
    order: {
      orderNo: string;
      game: string;
      content: string;
    },
    player: {
      playerName: string;
      playerId: string;
    }
  ): Promise<boolean> {
    const message = `✅ 接单成功！
订单：${order.orderNo}
游戏：${order.game}
内容：${order.content}
打手：${player.playerName} (${player.playerId})
请开始执行代练任务！`;

    return this.sendMessage('text', message);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  parseOrderTakingMessage(message: string): { playerId: string } | null {
    const pattern = /^接单[+]?(\w+)$/;
    const match = message.match(pattern);

    if (match) {
      return { playerId: match[1] };
    }

    return null;
  }
}

export default new WeComService();
