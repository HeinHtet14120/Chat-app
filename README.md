# Real-Time Chat Application

A real-time chat application built with Django and React, featuring WebSocket communication for instant messaging.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Features

✨ **Key Features**
- Real-time messaging using WebSocket
- Public and private chat rooms
- User authentication
- Room creation and management
- Discord-like interface
- User presence indicators
- Message history

## Prerequisites

Before you begin, ensure you have installed:

- Python 3.8+
- Node.js 14+
- PostgreSQL
- Redis (for WebSocket support)
- Git

## Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/HeinHtet14120/Chat-app.git
   cd Chat-app
   ```

2. **Create and activate virtual environment**
   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate on Windows
   venv\Scripts\activate

   # Activate on macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create `.env` file in the backend directory:
   ```env
   DEBUG=True
   SECRET_KEY=hp$_xtnm#-js$_g3&_f+ft*_+n5a!lw+nibhqra8%xe36infs-
   DB_NAME=chatapp_db
   DB_USER=heinhtet
   DB_PASSWORD=heintothehtet
   DB_HOST=localhost
   DB_PORT=5432
   ```

5. **Setup PostgreSQL Database**
   ```bash
   # Access PostgreSQL
   psql

   # Create database
   CREATE DATABASE chatapp_db;

   # Create user
   CREATE USER heinhtet WITH PASSWORD 'heintothehtet';

   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE chatapp_db TO heinhtet;
   ```

6. **Run Migrations**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

### Frontend Setup

1. **Install Node dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**
   
   Create `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_WS_URL=ws://localhost:8000/ws
   ```

## Running the Application

1. **Start Redis Server**
   ```bash
   # On Windows (if using WSL or Redis Windows)
   redis-server

   # On macOS (using Homebrew)
   brew services start redis

   # On Linux
   sudo service redis-server start
   ```

2. **Start the Backend Server**
   ```bash
   cd backend
   daphne -b 0.0.0.0 -p 8000 core.asgi:application
   ```

3. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin Interface: http://localhost:8000/admin

## API Documentation

### Authentication Endpoints
- `POST /api/token/` - Obtain authentication token
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

### Chat Room Endpoints
- `GET /api/rooms/` - List all accessible rooms
- `POST /api/rooms/` - Create new room
  ```json
  {
    "name": "Room Name",
    "is_private": false
  }
  ```
- `POST /api/rooms/{id}/join_room/` - Join a room
- `GET /api/rooms/{id}/messages/` - Get room messages

### User Endpoints
- `GET /api/users/` - List all users
- `GET /api/profiles/me/` - Get current user profile

## Troubleshooting

### Common Issues and Solutions

1. **WebSocket Connection Failed**
   - Ensure Redis server is running
   - Check CORS settings in backend
   - Verify WebSocket URL in frontend

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo service postgresql status

   # Create database
   createdb chatapp_db
   ```

3. **Authentication Issues**
   - Clear browser cookies and localStorage
   - Verify token expiration
   - Check API responses in browser console

### Error Messages

| Error | Solution |
|-------|----------|
| 403 Forbidden | Check authentication token |
| WebSocket connection failed | Verify Redis and WebSocket URL |
| Database connection failed | Check PostgreSQL credentials |

## Project Structure

```
project/
├── backend/
│   ├── core/
│   ├── chat/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── README.md
└── README.md
```

## Development Guidelines

1. **Code Style**
   - Follow PEP 8 for Python code
   - Use ESLint for JavaScript/React code
   - Write meaningful commit messages

2. **Testing**
   ```bash
   # Backend tests
   python manage.py test

   # Frontend tests
   npm test
   ```

3. **Making Changes**
   - Create feature branches
   - Write tests for new features
   - Update documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For support or queries, please contact:
- GitHub Issues: [Create an issue](https://github.com/HeinHtet14120/Chat-app/issues)
