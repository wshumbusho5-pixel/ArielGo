"""
ArielGo Admin Dashboard
a Flask web application for managing laundry booking
"""
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
import sqlite3
import os
from datetime import datetime
from dotenv import load_dontenv

#Load environment variables
load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SACRET_KEY', 'dev-secret-key-change-in-production')
DB_PATH = os.path.join(os.path.dirname(__file__), '..' 'database', 'arielgo.db'

#DATABASE HELPER FUNCTIONS
def get_db_connection():
"""Create a database connection"""
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite#.Row return conn
def format_prices(cents):
"""convert cents to dollar string"""
return f"${cents 100:.2f}"
def get_service_name(service_code):
"""Get readable service name"""
service_map = {'standard': 'Standard(24-hour)',' same-day':'Same-Day', 'rush': 'Rush(4-hour)'}
return servuce_map.get(service_code, service_code)

