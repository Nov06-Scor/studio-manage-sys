import { useState, useEffect } from 'react';
import { Save, TestTube, CheckCircle, Plus, Trash2, Copy, RefreshCw } from 'lucide-react';
import { wecomApi } from '../api';
import { useNotificationStore } from '../store';

type MessagePushType = 'wecom_app' | 'webhook';
type MessageTemplateType = 'order_published' | 'order_accepted' | 'order_completed' | 'order_overdue';

interface MessageTemplate {
  type: MessageTemplateType;
  name: string;
  description: string;
  content: string;
  variables: string[];
}

const defaultTemplates: MessageTemplate[] = [
  {
    type: 'order_published',
    name: '派单通知',
    description: '客服发布新订单时推送给打手群',
    content: '【新代练单】\n游戏：{game}\n内容：{content}\n价格：¥{price}\n截止：{deadline}\n特殊要求：{requirements}\n订单号：{orderNo}\n回复"接单+ID"即可抢单！',
    variables: ['game', 'content', 'price', 'deadline', 'requirements', 'orderNo'],
  },
  {
    type: 'order_accepted',
    name: '接单成功',
    description: '打手接单后通知客服',
    content: '✅ 接单成功！\n订单：{orderNo}\n游戏：{game}\n内容：{content}\n打手：{playerName}\n联系方式：{playerPhone}\n请开始执行代练任务！',
    variables: ['orderNo', 'game', 'content', 'playerName', 'playerPhone'],
  },
  {
    type: 'order_completed',
    name: '订单完成',
    description: '打手完成订单后通知客服',
    content: '🎉 订单完成！\n订单号：{orderNo}\n游戏：{game}\n打手：{playerName}\n完成时间：{completedAt}\n请及时验收！',
    variables: ['orderNo', 'game', 'playerName', 'completedAt'],
  },
  {
    type: 'order_overdue',
    name: '订单逾期',
    description: '订单逾期提醒',
    content: '⚠️ 订单逾期提醒！\n订单号：{orderNo}\n游戏：{game}\n打手：{playerName}\n原截止时间：{deadline}\n请及时处理！',
    variables: ['orderNo', 'game', 'playerName', 'deadline'],
  },
];

