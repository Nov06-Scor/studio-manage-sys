import { useState } from 'react';
import { useAuthStore, useNotificationStore } from '../store';
import { authApi } from '../api';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const { addNotification } = useNotificationStore();
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.oldPassword) {
      newErrors.oldPassword = '请输入原密码';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = '密码长度至少为6位';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    
    setLoading(true);
    try {
      const response = await authApi.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (response.success) {
        addNotification('success', '密码修改成功，请重新登录');
        logout();
      } else {
        addNotification('error', response.message || '密码修改失败');
      }
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || '密码修改失败');
    } finally {
      setLoading(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">请先登录</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
        <p className="text-gray-600 mt-1">管理您的账户信息</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-600">用户名</span>
            <span className="font-medium text-gray-900">{user.username}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-600">角色</span>
            <span className="font-medium text-gray-900">
              {user.role === 'admin' ? '超级管理员' : '普通用户'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-600">邮箱</span>
            <span className="font-medium text-gray-900">{user.email || '未设置'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">手机号</span>
            <span className="font-medium text-gray-900">{user.phone || '未设置'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">安全设置</h2>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {showChangePassword ? '取消' : '修改密码'}
          </button>
        </div>

        {showChangePassword && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">原密码 <span className="text-red-500">*</span></label>
              <input
                type="password"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.oldPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                placeholder="请输入原密码"
              />
              {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码 <span className="text-red-500">*</span></label>
              <input
                type="password"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="请输入新密码（至少6位）"
              />
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认密码 <span className="text-red-500">*</span></label>
              <input
                type="password"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="请再次输入新密码"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '修改中...' : '确认修改'}
              </button>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setErrors({});
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}