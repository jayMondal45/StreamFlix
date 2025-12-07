# 🎬 StreamFlix

<div align="center">

![StreamFlix](https://img.shields.io/badge/StreamFlix-Entertainment-red?style=for-the-badge&logo=netflix)
[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-black?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A modern, full-stack streaming platform built with Flask, featuring user authentication, dynamic content management, and a Netflix-inspired UI**

[View Demo](https://jaymondal45.github.io/StreamFlix/) • [Report Bug](https://github.com/jaymondal45/StreamFlix/issues) • [Request Feature](https://github.com/jaymondal45/StreamFlix/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

---

## 🎯 About The Project

**StreamFlix** is a comprehensive, production-ready streaming platform that mimics the core functionality of modern streaming services like Netflix. Built with Flask and modern web technologies, it provides a complete user experience from registration to content consumption.

### Key Highlights

- 🔐 **Complete Authentication System** - Registration, login, password reset with OTP
- 🎨 **Netflix-Inspired UI** - Modern, responsive design with smooth animations
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop devices
- 👤 **User Profiles** - Personal watchlists, watch history, and preferences
- 🎬 **Dynamic Content** - Movies, web series with detailed episode management
- 📊 **Continue Watching** - Track viewing progress across sessions
- 🔍 **Smart Search** - Real-time content search functionality
- 📧 **Email Integration** - OTP-based password recovery system

---

## ✨ Features

### Authentication & User Management

- **User Registration**
  - Email validation
  - Password strength requirements
  - Secure password hashing with Werkzeug
  - Input validation and error handling

- **Login System**
  - Secure session management with Flask-Login
  - "Remember Me" functionality
  - Protected routes and decorators

- **Password Recovery**
  - OTP generation (6-digit codes)
  - Email-based verification
  - Time-limited OTP validity (10 minutes)
  - Secure password reset flow

- **User Profiles**
  - Profile picture upload
  - Watch history tracking
  - Personal watchlist management
  - Account settings management

### Content Features

- **Hero Carousel**
  - Dynamic content rotation
  - Smooth transitions
  - Featured movies and series
  - Desktop vertical slider
  - Mobile horizontal slider

- **Continue Watching**
  - Progress tracking
  - Resume playback positions
  - Responsive card layout
  - Scroll indicators

- **Content Categories**
  - Top 10 Movies
  - Trending Content
  - Upcoming Releases
  - Genre-based browsing

- **Web Series Management**
  - Season navigation
  - Episode listings with details
  - Runtime information
  - Episode thumbnails

- **Search Functionality**
  - Real-time search
  - Search across movies and series
  - Responsive search interface

### UI/UX Features

- **Responsive Design**
  - Mobile-first approach
  - Hamburger menu for mobile
  - Touch-friendly interactions
  - Adaptive layouts

- **Premium Aesthetics**
  - Dark theme interface
  - Smooth animations
  - Hover effects
  - Loading states

- **Interactive Elements**
  - User dropdown menus
  - Modal windows
  - Toast notifications (flash messages)
  - Back to top button

---

## 🛠️ Tech Stack

### Backend

- **Flask 2.3.3** - Web framework
- **Flask-SQLAlchemy 3.0.5** - ORM for database operations
- **Flask-Login 0.6.2** - User session management
- **SQLite** - Database (easily upgradable to PostgreSQL/MySQL)
- **Werkzeug** - Password hashing and security
- **SMTP** - Email functionality

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (Vanilla)** - Interactive functionality
- **Swiper.js** - Touch-enabled sliders
- **Font Awesome 6.4.0** - Icon library

### Development Tools

- **Python-dotenv** - Environment variable management
- **Git** - Version control
- **VS Code** - Development environment

---

## 📁 Project Structure

```
StreamFlix/
│
├── app.py                      # Main application file with routes
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (create this)
├── .gitignore                  # Git ignore rules
│
├── data/                       # JSON data files
│   ├── movies.json            # Movies database
│   ├── webseries.json         # Web series database
│   ├── carousel.json          # Hero carousel content
│   └── continue_watching.json # Continue watching data
│
├── static/                     # Static assets
│   ├── css/
│   │   ├── style.css         # Main stylesheet
│   │   └── auth.css          # Authentication pages styles
│   ├── js/
│   │   └── script.js         # Main JavaScript
│   ├── img/                  # Images
│   └── uploads/              # User uploaded files
│
├── templates/                  # Jinja2 templates
│   ├── index.html            # Home page
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── forgot_password.html  # Password recovery
│   ├── verify_otp.html       # OTP verification
│   ├── reset_password.html   # Password reset
│   ├── profile.html          # User profile
│   ├── settings.html         # Account settings
│   ├── 404.html             # 404 error page
│   └── 500.html             # 500 error page
│
└── users.db                    # SQLite database (auto-generated)
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
Python 3.8 or higher
pip (Python package manager)
Git
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/jaymondal45/StreamFlix.git
cd StreamFlix
```

2. **Create a virtual environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Create required directories**

```bash
mkdir -p static/uploads data templates
```

### Configuration

1. **Create a `.env` file in the root directory:**

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here-change-this-in-production
DATABASE_URL=sqlite:///users.db

# Email Configuration (Optional - for OTP functionality)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# OTP Settings
OTP_EXPIRY_MINUTES=10
```

2. **Gmail App Password Setup (for email functionality):**

   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Generate an App Password
   - Use the App Password in `MAIL_PASSWORD`

3. **Update config.py if needed:**

```python
# config.py already includes:
- Secret key management
- Database configuration
- Email server settings
- OTP expiry settings
```

### Running the Application

1. **Initialize the database (automatic on first run):**

```bash
python app.py
```

The application will:
- Create the SQLite database
- Set up all required tables
- Create necessary directories
- Start the development server

2. **Access the application:**

```
http://localhost:5000
```

3. **Create your first account:**
   - Navigate to the registration page
   - Fill in your details
   - Login and start exploring!

---

## 📖 Usage

### User Registration & Login

1. **Register a new account:**
   - Click "Sign up now" on the login page
   - Enter your full name, email, and password
   - Password must be at least 6 characters
   - Click "Sign Up"

2. **Login:**
   - Enter your registered email and password
   - Optional: Check "Remember me"
   - Click "Sign In"

### Password Recovery

1. **Forgot Password:**
   - Click "Need help?" on the login page
   - Enter your registered email
   - Check your email for the 6-digit OTP
   - Enter the OTP within 10 minutes
   - Set your new password

### Browsing Content

1. **Home Page:**
   - Browse the hero carousel (swipe on mobile)
   - Continue watching your in-progress content
   - Explore Top 10 movies
   - Check upcoming releases
   - Browse by categories

2. **Web Series:**
   - Navigate to web series section
   - Select a series to view details
   - Choose season and episode
   - View episode information and thumbnails

### Profile Management

1. **View Profile:**
   - Click your profile picture
   - Select "Profile"
   - View watch history and statistics

2. **Update Settings:**
   - Click your profile picture
   - Select "Settings"
   - Update profile information
   - Change profile picture
   - Modify password
   - Manage privacy settings

---

## 🔌 API Endpoints

### Authentication Routes

```python
POST   /register              # User registration
POST   /login                 # User login
GET    /logout                # User logout
POST   /forgot-password       # Request password reset
POST   /verify-otp            # Verify OTP
POST   /reset-password        # Reset password
```

### User Routes

```python
GET    /profile               # View user profile (protected)
GET    /settings              # Account settings (protected)
POST   /settings              # Update settings (protected)
```

### Content API Routes

```python
GET    /api/movies            # Fetch all movies (protected)
GET    /api/webseries         # Fetch all web series (protected)
GET    /api/carousel          # Fetch carousel data (protected)
GET    /api/continue-watching # Fetch continue watching (protected)
```

### Error Handlers

```python
404    Error handler          # Custom 404 page
500    Error handler          # Custom 500 page
```

---

## 🗄️ Database Schema

### User Model

```python
class User(UserMixin, db.Model):
    id              # Integer, Primary Key
    name            # String(100), Not Null
    email           # String(100), Unique, Not Null
    password        # String(200), Hashed, Not Null
    created_at      # DateTime, Default: UTC Now
    profile_picture # String(200), Default: 'default.jpg'
    subscription    # String(50), Default: 'Free'
    watch_history   # Text, JSON Array, Default: '[]'
    watchlist       # Text, JSON Array, Default: '[]'
```

### Data Files Schema

**movies.json:**
```json
{
  "title": "Movie Title",
  "image": "URL",
  "rating": "8.5",
  "duration": "2h 30m",
  "age": "PG-13",
  "quality": "4K",
  "category": "trending|top-ten|upcoming",
  "genre": "Action"
}
```

**webseries.json:**
```json
{
  "id": 1,
  "title": "Series Title",
  "description": "Description",
  "rating": "8.7/10",
  "year": "2016-2025",
  "seasons": 5,
  "episodes": 42,
  "rank": 1,
  "image": "URL",
  "genres": ["Sci-Fi", "Horror"],
  "seasonsData": {
    "1": [
      {
        "episode": 1,
        "title": "Episode Title",
        "duration": "49m",
        "image": "URL"
      }
    ]
  }
}
```

---

## 📸 Screenshots

### Desktop Views
*[Add screenshots of desktop home page, profile, settings]*

### Mobile Views
*[Add screenshots of mobile responsive design]*

### Authentication Flow
*[Add screenshots of login, register, OTP verification]*

---

## 🗺️ Roadmap

### Completed Features ✅
- User authentication system
- Password recovery with OTP
- Responsive UI design
- Dynamic content loading
- User profiles and settings
- Continue watching functionality
- Web series with episode management

### Upcoming Features 🔄

**Phase 1 - Enhanced User Experience**
- [ ] Video player integration
- [ ] Actual streaming functionality
- [ ] Watch progress tracking (backend)
- [ ] User ratings and reviews
- [ ] Favorites/Watchlist synchronization

**Phase 2 - Content Management**
- [ ] Admin panel for content management
- [ ] Content upload functionality
- [ ] Advanced search with filters
- [ ] Genre-based recommendations
- [ ] Trending algorithm implementation

**Phase 3 - Social Features**
- [ ] User comments and discussions
- [ ] Share content to social media
- [ ] User following system
- [ ] Recommendation engine

**Phase 4 - Premium Features**
- [ ] Subscription plans (Free, Premium)
- [ ] Payment gateway integration
- [ ] Download for offline viewing
- [ ] Multiple user profiles per account
- [ ] Parental controls

**Phase 5 - Technical Improvements**
- [ ] PostgreSQL/MySQL migration
- [ ] Redis caching implementation
- [ ] CDN integration for content delivery
- [ ] API rate limiting
- [ ] Advanced security features
- [ ] PWA capabilities

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
   ```bash
   # Click the 'Fork' button at the top right of the repository
   ```

2. **Clone your Fork**
   ```bash
   git clone https://github.com/your-username/StreamFlix.git
   cd StreamFlix
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

4. **Make your Changes**
   - Follow PEP 8 style guidelines for Python
   - Write meaningful commit messages
   - Add comments to complex code
   - Update documentation as needed

5. **Test your Changes**
   ```bash
   python app.py
   # Test all functionality
   ```

6. **Commit your Changes**
   ```bash
   git add .
   git commit -m "Add: AmazingFeature description"
   ```

7. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

8. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Provide detailed description of changes

### Contribution Guidelines

- **Code Style:** Follow PEP 8 for Python code
- **Commits:** Use clear, descriptive commit messages
- **Documentation:** Update README.md for significant changes
- **Testing:** Test all features before submitting PR
- **Issues:** Check existing issues before creating new ones

---

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

```
MIT License

Copyright (c) 2025 Jay Mondal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📧 Contact

**Jay Mondal**

- GitHub: [@jaymondal45](https://github.com/jaymondal45)
- Email: jaymondals953@gmail.com
- LinkedIn: [Jay Mondal](https://www.linkedin.com/in/jaymondal45)
- Website: [https://jaymondal45.github.io/StreamFlix/](https://jaymondal45.github.io/StreamFlix/)

**Project Link:** [https://github.com/jaymondal45/StreamFlix](https://github.com/jaymondal45/StreamFlix)

---

## 🙏 Acknowledgments

### Technologies & Libraries

- [Flask](https://flask.palletsprojects.com/) - The micro web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - Database ORM
- [Flask-Login](https://flask-login.readthedocs.io/) - User session management
- [Swiper.js](https://swiperjs.com/) - Modern mobile touch slider
- [Font Awesome](https://fontawesome.com/) - Icon library
- [Unsplash](https://unsplash.com/) - High-quality images

### Design Inspiration

- [Netflix](https://www.netflix.com/) - UI/UX inspiration
- [Disney+](https://www.disneyplus.com/) - Design patterns
- [Prime Video](https://www.primevideo.com/) - Feature ideas

### Data Sources

- [TMDB](https://www.themoviedb.org/) - Movie and series information
- [IMDb](https://www.imdb.com/) - Ratings and metadata

---

## 🔒 Security

### Security Features Implemented

- ✅ Password hashing with Werkzeug
- ✅ Session-based authentication
- ✅ CSRF protection (Flask built-in)
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ XSS protection (Jinja2 auto-escaping)
- ✅ Secure password reset flow
- ✅ Time-limited OTP validation

### Security Best Practices

1. **Change default secret key in production**
2. **Use environment variables for sensitive data**
3. **Enable HTTPS in production**
4. **Regularly update dependencies**
5. **Implement rate limiting for API endpoints**
6. **Set up proper CORS policies**
7. **Use PostgreSQL in production (not SQLite)**

---

## 🐛 Known Issues

- Email functionality requires Gmail App Password
- SQLite not recommended for production
- No actual video streaming (UI only)
- Continue watching progress not persisted in backend
- Search functionality is frontend-only

---

## 📊 Performance

- **Page Load Time:** < 2 seconds
- **Database Queries:** Optimized with SQLAlchemy
- **Responsive Design:** Mobile-first approach
- **Image Optimization:** Lazy loading implemented
- **Caching:** Browser caching enabled for static assets

---

## ⚠️ Disclaimer

**Important Notice:**

This project is created for **educational and portfolio purposes only**. StreamFlix is a demonstration of full-stack web development skills and does **NOT**:

- Host, store, or distribute any copyrighted content
- Provide actual video streaming capabilities
- Infringe on any intellectual property rights
- Compete with legitimate streaming services
- Store or process payment information

All content data (movies, series information) is used for demonstration purposes only. Users are responsible for complying with all applicable laws and regulations in their jurisdiction.

---

## 💡 Support

If you found this project helpful, please consider:

- ⭐ **Starring the repository**
- 🐛 **Reporting bugs**
- 💡 **Suggesting new features**
- 🤝 **Contributing to the codebase**
- 📢 **Sharing with others**

---

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial release
- Complete authentication system
- User profile management
- Dynamic content loading
- Responsive UI design
- Continue watching feature
- Web series with episode management

---

<div align="center">

**Made with ❤️ by [Jay Mondal](https://github.com/jaymondal45)**

[![GitHub followers](https://img.shields.io/github/followers/jaymondal45?style=social)](https://github.com/jaymondal45)
[![GitHub stars](https://img.shields.io/github/stars/jaymondal45/StreamFlix?style=social)](https://github.com/jaymondal45/StreamFlix)

⭐ **Star this repo if you find it helpful!** ⭐

---

**StreamFlix** | Bringing Entertainment Home

</div>
