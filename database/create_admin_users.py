#!/usr/bin/env python3
"""
Create admin users table and add default admin account
"""
import sqlite3
import os
import hashlib

DB_PATH = os.path.join(os.path.dirname(__file__), 'arielgo.db')

def create_admin_table():
    """Create admin users table"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create admin users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT,
            role TEXT NOT NULL DEFAULT 'admin',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login TEXT
        )
    ''')

    # Check if default admin exists
    cursor.execute('SELECT COUNT(*) FROM admin_users WHERE username = ?', ('admin',))
    if cursor.fetchone()[0] == 0:
        # Create default admin account
        # Password: admin123 (CHANGE THIS IN PRODUCTION!)
        default_password_hash = hashlib.sha256('admin123'.encode()).hexdigest()

        cursor.execute('''
            INSERT INTO admin_users (username, password_hash, email, full_name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', ('admin', default_password_hash, 'admin@arielgo.com', 'Administrator', 'super_admin'))

        print('✅ Default admin account created:')
        print('   Username: admin')
        print('   Password: admin123')
        print('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!')
    else:
        print('ℹ️  Admin account already exists')

    conn.commit()
    conn.close()
    print('✅ Admin users table created successfully')

if __name__ == '__main__':
    create_admin_table()
