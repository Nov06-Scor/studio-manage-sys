// 尝试通过 Supabase SQL 端点创建表
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8'));

const url = config.SUPABASE_URL;
const key = config.SUPABASE_KEY;

const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase_init.sql'), 'utf-8');

const data = JSON.stringify({ query: sql });

const options = {
  hostname: url.replace('https://', '').replace('http://', '').replace('/rest/v1/', ''),
  port: 443,
  path: '/rest/v1/rpc/exec',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Length': data.length
  }
};

console.log('正在尝试通过 SQL 端点创建表...');

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('状态码:', res.statusCode);
    console.log('响应:', responseData);
  });
});

req.on('error', (e) => {
  console.error('请求错误:', e.message);
});

req.write(data);
req.end();
