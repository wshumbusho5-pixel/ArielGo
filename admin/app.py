"""
ArielGo Admin Dashboard
A Flask web application for managing laundry bookings with authentication
"""
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash, session
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from functools import wraps
import sqlite3
import os
import hashlib
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'arielgo.db')

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access the admin dashboard.'

# USER MODEL
class User(UserMixin):
    def __init__(self, id, username, email, full_name, role):
        self.id = id
        self.username = username
        self.email = email
        self.full_name = full_name
        self.role = role

    def has_role(self, role):
        """Check if user has specific role"""
        if self.role == 'super_admin':
            return True  # Super admin has all permissions
        return self.role == role

@login_manager.user_loader
def load_user(user_id):
    """Load user from database"""
    conn = get_db_connection()
    user_data = conn.execute(
        'SELECT * FROM admin_users WHERE id = ? AND is_active = 1',
        (user_id,)
    ).fetchone()
    conn.close()

    if user_data:
        return User(
            id=user_data['id'],
            username=user_data['username'],
            email=user_data['email'],
            full_name=user_data['full_name'],
            role=user_data['role']
        )
    return None

# DATABASE HELPER FUNCTIONS
def get_db_connection():
    """Create a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def verify_password(password, password_hash):
    """Verify password against hash"""
    return hashlib.sha256(password.encode()).hexdigest() == password_hash

def hash_password(password):
    """Hash a password"""
    return hashlib.sha256(password.encode()).hexdigest()

def format_price(cents):
    """Convert cents to dollar string"""
    return f"${cents / 100:.2f}"

def get_service_name(service_code):
    """Get readable service name"""
    service_map = {
        'standard': 'Standard (24-hour)',
        'same-day': 'Same-Day',
        'rush': 'Rush (4-hour)'
    }
    return service_map.get(service_code, service_code)

# AUTHORIZATION DECORATORS
def role_required(*roles):
    """Decorator to require specific roles"""
    def decorator(f):
        @wraps(f)
        @login_required
        def decorated_function(*args, **kwargs):
            if not any(current_user.has_role(role) for role in roles):
                flash('You do not have permission to access this page.', 'error')
                return redirect(url_for('dashboard'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# AUTHENTICATION ROUTES

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        conn = get_db_connection()
        user_data = conn.execute(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = 1',
            (username,)
        ).fetchone()

        if user_data and verify_password(password, user_data['password_hash']):
            # Update last login
            conn.execute(
                'UPDATE admin_users SET last_login = ? WHERE id = ?',
                (datetime.now().isoformat(), user_data['id'])
            )
            conn.commit()
            conn.close()

            # Create user object and log in
            user = User(
                id=user_data['id'],
                username=user_data['username'],
                email=user_data['email'],
                full_name=user_data['full_name'],
                role=user_data['role']
            )
            login_user(user, remember=True)

            flash(f'Welcome back, {user.full_name}!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page if next_page else url_for('dashboard'))
        else:
            conn.close()
            flash('Invalid username or password', 'error')

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    """Logout user"""
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('login'))

# DASHBOARD ROUTES

@app.route('/')
@login_required
def dashboard():
    """Main dashboard showing booking statistics"""
    conn = get_db_connection()

    # Get total bookings
    total_bookings = conn.execute('SELECT COUNT(*) as count FROM bookings').fetchone()['count']

    # Get revenue (sum of all totals)
    revenue = conn.execute('SELECT SUM(totalPrice) as revenue FROM bookings').fetchone()['revenue'] or 0

    # Get bookings by status
    pending = conn.execute('SELECT COUNT(*) as count FROM bookings WHERE status = ?', ('pending',)).fetchone()['count']
    confirmed = conn.execute('SELECT COUNT(*) as count FROM bookings WHERE status = ?', ('confirmed',)).fetchone()['count']
    in_progress = conn.execute('SELECT COUNT(*) as count FROM bookings WHERE status = ?', ('in_progress',)).fetchone()['count']
    completed = conn.execute('SELECT COUNT(*) as count FROM bookings WHERE status = ?', ('completed',)).fetchone()['count']

    # Get recent bookings
    recent_bookings = conn.execute(
        'SELECT * FROM bookings ORDER BY createdAt DESC LIMIT 10'
    ).fetchall()

    conn.close()

    stats = {
        'total_bookings': total_bookings,
        'revenue': format_price(revenue),
        'pending': pending,
        'confirmed': confirmed,
        'in_progress': in_progress,
        'completed': completed
    }

    return render_template('dashboard.html', stats=stats, bookings=recent_bookings)

@app.route('/bookings')
@login_required
def bookings():
    """View all bookings"""
    status_filter = request.args.get('status', 'all')

    conn = get_db_connection()

    if status_filter == 'all':
        all_bookings = conn.execute('SELECT * FROM bookings ORDER BY createdAt DESC').fetchall()
    else:
        all_bookings = conn.execute(
            'SELECT * FROM bookings WHERE status = ? ORDER BY createdAt DESC',
            (status_filter,)
        ).fetchall()

    conn.close()

    return render_template('bookings.html', bookings=all_bookings, status_filter=status_filter)

@app.route('/bookings/<int:booking_id>')
@login_required
def booking_detail(booking_id):
    """View single booking details"""
    conn = get_db_connection()
    booking = conn.execute('SELECT * FROM bookings WHERE id = ?', (booking_id,)).fetchone()
    conn.close()

    if booking is None:
        flash('Booking not found', 'error')
        return redirect(url_for('bookings'))

    return render_template('booking_detail.html', booking=booking)

@app.route('/bookings/<int:booking_id>/status', methods=['POST'])
@login_required
def update_status(booking_id):
    """Update booking status"""
    new_status = request.form.get('status')

    if new_status not in ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']:
        flash('Invalid status', 'error')
        return redirect(url_for('booking_detail', booking_id=booking_id))

    conn = get_db_connection()
    conn.execute(
        'UPDATE bookings SET status = ?, updatedAt = ? WHERE id = ?',
        (new_status, datetime.now().isoformat(), booking_id)
    )
    conn.commit()
    conn.close()

    flash(f'Booking status updated to {new_status}', 'success')
    return redirect(url_for('booking_detail', booking_id=booking_id))

# ADMIN MANAGEMENT ROUTES (Super Admin Only)

@app.route('/admin/users')
@role_required('super_admin')
def admin_users():
    """View all admin users"""
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM admin_users ORDER BY created_at DESC').fetchall()
    conn.close()

    return render_template('admin_users.html', users=users)

@app.route('/admin/users/create', methods=['GET', 'POST'])
@role_required('super_admin')
def create_admin():
    """Create new admin user"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')
        full_name = request.form.get('full_name')
        role = request.form.get('role', 'admin')

        if not all([username, password, email, full_name]):
            flash('All fields are required', 'error')
            return redirect(url_for('create_admin'))

        password_hash = hash_password(password)

        try:
            conn = get_db_connection()
            conn.execute('''
                INSERT INTO admin_users (username, password_hash, email, full_name, role)
                VALUES (?, ?, ?, ?, ?)
            ''', (username, password_hash, email, full_name, role))
            conn.commit()
            conn.close()

            flash(f'Admin user {username} created successfully', 'success')
            return redirect(url_for('admin_users'))

        except sqlite3.IntegrityError:
            flash('Username or email already exists', 'error')

    return render_template('create_admin.html')

