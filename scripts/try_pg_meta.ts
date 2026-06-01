// 使用 JWT Secret 通过 Supabase REST API 创建表 - 修正版本
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
    role: 'service_role',
    iss: 'supabase',
    ref: projectRef,
    iat: now,
    exp: now + 3600,
  };
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

async function tryEndpoint(name: string, url: string, token: string, body: any): Promise<boolean> {
  try {
    console.log(`\n🔍 ${name}`);
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
    console.log(`   响应: ${text.substring(0, 500)}`);

    if (response.ok) {
      console.log(`   ✅ 成功！`);
      return true;
    }
    return false;
  } catch (e: any) {
    console.log(`   ❌ 异常: ${e.message}`);
    return false;
  }
}

async function main() {
  const sql = readFileSync(join(process.cwd(), 'supabase_init.sql'), 'utf-8');
  const token = generateServiceRoleToken();

  console.log('🔑 Token 长度:', token.length);
  console.log('🔍 Token 解析:', jwt.decode(token));

  const endpoints = [
    { name: 'pg/query', url: `https://${projectRef}.supabase.co/pg/query`, body: { query: sql } },
    { name: 'rest/v1/rpc/exec', url: `https://${projectRef}.supabase.co/rest/v1/rpc/exec`, body: { query: sql } },
  ];

  for (const ep of endpoints) {
    await tryEndpoint(ep.name, ep.url, token, ep.body);
  }
}

main().catch(console.error);
