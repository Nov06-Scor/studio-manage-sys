# Vercel 部署指南

## 前置条件

1. **GitHub 仓库**：代码已推送到 GitHub
2. **Vercel 账户**：注册 Vercel 账号并关联 GitHub
3. **Supabase 项目**：已配置 Supabase 作为数据库

## 部署步骤

### 方法一：通过 Vercel 网站部署（推荐）

1. **访问 Vercel**：https://vercel.com/new
2. **导入项目**：选择你的 GitHub 仓库
3. **配置项目**：
   - Project Name: `studio-manage-sys`（或你喜欢的名字）
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **添加环境变量**：
   ```
   NODE_ENV=production
   VITE_API_BASE_URL=/api
   ```
   如果使用 Supabase，还需要添加：
   ```
   SUPABASE_URL=你的_supabase_url
   SUPABASE_KEY=你的_supabase_key
   ```
5. **点击 Deploy**

### 方法二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**：
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**：
   ```bash
   vercel login
   ```

3. **部署**：
   ```bash
   cd "e:\Trae workspace"
   vercel
   ```

4. **配置提示**：
   - Set up and deploy `e:\Trae workspace`? **Yes**
   - Link to existing project? **No**
   - What's your project's name? `studio-manage-sys`
   - In which directory is your code located? `./`
   - Want to modify these settings? **No**

5. **设置环境变量**：
   ```bash
   vercel env add NODE_ENV production
   vercel env add VITE_API_BASE_URL /api
   vercel env add SUPABASE_URL 你的_supabase_url
   vercel env add SUPABASE_KEY 你的_supabase_key
   ```

6. **重新部署**：
   ```bash
   vercel --prod
   ```

## 项目配置说明

### 已配置的文件

1. **vercel.json** - Vercel 部署配置
2. **api/index.ts** - Serverless 函数入口
3. **.env.example** - 环境变量模板

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| NODE_ENV | 运行环境 | production |
| VITE_API_BASE_URL | API 基础路径 | /api |
| SUPABASE_URL | Supabase URL | https://xxx.supabase.co |
| SUPABASE_KEY | Supabase Key | eyJ... |

## 验证部署

部署成功后：

1. **访问网站**：显示分配的 URL（如 `https://studio-manage-sys.vercel.app`）
2. **测试登录**：使用测试账号登录
3. **API 测试**：访问 `/api/health` 检查后端是否正常

## 常见问题

### 问题：API 路由 404

**解决**：
- 确保 `api/index.ts` 文件存在
- 检查 `vercel.json` 中的 rewrite 配置

### 问题：构建失败

**解决**：
- 检查 `package.json` 的 scripts 配置
- 确保所有依赖都在 `package.json` 中

### 问题：环境变量未生效

**解决**：
- 在 Vercel Dashboard 设置环境变量
- 重新部署项目

## 本地开发

部署前在本地测试：

```bash
# 安装依赖
npm install

# 开发模式（同时启动前端和后端）
npm run dev

# 构建测试
npm run build

# 类型检查
npm run check
```

## 持续部署

每次推送到 GitHub 时，Vercel 会自动：
1. 构建项目
2. 部署到预览环境
3. 合并到 main 分支后自动部署到生产环境
