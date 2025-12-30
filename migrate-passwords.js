// Migrate existing SHA256 passwords to bcrypt
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database', 'arielgo.db');
const SALT_ROUNDS = 10;

async function migratePasswords() {
  const db = new sqlite3.Database(DB_PATH);

  console.log('🔐 Starting password migration to bcrypt...\n');

  // Get all users with SHA256 hashes (not starting with $2)
  db.all(
    `SELECT id, username, password_hash FROM admin_users WHERE password_hash NOT LIKE '$2%'`,
    [],
    async (err, users) => {
      if (err) {
        console.error('Error fetching users:', err);
        db.close();
        return;
      }

      if (users.length === 0) {
        console.log('✅ No passwords need migration. All users already using bcrypt.');
        db.close();
        return;
      }

      console.log(`Found ${users.length} user(s) with SHA256 passwords.\n`);
      console.log('⚠️  WARNING: This migration requires you to reset passwords.');
      console.log('   SHA256 is a one-way hash - we cannot convert it to bcrypt.\n');
      console.log('Available options:');
      console.log('1. Keep SHA256 hashes (system supports both)');
      console.log('2. Manually reset passwords for each user\n');
      console.log('For your demo, the current SHA256 password will still work.');
      console.log('After the pitch, you should reset all passwords to use bcrypt.\n');

      users.forEach(user => {
        console.log(`- User: ${user.username} (ID: ${user.id}) - using SHA256`);
      });

      console.log('\n✅ Migration check complete.');
      console.log('💡 Both bcrypt and SHA256 are supported for login.');
      console.log('   New passwords will automatically use bcrypt.\n');

      db.close();
    }
  );
}

migratePasswords();
