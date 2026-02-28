require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function resetAdmin() {
  const hash = await bcrypt.hash('Admin@123', 10);
  await pool.query(
    'UPDATE admins SET password=$1 WHERE email=$2',
    [hash, 'admin@moverspackersco.com']
  );
  console.log('✅ Admin password reset to Admin@123');
  process.exit();
}
resetAdmin();