# ArielGo Admin Dashboard

A Flask-based admin dashboard for managing laundry delivery bookings.

## Features

- **Dashboard Overview**: View key statistics (total bookings, revenue, status breakdown)
- **Booking Management**: View all bookings with filtering by status
- **Booking Details**: View individual booking information
- **Status Updates**: Change booking status (pending → confirmed → in_progress → completed)
- **Clean UI**: Modern, responsive design

## Setup

### 1. Activate Virtual Environment

```bash
source ../admin-venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Make sure your `.env` file in the project root has:

```
FLASK_SECRET_KEY=your-secret-key-here
```

### 4. Run the Admin Dashboard

```bash
cd admin
python app.py
```

The admin dashboard will be available at: **http://localhost:5000**

## Routes

- `/` - Dashboard overview with stats
- `/bookings` - View all bookings (with status filtering)
- `/bookings/<id>` - View single booking details
- `/bookings/<id>/status` - Update booking status (POST)
- `/api/stats` - JSON API for statistics

## Status Filter

You can filter bookings by status using the URL parameter:

- `/bookings?status=all` - All bookings
- `/bookings?status=pending` - Pending bookings only
- `/bookings?status=confirmed` - Confirmed bookings only
- `/bookings?status=in_progress` - In progress bookings
- `/bookings?status=completed` - Completed bookings
- `/bookings?status=cancelled` - Cancelled bookings

## Technology Stack

- **Backend**: Flask (Python web framework)
- **Database**: SQLite (shares database with main booking system)
- **Frontend**: HTML, CSS, JavaScript (no heavy frameworks)
- **Styling**: Clean, modern CSS with responsive design

## File Structure

```
admin/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── templates/             # HTML templates
│   ├── base.html         # Base template with navbar
│   ├── dashboard.html    # Dashboard overview
│   ├── bookings.html     # All bookings list
│   └── booking_detail.html  # Single booking detail
└── static/               # Static assets
    ├── css/
    │   └── admin.css     # Styling
    └── js/
        └── admin.js      # JavaScript functionality
```

## Notes

- The admin dashboard runs on port 5000 (different from the main booking site on port 3000)
- Both systems share the same SQLite database (`database/arielgo.db`)
- The main booking system must be set up first before using the admin dashboard
