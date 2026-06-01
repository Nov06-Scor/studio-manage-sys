// 使用 JWT Secret 通过 Supabase REST API 创建表
// ⚠️ 此脚本为一次性工具，请勿保存到生产代码中

import { readFileSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = 'https://zuidiahuriqdzdqtwvfo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__vBAUCFCU5rzyr-Ha_PbEw_DO9Ko4b0';
const JWT_SECRET = 'D9F3805E-DC54-4C10-BFD9-1208F95EA284';

const projectRef = 'zuidiahuriqdzdqtwvfo';

function generateServiceRoleToken(): string {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: 'supabase',
    ref: projectRef,
    role: 'service_role',
    iat: now,
    exp: now + 3600,
  };

  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

async function tryEndpoint(name: string, url: string, token: string, body: any): Promise<boolean> {
  try {
    console.log(`\n🔍 尝试: ${name}`);
    console.log(`   URL: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log(`   状态: ${response.status}`);
    console.log(`   响应: ${text.substring(0, 300)}`);

    return response.ok;
  } catch (e: any) {
    console.log(`   ❌ 异常: ${e.message}`);
    return false;
  }
}

async function main() {
  const sqlPath = join(process.cwd(), 'supabase_init.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log('📄 SQL 长度:', sql.length, '字符');
  console.log('� 生成 service_role JWT token...');

  const token = generateServiceRoleToken();
  console.log('✅ Token 已生成（长度: ' + token.length + '）');
  console.log('� Token 前 50 字符:', token.substring(0, 50) + '...');

  // 拆分 SQL 为单个语句，逐个执行
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s !== 'SELECT \'数据库表初始化成功！\' AS message');

  console.log(`\n📝 准备执行 ${statements.length} 个 SQL 语句`);

  // 尝试不同的端点
  const endpoints = [
    { name: 'pg/query (旧)', url: `https://${projectRef}.supabase.co/pg/query` },
    { name: 'rest/v1/rpc/exec', url: `https://${projectRef}.supabase.co/rest/v1/rpc/exec` },
  ];

  let allSuccess = true;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📌 语句 ${i + 1}/${statements.length}:`);
    console.log(stmt.substring(0, 100) + (stmt.length > 100 ? '...' : ''));
    console.log('='.repeat(60));

    let success = false;
    for (const endpoint of endpoints) {
      success = await tryEndpoint(
        endpoint.name,
        endpoint.url,
        token,
        { query: stmt, sql: stmt }
      );
      if (success) break;
    }

    if (!success) {
      console.log(`\n❌ 语句 ${i + 1} 失败！`);
      allSuccess = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  if (allSuccess) {
    console.log('✅ 所有表创建成功！');
  } else {
    console.log('❌ 部分语句失败');
    console.log('');
    console.log('💡 建议：在 Supabase Dashboard 的 SQL Editor 中手动执行 supabase_init.sql');
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
