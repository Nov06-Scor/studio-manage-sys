import axios from 'axios';

interface FeishuConfig {
  appId: string;
  appSecret: string;
  baseToken: string;
}

class FeishuService {
  private config: FeishuConfig = {
    appId: '',
    appSecret: '',
    baseToken: '',
  };
  
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async updateConfig(config: Partial<FeishuConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig() {
    return { ...this.config };
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.config.appId || !this.config.appSecret) {
      throw new Error('飞书配置不完整');
    }

    try {
      const response = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
          app_id: this.config.appId,
          app_secret: this.config.appSecret,
        }
      );

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取Token失败');
      }

      this.accessToken = response.data.tenant_access_token;
      this.tokenExpiry = Date.now() + (response.data.expire - 200) * 1000;

      return this.accessToken;
    } catch (error: any) {
      console.error('Failed to get Feishu access token:', error);
      throw new Error('获取飞书Access Token失败');
    }
  }

  async createRecord(
    tableId: string,
    fields: Record<string, any>
  ): Promise<{ recordId: string }> {
    try {
      const token = await this.getAccessToken();
      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.baseToken}/tables/${tableId}/records`;

      const response = await axios.post(
        url,
        {
          fields,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '创建记录失败');
      }

      return { recordId: response.data.data.record_id };
    } catch (error: any) {
      console.error('Failed to create Feishu record:', error);
      throw error;
    }
  }

  async updateRecord(
    tableId: string,
    recordId: string,
    fields: Record<string, any>
  ): Promise<void> {
    try {
      const token = await this.getAccessToken();
      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.baseToken}/tables/${tableId}/records/${recordId}`;

      const response = await axios.put(
        url,
        {
          fields,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '更新记录失败');
      }
    } catch (error: any) {
      console.error('Failed to update Feishu record:', error);
      throw error;
    }
  }

  async getRecord(tableId: string, recordId: string): Promise<Record<string, any>> {
    try {
      const token = await this.getAccessToken();
      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.baseToken}/tables/${tableId}/records/${recordId}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取记录失败');
      }

      return response.data.data.record.fields;
    } catch (error: any) {
      console.error('Failed to get Feishu record:', error);
      throw error;
    }
  }

  async deleteRecord(tableId: string, recordId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.baseToken}/tables/${tableId}/records/${recordId}`;

      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '删除记录失败');
      }
    } catch (error: any) {
      console.error('Failed to delete Feishu record:', error);
      throw error;
    }
  }

  async queryRecords(
    tableId: string,
    filter?: string,
    fields?: string[],
    pageSize: number = 100
  ): Promise<{ records: Array<{ recordId: string; fields: Record<string, any> }> }> {
    try {
      const token = await this.getAccessToken();
      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.baseToken}/tables/${tableId}/records/search`;

      const response = await axios.post(
        url,
        {
          page_size: pageSize,
          ...(filter && { filter }),
          ...(fields && { field_names: fields }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '查询记录失败');
      }

      return {
        records: response.data.data.items.map((item: any) => ({
          recordId: item.record_id,
          fields: item.fields,
        })),
      };
    } catch (error: any) {
      console.error('Failed to query Feishu records:', error);
      throw error;
    }
  }

  async saveOrderToFeishu(order: {
    orderNo: string;
    game: string;
    content: string;
    price: number;
    status: string;
    customerName: string;
    customerPhone: string;
    createdAt: string;
    playerName?: string;
    completionTime?: string;
  }): Promise<string> {
    const fields = {
      订单号: order.orderNo,
      游戏: order.game,
      代练内容: order.content,
      价格: order.price,
      状态: this.getStatusLabel(order.status),
      客户姓名: order.customerName,
      客户电话: order.customerPhone,
      创建时间: order.createdAt,
      打手姓名: order.playerName || '-',
      完成时间: order.completionTime || '-',
    };

    const result = await this.createRecord('tblOrders', fields);
    return result.recordId;
  }

  async saveCustomerToFeishu(customer: {
    customerName: string;
    phone: string;
    email?: string;
    totalOrders: number;
    totalSpent: number;
    createdAt: string;
  }): Promise<string> {
    const fields = {
      客户姓名: customer.customerName,
      联系电话: customer.phone,
      邮箱: customer.email || '-',
      订单总数: customer.totalOrders,
      消费总额: customer.totalSpent,
      创建时间: customer.createdAt,
    };

    const result = await this.createRecord('tblCustomers', fields);
    return result.recordId;
  }

  async savePlayerToFeishu(player: {
    playerName: string;
    playerId: string;
    type: string;
    creditScore: number;
    balance: number;
    status: string;
    createdAt: string;
  }): Promise<string> {
    const fields = {
      打手姓名: player.playerName,
      打手ID: player.playerId,
      类型: this.getPlayerTypeLabel(player.type),
      信誉分: player.creditScore,
      余额: player.balance,
      状态: player.status === 'online' ? '在线' : player.status === 'busy' ? '忙碌' : '离线',
      创建时间: player.createdAt,
    };

    const result = await this.createRecord('tblPlayers', fields);
    return result.recordId;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: '待审核',
      verified: '已审核',
      published: '已发布',
      assigned: '已分配',
      in_progress: '进行中',
      completed: '已完成',
      cancelled: '已取消',
      disputed: '争议中',
    };
    return labels[status] || status;
  }

  private getPlayerTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      star: '明星打手',
      demon: '魔王打手',
      tech: '技术打手',
      entertainment: '娱乐打手',
    };
    return labels[type] || type;
  }
}

export default new FeishuService();
