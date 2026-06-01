/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import orderRoutes from './routes/orders.js'
import playerRoutes from './routes/players.js'
import customerRoutes from './routes/customers.js'
import financeRoutes from './routes/finance.js'
import wecomRoutes from './routes/wecom.js'
import dashboardRoutes from './routes/dashboard.js'
import memberRoutes from './routes/members.js'
import employeeRoutes from './routes/employees.js'
import handoffRoutes from './routes/handoffs.js'
import serviceRoutes from './routes/services.js'
import { mockEmployees, mockPositions, mockPermissions } from './data/advancedMockData.js'
import { mockUsers, PERMISSION_CODES } from './data/mockData.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/players', playerRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/wecom', wecomRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/handoffs', handoffRoutes)
app.use('/api/services', serviceRoutes)

// 系统初始化API
app.post('/api/system/initialize', (req: Request, res: Response) => {
  try {
    // 同步所有用户权限
    mockEmployees.forEach(employee => {
      if (employee.username) {
        const userIndex = mockUsers.findIndex(u => u.username === employee.username);
        if (userIndex !== -1) {
          const position = mockPositions.find(p => p.id === employee.positionId);
          if (position) {
            const positionPermissions = mockPermissions
              .filter(p => position.permissions?.includes(p.id))
              .map(p => p.code);
            
            mockUsers[userIndex] = {
              ...mockUsers[userIndex],
              permissions: positionPermissions,
              role: positionPermissions.includes('permission:manage') ? 'admin' : 'customer_service',
              updatedAt: new Date().toISOString(),
            };
          }
        }
      }
    });

    res.json({
      success: true,
      message: '系统初始化完成，权限已同步',
      data: {
        userCount: mockUsers.length,
        employeeCount: mockEmployees.length,
      }
    });
  } catch (error) {
    console.error('Initialize error:', error);
    res.status(500).json({
      success: false,
      message: '初始化失败',
    });
  }
});

// 获取权限配置详情
app.get('/api/system/permissions', (req: Request, res: Response) => {
  try {
    const permissionsWithPositions = mockPermissions.map(perm => {
      const positions = mockPositions.filter(p => p.permissions?.includes(perm.id));
      return {
        ...perm,
        positions: positions.map(p => ({ id: p.id, name: p.name })),
      };
    });

    res.json({
      success: true,
      data: {
        permissions: permissionsWithPositions,
        roles: [
          { id: 'admin', name: '管理员', description: '拥有所有权限' },
          { id: 'customer_service', name: '客服', description: '客服角色' },
          { id: 'player', name: '打手', description: '打手角色' },
          { id: 'finance', name: '财务', description: '财务角色' },
        ],
        permissionCodes: PERMISSION_CODES,
      }
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: '获取权限配置失败',
    });
  }
});

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
