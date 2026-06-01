import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { mockUsers } from '../data/mockData';
import { User, ApiResponse } from '../types';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'delta-boosting-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const response: ApiResponse = {
        success: false,
        message: '请输入用户名和密码',
      };
      return res.status(400).json(response);
    }

    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: '用户名或密码错误',
      };
      return res.status(401).json(response);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;

    const response: ApiResponse<{
      token: string;
      user: User;
    }> = {
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
      message: '登录成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: ApiResponse = {
      success: false,
      message: '服务器错误',
    };
    res.status(500).json(response);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: '退出成功',
  };
  res.json(response);
});

router.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        message: '未授权',
      };
      return res.status(401).json(response);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = mockUsers.find((u) => u.id === decoded.userId);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: '用户不存在',
      };
      return res.status(404).json(response);
    }

    const { password: _, ...userWithoutPassword } = user;

    const response: ApiResponse<User> = {
      success: true,
      data: userWithoutPassword,
    };

    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取用户信息失败',
    };
    res.status(401).json(response);
  }
});

router.post('/change-password', (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        message: '未授权',
      };
      return res.status(401).json(response);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userIndex = mockUsers.findIndex((u) => u.id === decoded.userId);

    if (userIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '用户不存在',
      };
      return res.status(404).json(response);
    }

    const user = mockUsers[userIndex];
    
    if (oldPassword !== user.password) {
      const response: ApiResponse = {
        success: false,
        message: '原密码不正确',
      };
      return res.status(400).json(response);
    }

    if (!newPassword || newPassword.length < 6) {
      const response: ApiResponse = {
        success: false,
        message: '新密码长度至少为6位',
      };
      return res.status(400).json(response);
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      password: newPassword,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      message: '密码修改成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Change password error:', error);
    const response: ApiResponse = {
      success: false,
      message: '密码修改失败',
    };
    res.status(500).json(response);
  }
});

export default router;
