import { Router, Request, Response } from 'express';
import {
  mockEmployees,
  mockDepartments,
  mockPositions,
  mockRoles,
  mockPermissions,
} from '../data/advancedMockData';
import { mockUsers } from '../data/mockData';
import {
  Employee,
  Department,
  Position,
  Role,
  Permission,
} from '../types/advanced';
import { User } from '../types';
import { ApiResponse, PaginatedResponse } from '../types';

// 验证手机号
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 验证邮箱
const validateEmail = (email: string): boolean => {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 生成员工编码
const generateEmployeeNo = (): string => {
  const today = new Date();
  const dateStr = today.getFullYear().toString() + 
    (today.getMonth() + 1).toString().padStart(2, '0') + 
    today.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EMP${dateStr}${random}`;
};

const router = Router();

router.get('/departments', (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let departments = [...mockDepartments];

    if (status) {
      departments = departments.filter((d) => d.status === status);
    }

    const response: ApiResponse<Department[]> = {
      success: true,
      data: departments,
    };

    res.json(response);
  } catch (error) {
    console.error('Get departments error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取部门列表失败',
    };
    res.status(500).json(response);
  }
});

router.post('/departments', (req: Request, res: Response) => {
  try {
    const { name, code, parentId, description } = req.body;

    const newDepartment: Department = {
      id: String(mockDepartments.length + 1),
      name,
      code,
      parentId,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDepartments.push(newDepartment);

    const response: ApiResponse<Department> = {
      success: true,
      data: newDepartment,
      message: '部门创建成功',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create department error:', error);
    const response: ApiResponse = {
      success: false,
      message: '创建部门失败',
    };
    res.status(500).json(response);
  }
});

router.put('/departments/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const departmentIndex = mockDepartments.findIndex((d) => d.id === id);

    if (departmentIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '部门不存在',
      };
      return res.status(404).json(response);
    }

    mockDepartments[departmentIndex] = {
      ...mockDepartments[departmentIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Department> = {
      success: true,
      data: mockDepartments[departmentIndex],
      message: '部门信息更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update department error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新部门信息失败',
    };
    res.status(500).json(response);
  }
});

router.get('/positions', (req: Request, res: Response) => {
  try {
    const { departmentId, status } = req.query;
    let positions = [...mockPositions];

    if (departmentId) {
      positions = positions.filter((p) => p.departmentId === departmentId);
    }

    if (status) {
      positions = positions.filter((p) => p.status === status);
    }

    const response: ApiResponse<Position[]> = {
      success: true,
      data: positions,
    };

    res.json(response);
  } catch (error) {
    console.error('Get positions error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取岗位列表失败',
    };
    res.status(500).json(response);
  }
});

router.post('/positions', (req: Request, res: Response) => {
  try {
    const { name, code, departmentId, level, description, permissions = [] } = req.body;

    const newPosition: Position = {
      id: String(mockPositions.length + 1),
      name,
      code,
      departmentId,
      level,
      description,
      status: 'active',
      permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPositions.push(newPosition);

    const response: ApiResponse<Position> = {
      success: true,
      data: newPosition,
      message: '岗位创建成功',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create position error:', error);
    const response: ApiResponse = {
      success: false,
      message: '创建岗位失败',
    };
    res.status(500).json(response);
  }
});

router.put('/positions/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const positionIndex = mockPositions.findIndex((p) => p.id === id);

    if (positionIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '岗位不存在',
      };
      return res.status(404).json(response);
    }

    mockPositions[positionIndex] = {
      ...mockPositions[positionIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Position> = {
      success: true,
      data: mockPositions[positionIndex],
      message: '岗位信息更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update position error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新岗位信息失败',
    };
    res.status(500).json(response);
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const { departmentId, positionId, status, search, page = 1, pageSize = 10 } = req.query;

    let filteredEmployees = [...mockEmployees];

    if (departmentId) {
      filteredEmployees = filteredEmployees.filter((e) => e.departmentId === departmentId);
    }

    if (positionId) {
      filteredEmployees = filteredEmployees.filter((e) => e.positionId === positionId);
    }

    if (status) {
      filteredEmployees = filteredEmployees.filter((e) => e.status === status);
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredEmployees = filteredEmployees.filter(
        (e) =>
          e.name.toLowerCase().includes(searchLower) ||
          e.phone.includes(search as string) ||
          e.employeeNo.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredEmployees.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = filteredEmployees
      .slice(start, end)
      .map((emp) => ({
        ...emp,
        department: mockDepartments.find((d) => d.id === emp.departmentId),
        position: mockPositions.find((p) => p.id === emp.positionId),
      }));

    const response: ApiResponse<PaginatedResponse<any>> = {
      success: true,
      data: {
        items,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get employees error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取员工列表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = mockEmployees.find((e) => e.id === id);

    if (!employee) {
      const response: ApiResponse = {
        success: false,
        message: '员工不存在',
      };
      return res.status(404).json(response);
    }

    const employeeWithDetails = {
      ...employee,
      department: mockDepartments.find((d) => d.id === employee.departmentId),
      position: mockPositions.find((p) => p.id === employee.positionId),
    };

    const response: ApiResponse = {
      success: true,
      data: employeeWithDetails,
    };

    res.json(response);
  } catch (error) {
    console.error('Get employee error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取员工详情失败',
    };
    res.status(500).json(response);
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      positionId,
      departmentId,
      hireDate,
      employeeNo,
      username,
      password,
    } = req.body;

    // 验证必填字段
    const errors: Record<string, string[]> = {};
    
    if (!name?.trim()) {
      errors.name = ['请输入员工姓名'];
    }
    if (!phone) {
      errors.phone = ['请输入手机号'];
    } else if (!validatePhone(phone)) {
      errors.phone = ['请输入正确的手机号格式（11位数字，以1开头）'];
    }
    if (email && !validateEmail(email)) {
      errors.email = ['请输入正确的邮箱格式'];
    }
    if (!departmentId) {
      errors.departmentId = ['请选择部门'];
    }
    if (!positionId) {
      errors.positionId = ['请选择岗位'];
    }
    if (!username?.trim()) {
      errors.username = ['请输入登录账号'];
    } else {
      const usernameExists = mockUsers.some(u => u.username === username);
      if (usernameExists) {
        errors.username = ['账号已存在'];
      }
    }
    if (!password) {
      errors.password = ['请设置初始密码'];
    } else if (password.length < 3) {
      errors.password = ['密码长度至少为3位'];
    }

    if (Object.keys(errors).length > 0) {
      const response: ApiResponse = {
        success: false,
        message: '验证失败',
        errors,
      };
      return res.status(400).json(response);
    }

    // 验证部门是否存在
    const departmentExists = mockDepartments.find(d => d.id === departmentId);
    if (!departmentExists) {
      const response: ApiResponse = {
        success: false,
        message: '部门不存在',
      };
      return res.status(400).json(response);
    }

    // 验证岗位是否存在且属于该部门
    const positionExists = mockPositions.find(p => p.id === positionId && p.departmentId === departmentId);
    if (!positionExists) {
      const response: ApiResponse = {
        success: false,
        message: '岗位不存在或不属于该部门',
      };
      return res.status(400).json(response);
    }

    // 使用前端提供的员工编码，如果没有则自动生成
    const finalEmployeeNo = employeeNo || generateEmployeeNo();

    // 检查员工编码是否已存在
    const employeeNoExists = mockEmployees.some(e => e.employeeNo === finalEmployeeNo);
    if (employeeNoExists) {
      const response: ApiResponse = {
        success: false,
        message: '员工编码已存在',
      };
      return res.status(400).json(response);
    }

    const newEmployee: Employee = {
      id: String(mockEmployees.length + 1),
      employeeNo: finalEmployeeNo,
      name,
      phone,
      email,
      username,
      positionId,
      departmentId,
      status: 'active',
      hireDate: hireDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 创建用户账号，并继承岗位权限
    const positionPermissions = mockPermissions
      .filter(p => positionExists.permissions?.includes(p.id))
      .map(p => p.code);
    
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      password,
      role: positionPermissions.includes('permission:manage') ? 'admin' : 'customer_service',
      permissions: positionPermissions,
      email,
      phone,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    mockEmployees.push(newEmployee);

    const response: ApiResponse<Employee> = {
      success: true,
      data: newEmployee,
      message: '员工创建成功',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create employee error:', error);
    const response: ApiResponse = {
      success: false,
      message: '创建员工失败',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, positionId, departmentId } = req.body;
    const employeeIndex = mockEmployees.findIndex((e) => e.id === id);

    if (employeeIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '员工不存在',
      };
      return res.status(404).json(response);
    }

    // 验证字段
    const errors: Record<string, string[]> = {};
    
    if (name !== undefined && !name?.trim()) {
      errors.name = ['请输入员工姓名'];
    }
    if (phone !== undefined) {
      if (!phone) {
        errors.phone = ['请输入手机号'];
      } else if (!validatePhone(phone)) {
        errors.phone = ['请输入正确的手机号格式（11位数字，以1开头）'];
      }
    }
    if (email !== undefined && email && !validateEmail(email)) {
      errors.email = ['请输入正确的邮箱格式'];
    }
    if (departmentId !== undefined && !departmentId) {
      errors.departmentId = ['请选择部门'];
    }
    if (positionId !== undefined && !positionId) {
      errors.positionId = ['请选择岗位'];
    }

    if (Object.keys(errors).length > 0) {
      const response: ApiResponse = {
        success: false,
        message: '验证失败',
        errors,
      };
      return res.status(400).json(response);
    }

    // 如果更新了部门，验证部门是否存在
    if (departmentId !== undefined) {
      const departmentExists = mockDepartments.find(d => d.id === departmentId);
      if (!departmentExists) {
        const response: ApiResponse = {
          success: false,
          message: '部门不存在',
        };
        return res.status(400).json(response);
      }
    }

    // 如果更新了岗位，验证岗位是否存在且属于该部门
    let position = null;
    if (positionId !== undefined) {
      const finalDepartmentId = departmentId !== undefined ? departmentId : mockEmployees[employeeIndex].departmentId;
      position = mockPositions.find(p => p.id === positionId && p.departmentId === finalDepartmentId);
      if (!position) {
        const response: ApiResponse = {
          success: false,
          message: '岗位不存在或不属于该部门',
        };
        return res.status(400).json(response);
      }
    }

    // 不允许修改员工编码
    const { employeeNo, ...updateData } = req.body;

    mockEmployees[employeeIndex] = {
      ...mockEmployees[employeeIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // 如果更新了岗位，同步更新用户的权限
    if (positionId !== undefined && position) {
      const employee = mockEmployees[employeeIndex];
      if (employee.username) {
        const userIndex = mockUsers.findIndex(u => u.username === employee.username);
        if (userIndex !== -1) {
          // 从岗位获取权限
          const positionPermissions = mockPermissions
            .filter(p => position.permissions?.includes(p.id))
            .map(p => p.code);
          
          // 更新用户权限
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            permissions: positionPermissions,
            role: positionPermissions.includes('permission:manage') ? 'admin' : 'customer_service',
            updatedAt: new Date().toISOString(),
          };
        }
      }
    }

    const response: ApiResponse<Employee> = {
      success: true,
      data: mockEmployees[employeeIndex],
      message: '员工信息更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update employee error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新员工信息失败',
    };
    res.status(500).json(response);
  }
});

// 刷新用户权限API
router.post('/refresh-permissions', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (userId) {
      // 刷新单个用户权限
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        // 找到对应的员工
        const employee = mockEmployees.find(e => e.username === user.username);
        if (employee) {
          const position = mockPositions.find(p => p.id === employee.positionId);
          if (position) {
            const positionPermissions = mockPermissions
              .filter(p => position.permissions?.includes(p.id))
              .map(p => p.code);
            
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            mockUsers[userIndex] = {
              ...mockUsers[userIndex],
              permissions: positionPermissions,
              updatedAt: new Date().toISOString(),
            };
          }
        }
      }
    } else {
      // 刷新所有用户权限
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
                updatedAt: new Date().toISOString(),
              };
            }
          }
        }
      });
    }

    const response: ApiResponse = {
      success: true,
      message: '权限刷新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Refresh permissions error:', error);
    const response: ApiResponse = {
      success: false,
      message: '刷新权限失败',
    };
    res.status(500).json(response);
  }
});

router.get('/roles', (req: Request, res: Response) => {
  try {
    const response: ApiResponse<Role[]> = {
      success: true,
      data: mockRoles,
    };

    res.json(response);
  } catch (error) {
    console.error('Get roles error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取角色列表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/permissions', (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let permissions = [...mockPermissions];

    if (category) {
      permissions = permissions.filter((p) => p.category === category);
    }

    const response: ApiResponse = {
      success: true,
      data: permissions,
    };

    res.json(response);
  } catch (error) {
    console.error('Get permissions error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取权限列表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/positions/:id/permissions', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const position = mockPositions.find((p) => p.id === id);

    if (!position) {
      const response: ApiResponse = {
        success: false,
        message: '岗位不存在',
      };
      return res.status(404).json(response);
    }

    const positionPermissions = mockPermissions.filter((perm) => {
      return position.permissions?.includes(perm.id);
    });

    const response: ApiResponse = {
      success: true,
      data: {
        positionId: position.id,
        positionName: position.name,
        permissionIds: position.permissions || [],
        permissions: positionPermissions,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get position permissions error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取岗位权限失败',
    };
    res.status(500).json(response);
  }
});

router.put('/positions/:id/permissions', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    const positionIndex = mockPositions.findIndex((p) => p.id === id);

    if (positionIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '岗位不存在',
      };
      return res.status(404).json(response);
    }

    mockPositions[positionIndex].permissions = permissionIds || [];
    mockPositions[positionIndex].updatedAt = new Date().toISOString();

    // 同步更新所有该岗位员工的权限
    const position = mockPositions[positionIndex];
    const positionPermissions = mockPermissions
      .filter((perm) => permissionIds?.includes(perm.id))
      .map(p => p.code);

    mockEmployees.forEach(employee => {
      if (employee.positionId === id && employee.username) {
        const userIndex = mockUsers.findIndex(u => u.username === employee.username);
        if (userIndex !== -1) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            permissions: positionPermissions,
            role: positionPermissions.includes('permission:manage') ? 'admin' : 'customer_service',
            updatedAt: new Date().toISOString(),
          };
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        positionId: mockPositions[positionIndex].id,
        positionName: mockPositions[positionIndex].name,
        permissionIds: mockPositions[positionIndex].permissions,
        permissions: mockPermissions.filter((perm) => permissionIds?.includes(perm.id)),
      },
      message: '岗位权限更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update position permissions error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新岗位权限失败',
    };
    res.status(500).json(response);
  }
});

router.put('/roles/:id/permissions', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const roleIndex = mockRoles.findIndex((r) => r.id === id);

    if (roleIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '角色不存在',
      };
      return res.status(404).json(response);
    }

    mockRoles[roleIndex].permissions = permissions;
    mockRoles[roleIndex].updatedAt = new Date().toISOString();

    const response: ApiResponse<Role> = {
      success: true,
      data: mockRoles[roleIndex],
      message: '权限更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update role permissions error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新权限失败',
    };
    res.status(500).json(response);
  }
});

export default router;
