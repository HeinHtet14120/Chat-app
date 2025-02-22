# Real-Time Chat Application

[previous sections remain the same...]

## Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
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

[rest of the README remains the same...]
