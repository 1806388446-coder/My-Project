import { hashSecret } from './security.js';

const password = process.argv[2];

if (!password) {
  console.error('错误: 请提供密码作为参数！');
  console.log('用法: bun run api/src/generate-hash.js <您的管理员密码>');
  process.exit(1);
}

hashSecret(password).then((hash) => {
  console.log('\n================ 阿里云密码配置 ================');
  console.log('您输入的密码是:', '*'.repeat(password.length));
  console.log('生成的哈希值为 (ADMIN_PASSWORD_HASH):');
  console.log('\x1b[36m%s\x1b[0m', hash);
  console.log('================================================');
  console.log('请将上面蓝色的整段字符串复制，并在阿里云函数计算的配置中添加为环境变量:');
  console.log('变量名: ADMIN_PASSWORD_HASH');
  console.log('变量值: (粘贴上述哈希值)');
  console.log('================================================\n');
}).catch((err) => {
  console.error('生成哈希失败:', err);
});