export default function SystemSettings() {
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [pushType, setPushType] = useState<MessagePushType>('wecom_app');
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates);
  const [activeTemplate, setActiveTemplate] = useState<MessageTemplateType>('order_published');
  const [previewContent, setPreviewContent] = useState('');

  const [wecomConfig, setWecomConfig] = useState({
    wecomCorpId: '',
    wecomAgentId: '',
    wecomAgentSecret: '',
    wecomGroupChatId: '',
  });

  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    const template = templates.find(t => t.type === activeTemplate);
    if (template) {
      const preview = template.content
        .replace('{game}', '王者荣耀')
        .replace('{content}', '钻石→星耀代练')
        .replace('{price}', '500')
        .replace('{deadline}', new Date(Date.now() + 86400000).toLocaleString())
        .replace('{requirements}', '需要全程直播')
        .replace('{orderNo}', 'ORD20240101001')
        .replace('{playerName}', '张三')
        .replace('{playerPhone}', '13800138000')
        .replace('{completedAt}', new Date().toLocaleString());
      setPreviewContent(preview);
    }
  }, [activeTemplate, templates]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await wecomApi.getConfig();
      if (response.success && response.data) {
        setPushType(response.data.messagePushType || 'wecom_app');
        setWecomConfig({
          wecomCorpId: response.data.wecomCorpId || '',
          wecomAgentId: response.data.wecomAgentId || '',
          wecomAgentSecret: response.data.wecomAgentSecret || '',
          wecomGroupChatId: response.data.wecomGroupChatId || '',
        });
        setWebhookUrl(response.data.webhookUrl || '');
        if (response.data.templates) {
          setTemplates(response.data.templates);
        }
      }
    } catch (error) {
      addNotification('error', '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await wecomApi.updateConfig({
        messagePushType: pushType,
        wecomCorpId: pushType === 'wecom_app' ? wecomConfig.wecomCorpId : '',
        wecomAgentId: pushType === 'wecom_app' ? wecomConfig.wecomAgentId : '',
        wecomAgentSecret: pushType === 'wecom_app' ? wecomConfig.wecomAgentSecret : '',
        wecomGroupChatId: pushType === 'wecom_app' ? wecomConfig.wecomGroupChatId : '',
        webhookUrl: pushType === 'webhook' ? webhookUrl : '',
        templates,
      });
      if (response.success) {
        addNotification('success', '配置保存成功');
      }
    } catch (error) {
      addNotification('error', '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const response = await wecomApi.sendTestMessage();
      if (response.success) {
        addNotification('success', '测试消息发送成功！请检查群消息');
      } else {
        addNotification('error', response.message || '测试消息发送失败');
      }
    } catch (error) {
      addNotification('error', '测试消息发送失败，请检查配置');
    } finally {
      setTesting(false);
    }
  };

  const handleTemplateChange = (content: string) => {
    setTemplates(templates.map(t => 
      t.type === activeTemplate ? { ...t, content } : t
    ));
  };

  const insertVariable = (variable: string) => {
    const template = templates.find(t => t.type === activeTemplate);
    if (template) {
      const newContent = template.content + `{${variable}}`;
      handleTemplateChange(newContent);
    }
  };

  const resetTemplate = () => {
    const defaultTemplate = defaultTemplates.find(t => t.type === activeTemplate);
    if (defaultTemplate) {
      setTemplates(templates.map(t => 
        t.type === activeTemplate ? { ...defaultTemplate } : t
      ));
      addNotification('success', '模板已重置为默认值');
    }
  };

  const currentTemplate = templates.find(t => t.type === activeTemplate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-500 mt-1">配置消息推送和系统参数</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <TestTube size={20} />
            {testing ? '发送中...' : '发送测试消息'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            保存配置
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">消息推送方式</h2>
          <p className="text-sm text-gray-500 mt-1">
            选择客服创建订单后推送消息的方式，两种方式互斥，请根据实际情况选择
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              onClick={() => setPushType('wecom_app')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                pushType === 'wecom_app'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  pushType === 'wecom_app' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {pushType === 'wecom_app' && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">企业微信应用推送</h3>
                  <p className="text-sm text-gray-500">通过企业微信应用向用户推送消息</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setPushType('webhook')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                pushType === 'webhook'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  pushType === 'webhook' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {pushType === 'webhook' && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">群消息Webhook推送</h3>
                  <p className="text-sm text-gray-500">通过群机器人的Webhook接口推送消息</p>
                </div>
              </div>
            </div>
          </div>

          {pushType === 'wecom_app' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📱 企业微信应用配置</h4>
                <p className="text-sm text-blue-700">
                  配置企业微信自建应用信息，用于通过应用向指定用户或群聊推送消息
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    企业ID (CorpID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={wecomConfig.wecomCorpId}
                    onChange={(e) => setWecomConfig({ ...wecomConfig, wecomCorpId: e.target.value })}
                    placeholder="例如: ww1234567890abcdef"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    在"我的企业" {'->'} "企业信息"中获取
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    应用AgentID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={wecomConfig.wecomAgentId}
                    onChange={(e) => setWecomConfig({ ...wecomConfig, wecomAgentId: e.target.value })}
                    placeholder="例如: 1000001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    在"应用管理" {'->'} 应用详情中获取
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    应用Secret <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={wecomConfig.wecomAgentSecret}
                    onChange={(e) => setWecomConfig({ ...wecomConfig, wecomAgentSecret: e.target.value })}
                    placeholder="输入应用Secret"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    在"应用管理" {'->'} 应用详情中获取，请妥善保管
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    派单群聊ID
                  </label>
                  <input
                    type="text"
                    value={wecomConfig.wecomGroupChatId}
                    onChange={(e) => setWecomConfig({ ...wecomConfig, wecomGroupChatId: e.target.value })}
                    placeholder="输入派单群聊ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    用于接收打手接单回调消息
                  </p>
                </div>
              </div>

              </div>
          )}

          {pushType === 'webhook' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">🔗 Webhook配置</h4>
                <p className="text-sm text-green-700">
                  配置群机器人的Webhook地址，用于向企业微信群推送消息
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  直接复制企业微信群机器人的完整Webhook地址（已包含key参数）
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📖 Webhook使用说明</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>设置步骤：</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>在企业微信群中添加"群机器人"</li>
                    <li>设置机器人名称，点击"添加机器人"</li>
                    <li>复制生成的完整Webhook地址</li>
                    <li>粘贴到上方输入框中</li>
                  </ol>
                  <p className="mt-3"><strong>示例：</strong></p>
                  <code className="text-xs bg-white px-2 py-1 rounded">
                    https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=693axxx6-7aoc-4bc4-97a0-0ec2sifa5aaa
                  </code>
                  <p className="mt-3"><strong>支持消息类型：</strong></p>
                  <p>text（文本）、markdown、image（图片）、news（图文）、file（文件）、voice（语音）</p>
                </div>
              </div>

              </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">消息模板配置</h2>
          <p className="text-sm text-gray-500 mt-1">
            为不同类型的消息配置推送模板，支持变量插入，点击变量按钮即可添加
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <h3 className="text-sm font-medium text-gray-700 mb-3">模板类型</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => setActiveTemplate(template.type)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeTemplate === template.type
                        ? 'bg-blue-50 border border-blue-500'
                        : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  编辑模板：{currentTemplate?.name}
                </h3>
                <button
                  onClick={resetTemplate}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  重置为默认
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    插入变量（点击即可添加）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentTemplate?.variables.map((variable) => (
                      <button
                        key={variable}
                        onClick={() => insertVariable(variable)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        {`{${variable}}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    模板内容
                  </label>
                  <textarea
                    rows={6}
                    value={currentTemplate?.content || ''}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="输入消息模板内容"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    支持换行，使用 {'{变量名}'} 格式插入变量
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    消息预览
                  </label>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap min-h-[120px]">
                    {previewContent}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    预览仅供参考，实际推送时会替换为真实数据
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">风险控制设置</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                信誉分预警阈值
              </label>
              <input
                type="number"
                defaultValue={60}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                低于此分数的打手将被限制接单
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                订单逾期提前预警
              </label>
              <input
                type="number"
                defaultValue={24}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                订单逾期前多少小时发送预警
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                打手最大接单数
              </label>
              <input
                type="number"
                defaultValue={3}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                单个打手同时进行的最大订单数
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
