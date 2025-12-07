from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import json
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import os
from config import Config
import sys

app = Flask(__name__)
app.config.from_object(Config)

# Initialize database
db = SQLAlchemy(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# OTP storage (in production, use Redis or database)
otp_storage = {}

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    profile_picture = db.Column(db.String(200), default='default.jpg')
    subscription = db.Column(db.String(50), default='Free')
    watch_history = db.Column(db.Text, default='[]')
    watchlist = db.Column(db.Text, default='[]')

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))  # Updated to use session.get()

# Load data from JSON files with proper encoding
def load_movies():
    try:
        print("DEBUG: Loading movies from data/movies.json")
        with open('data/movies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"DEBUG: Loaded {len(data)} movies")
            return data
    except FileNotFoundError:
        print("ERROR: movies.json file not found")
        return []
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in movies.json: {e}")
        return []
    except Exception as e:
        print(f"ERROR loading movies: {e}")
        return []

def load_carousel():
    try:
        print("DEBUG: Loading carousel from data/carousel.json")
        with open('data/carousel.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"DEBUG: Loaded {len(data)} carousel items")
            return data
    except FileNotFoundError:
        print("ERROR: carousel.json file not found")
        return []
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in carousel.json: {e}")
        return []
    except Exception as e:
        print(f"ERROR loading carousel: {e}")
        return []
    
def load_continue_watching():
    try:
        with open('data/continue_watching.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("ERROR: continue_watching.json file not found in data/ directory")
        return []  # Return empty list
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON format in continue_watching.json: {e}")
        return []
    except Exception as e:
        print(f"ERROR loading continue watching: {e}")
        return []


def load_webseries():
    try:
        print("DEBUG: Loading webseries from data/webseries.json")
        with open('data/webseries.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"DEBUG: Loaded {len(data)} webseries")
            return data
    except FileNotFoundError:
        print("ERROR: webseries.json file not found")
        return []
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in webseries.json: {e}")
        return []
    except Exception as e:
        print(f"ERROR loading webseries: {e}")
        return []

# Email sending function
def send_email(to_email, subject, body):
    try:
        # Only send if email credentials are configured
        if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
            print(f"Simulating email to {to_email}: {subject}")
            print(f"Body: {body}")
            return True
            
        msg = MIMEMultipart()
        msg['From'] = app.config['MAIL_USERNAME']
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
        server.starttls()
        server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        # For development, simulate success
        print(f"Simulating email to {to_email}: {subject}")
        return True

# Generate OTP
def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

# Custom Jinja2 filter for JSON parsing
@app.template_filter('from_json')
def from_json_filter(value):
    try:
        return json.loads(value)
    except:
        return []

# Routes
@app.route('/')
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    
    print("DEBUG: Loading data for index page...")
    movies = load_movies()
    carousel = load_carousel()
    webseries = load_webseries()
    
    # Debug output
    print(f"DEBUG: Movies count: {len(movies)}")
    print(f"DEBUG: Carousel count: {len(carousel)}")
    print(f"DEBUG: Webseries count: {len(webseries)}")
    
    # Categorize movies
    top_ten = [m for m in movies if m.get('category') == 'top-ten']
    upcoming = [m for m in movies if m.get('category') == 'upcoming']
    trending = [m for m in movies if m.get('category') == 'trending']
    
    print(f"DEBUG: Top Ten count: {len(top_ten)}")
    print(f"DEBUG: Upcoming count: {len(upcoming)}")
    print(f"DEBUG: Trending count: {len(trending)}")
    
    return render_template('index.html', 
                         movies=movies,
                         carousel=carousel,
                         webseries=webseries,
                         top_ten=top_ten,
                         upcoming=upcoming,
                         trending=trending,
                         user=current_user)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = request.form.get('remember')
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user, remember=bool(remember))
            flash('Login successful! Welcome back.', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid email or password', 'danger')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Validation
        if not name or len(name) < 2:
            flash('Please enter a valid name (min 2 characters)', 'danger')
            return redirect(url_for('register'))
        
        if not email or '@' not in email:
            flash('Please enter a valid email address', 'danger')
            return redirect(url_for('register'))
        
        if len(password) < 6:
            flash('Password must be at least 6 characters', 'danger')
            return redirect(url_for('register'))
        
        if password != confirm_password:
            flash('Passwords do not match', 'danger')
            return redirect(url_for('register'))
        
        # Check if user exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already registered', 'danger')
            return redirect(url_for('register'))
        
        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(name=name, email=email, password=hashed_password)
        
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash('An error occurred. Please try again.', 'danger')
            print(f"Registration error: {e}")
    
    return render_template('register.html')

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Generate OTP
            otp = generate_otp()
            otp_storage[email] = {
                'otp': otp,
                'expiry': datetime.utcnow() + timedelta(minutes=app.config['OTP_EXPIRY_MINUTES'])
            }
            
            # Send OTP email
            subject = "StreamFlix - Password Reset OTP"
            body = f"""Hello {user.name},

Your OTP for password reset is: {otp}

This OTP will expire in {app.config['OTP_EXPIRY_MINUTES']} minutes.

If you didn't request this, please ignore this email.

Best regards,
StreamFlix Team"""
            
            if send_email(email, subject, body):
                session['reset_email'] = email
                flash('OTP sent to your email!', 'success')
                return redirect(url_for('verify_otp'))
            else:
                flash('Failed to send OTP. Please try again.', 'danger')
        else:
            flash('Email not found in our system', 'danger')
    
    return render_template('forgot_password.html')

@app.route('/verify-otp', methods=['GET', 'POST'])
def verify_otp():
    email = session.get('reset_email')
    if not email:
        return redirect(url_for('forgot_password'))
    
    if request.method == 'POST':
        entered_otp = request.form.get('otp')
        
        if email in otp_storage:
            stored_data = otp_storage[email]
            
            if datetime.utcnow() > stored_data['expiry']:
                flash('OTP has expired', 'danger')
                del otp_storage[email]
                return redirect(url_for('forgot_password'))
            
            if entered_otp == stored_data['otp']:
                # OTP verified - show password
                user = User.query.filter_by(email=email).first()
                session['otp_verified'] = True
                session['user_id'] = user.id
                return redirect(url_for('reset_password'))
            else:
                flash('Invalid OTP', 'danger')
        else:
            flash('OTP expired or not found', 'danger')
            return redirect(url_for('forgot_password'))
    
    return render_template('verify_otp.html', email=email)

@app.route('/reset-password', methods=['GET', 'POST'])
def reset_password():
    if not session.get('otp_verified'):
        return redirect(url_for('forgot_password'))
    
    user_id = session.get('user_id')
    user = User.query.get(user_id) if user_id else None
    
    if not user:
        return redirect(url_for('forgot_password'))
    
    if request.method == 'POST':
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')
        
        if len(new_password) < 6:
            flash('Password must be at least 6 characters', 'danger')
            return render_template('reset_password.html')
        
        if new_password != confirm_password:
            flash('Passwords do not match', 'danger')
            return render_template('reset_password.html')
        
        # Update password
        user.password = generate_password_hash(new_password)
        db.session.commit()
        
        # Cleanup
        session.pop('otp_verified', None)
        session.pop('user_id', None)
        session.pop('reset_email', None)
        
        flash('Password reset successful! Please login with your new password.', 'success')
        return redirect(url_for('login'))
    
    return render_template('reset_password.html', user=user)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)

@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    if request.method == 'POST':
        user = current_user
        
        # Update profile info
        user.name = request.form.get('name', user.name)
        
        # Handle profile picture upload
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file.filename:
                # Create uploads directory if it doesn't exist
                os.makedirs('static/uploads', exist_ok=True)
                filename = f"user_{user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
                file.save(os.path.join('static/uploads', filename))
                user.profile_picture = filename
        
        # Update password if provided
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')
        
        if current_password and new_password:
            if check_password_hash(user.password, current_password):
                if new_password == confirm_password:
                    user.password = generate_password_hash(new_password)
                    flash('Password updated successfully!', 'success')
                else:
                    flash('New passwords do not match', 'danger')
            else:
                flash('Current password is incorrect', 'danger')
        
        db.session.commit()
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('settings'))
    
    return render_template('settings.html', user=current_user)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('login'))

@app.route('/api/movies')
@login_required
def api_movies():
    movies = load_movies()
    print(f"API: Returning {len(movies)} movies")
    return jsonify(movies)

@app.route('/api/webseries')
@login_required
def api_webseries():
    webseries = load_webseries()
    print(f"API: Returning {len(webseries)} webseries")
    return jsonify(webseries)

@app.route('/api/carousel')
@login_required
def api_carousel():
    carousel = load_carousel()
    print(f"API: Returning {len(carousel)} carousel items")
    return jsonify(carousel)

@app.route('/api/continue-watching')
@login_required
def api_continue_watching():
    continue_data = load_continue_watching()
    return jsonify(continue_data)
# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500

# Create database tables and ensure directories exist
with app.app_context():
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")
    
    # Create necessary directories
    os.makedirs('static/uploads', exist_ok=True)
    os.makedirs('data', exist_ok=True)
    os.makedirs('templates', exist_ok=True)

if __name__ == '__main__':
    print("=" * 50)
    print("Starting StreamFlix Application...")
    print(f"Debug mode: {app.debug}")
    print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print("=" * 50)
    
    # Check if data files exist
    print("\nChecking data files:")
    data_dir = 'data'
    
    if os.path.exists(data_dir):
        files = os.listdir(data_dir)
        for file in files:
            if file.endswith('.json'):
                filepath = os.path.join(data_dir, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            print(f"✓ {file}: Found {len(data)} items")
                        else:
                            print(f"⚠ {file}: Not a list (type: {type(data).__name__})")
                except json.JSONDecodeError:
                    print(f"✗ {file}: Invalid JSON format")
                except Exception as e:
                    print(f"✗ {file}: Error reading - {e}")
    else:
        print("✗ data/ directory not found")
    
    print("\nStarting server...")
    app.run(debug=True, host='0.0.0.0', port=5000)