// 尝试不同的 JWT payload 格式
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'D9F3805E-DC54-4C10-BFD9-1208F95EA284';
const projectRef = 'zuidiahuriqdzdqtwvfo';
const now = Math.floor(Date.now() / 1000);

// 尝试不同的 payload 格式
const payloads = [
  { name: '标准 service_role', data: { role: 'service_role', iss: 'supabase', ref: projectRef, iat: now, exp: now + 3600 } },
  { name: '带 sub', data: { role: 'service_role', iss: 'supabase', ref: projectRef, sub: 'service_role', iat: now, exp: now + 3600 } },
  { name: '带 aud', data: { role: 'service_role', iss: 'supabase', ref: projectRef, aud: 'authenticated', iat: now, exp: now + 3600 } },
  { name: 'PostgreSQL 格式', data: { role: 'service_role', sub: 'postgres', ref: projectRef, iss: 'supabase', iat: now, exp: now + 3600 } },
];

const SUPABASE_ANON_KEY = 'sb_publishable__vBAUCFCU5rzyr-Ha_PbEw_DO9Ko4b0';

async function testPayload(name: string, payload: any): Promise<boolean> {
  const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });

  try {
    const response = await fetch(`https://${projectRef}.supabase.co/rest/v1/users?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log(`  [${name}] 状态: ${response.status}, 响应: ${text.substring(0, 150)}`);

    return response.ok;
  } catch (e: any) {
    console.log(`  [${name}] 异常: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('🔑 测试不同的 JWT payload 格式...\n');

  for (const p of payloads) {
    console.log(`\n${p.name}:`);
    await testPayload(p.name, p.data);
  }
}

main().catch(console.error);
