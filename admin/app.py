"""
ArielGo Admin Dashboard
A Flask web application for managing laundry bookings
"""
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
import sqlite3
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'arielgo.db')

# DATABASE HELPER FUNCTIONS
def get_db_connection():
    """Create a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

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

# ROUTES

@app.route('/')
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

@app.route('/api/stats')
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