@app.route('/admin/users/<int:user_id>/toggle', methods=['POST'])
@role_required('super_admin')
def toggle_admin_status(user_id):
    """Toggle admin user active status"""
    if user_id == current_user.id:
        flash('You cannot deactivate your own account', 'error')
        return redirect(url_for('admin_users'))

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM admin_users WHERE id = ?', (user_id,)).fetchone()

    if user:
        new_status = 0 if user['is_active'] else 1
        conn.execute('UPDATE admin_users SET is_active = ? WHERE id = ?', (new_status, user_id))
        conn.commit()
        flash(f'User {user["username"]} {"activated" if new_status else "deactivated"}', 'success')

    conn.close()
    return redirect(url_for('admin_users'))

# PROFILE ROUTE

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile page"""
    if request.method == 'POST':
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')

        if not all([current_password, new_password, confirm_password]):
            flash('All password fields are required', 'error')
            return redirect(url_for('profile'))

        if new_password != confirm_password:
            flash('New passwords do not match', 'error')
            return redirect(url_for('profile'))

        conn = get_db_connection()
        user_data = conn.execute(
            'SELECT password_hash FROM admin_users WHERE id = ?',
            (current_user.id,)
        ).fetchone()

        if verify_password(current_password, user_data['password_hash']):
            new_hash = hash_password(new_password)
            conn.execute(
                'UPDATE admin_users SET password_hash = ? WHERE id = ?',
                (new_hash, current_user.id)
            )
            conn.commit()
            flash('Password updated successfully', 'success')
        else:
            flash('Current password is incorrect', 'error')

        conn.close()

    return render_template('profile.html')

# API ROUTES

@app.route('/api/stats')
@login_required
def api_stats():
    """API endpoint for statistics"""
    conn = get_db_connection()

    total_bookings = conn.execute('SELECT COUNT(*) as count FROM bookings').fetchone()['count']
    revenue = conn.execute('SELECT SUM(totalPrice) as revenue FROM bookings').fetchone()['revenue'] or 0
    total_bags = conn.execute('SELECT SUM(numberOfBags) as bags FROM bookings').fetchone()['bags'] or 0

    by_status = {}
    for status in ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']:
        count = conn.execute('SELECT COUNT(*) as count FROM bookings WHERE status = ?', (status,)).fetchone()['count']
        by_status[status] = count

    conn.close()

    return jsonify({
        'total_bookings': total_bookings,
        'revenue': revenue,
        'total_bags': total_bags,
        'by_status': by_status
    })

if __name__ == '__main__':
    app.run(debug=True, port=5002)
