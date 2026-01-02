const bcrypt = require('bcrypt');
const db = require('better-sqlite3')('database.sqlite');

const email = 'wshumbusho5@gmail.com';
const newPassword = '123Ortega@';

bcrypt.hash(newPassword, 10).then(hash => {
  db.prepare("UPDATE users SET password = ? WHERE email = ?").run(hash, email);
  console.log('Password updated for:', email);
  process.exit(0);
});
