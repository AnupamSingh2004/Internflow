# Internflow Project Structure

## 1. Overview

Internflow is a full-stack web application with a microservices architecture, containerized using Docker. The application consists of:

- **Django Backend**: REST API server built with Django and Django REST Framework
- **Next.js Frontend**: Modern React-based web UI using Next.js
- **PostgreSQL Database**: Relational database for data storage
- **Nginx**: Reverse proxy for production deployment

The project follows a modern development workflow with separate configurations for development and production environments.

## 2. Root Directory Structure

```
/home/divanshu/Desktop/WebD/Internflow/
├── backend/                   # Django backend application
├── docker/                    # Docker configuration files
│   ├── backend/               # Backend Docker setup
│   ├── frontend/              # Frontend Docker setup
│   └── nginx/                 # Nginx configuration for production
├── docker-compose.yml         # Development Docker configuration
├── docker-compose.prod.yml    # Production Docker configuration
├── .env                       # Environment variables for development
├── .env.prod                  # Environment variables for production
├── frontend/                  # Next.js frontend application
├── media/                     # User-uploaded media files
│   ├── profile_pictures/      # User profile pictures
│   └── submissions/           # User submissions
├── scripts/                   # Utility scripts
│   ├── init_dev.sh            # Development initialization script
│   └── migrate.sh             # Database migration script
└── static/                    # Static files (CSS, JS, images)
```

## 3. Docker Configuration

### 3.1 Development Environment (`docker-compose.yml`)

```yaml
services:
  # PostgreSQL for development
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: internflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    ports:
      - "5432:5432"

  # Django Backend (dev)
  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile
    env_file:
      - ./.env
    volumes:
      - ./backend:/app
      - ./media:/media
      - ./static:/static
    working_dir: /app
    command: >
      bash -lc "
        python manage.py makemigrations &&
        python manage.py migrate &&
        python manage.py runserver 0.0.0.0:8000
      "
    ports:
      - "8000:8000"
    depends_on:
      - db

  # Next.js Frontend (dev)
  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
    env_file:
      - ./.env
    volumes:
      - ./frontend:/app
    working_dir: /app
    command: npm run dev
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Key features:
- Development mode uses volume mounts for hot-reloading
- Django runs with the development server
- Next.js runs with development server and Turbopack
- PostgreSQL data persisted in a Docker volume

### 3.2 Production Environment (`docker-compose.prod.yml`)

```yaml
version: "3.8"

services:
  # PostgreSQL for production
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: prismeet
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data/

  # Django Backend (prod)
  backend:
    build:
      context: ./docker/backend
    env_file:
      - ./.env.prod
    expose:
      - "8000"
    working_dir: /app
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    depends_on:
      - db

  # Next.js Frontend (prod)
  frontend:
    build:
      context: ./docker/frontend
    env_file:
      - ./.env.prod
    expose:
      - "3000"
    working_dir: /app
    command: bash -lc "npm run build && npm run start"
    depends_on:
      - backend

  # Nginx as reverse proxy
  nginx:
    build:
      context: ./docker/nginx
    ports:
      - "80:80"
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
```

Key differences in production:
- Uses Gunicorn instead of Django development server
- Next.js runs in production mode
- Nginx serves as a reverse proxy
- Only the Nginx service exposes ports to the host
- Uses production environment variables

### 3.3 Docker Build Files

#### Backend Dockerfile (`docker/backend/Dockerfile`)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential \
  libpq-dev \
  ffmpeg \
  python3-magic \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY ../../backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt
RUN python -m spacy download en_core_web_lg

# Copy project files
COPY ../../backend /app

# Make media/static dirs
RUN mkdir -p /media /static

CMD ["bash", "-c", "python manage.py makemigrations authentication && python manage.py migrate && python manage.py createsuperuser && python manage.py runserver 0.0.0.0:8000"]
```

#### Frontend Dockerfile (`docker/frontend/Dockerfile`)

```dockerfile
FROM node:18-bullseye-slim

RUN apt-get update && apt-get install -y \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ../frontend/package*.json /app/
RUN npm config set registry https://registry.npmmirror.com/ && npm ci

COPY ../frontend /app

# Set environment variables for better Turbopack compatibility
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBOPACK=1

CMD ["npm", "run", "dev"]
```

#### Nginx Configuration (`docker/nginx/default.conf`)

```nginx
server {
    listen 80;

    # 1) Route all non-API traffic to Next.js frontend
    location / {
        proxy_pass         http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 2) Route /api/ calls to Django backend
    location /api/ {
        proxy_pass       http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 3) Serve media & static directly (if you later collectstatic to /static/)
    location /media/ {
        alias /media/;
    }
    location /static/ {
        alias /static/;
    }
}
```

## 4. Backend Structure (Django)

```
backend/
├── competitions/           # Django app for competitions
├── config/                 # Project settings and configuration
├── emails/                 # Email templates
├── .env                    # Backend environment variables
├── manage.py               # Django command-line utility
├── media/                  # Media files (user uploads)
├── profiles/               # Django app for user profiles
├── requirements.txt        # Python dependencies
└── user_auth/              # Django app for authentication
```

### 4.1 Backend Dependencies

Key Django packages:
- Django 4.2
- Django REST Framework
- Djoser for authentication
- Django REST Framework SimpleJWT for token auth
- Social Auth for third-party authentication
- PostgreSQL adapters
- Whitenoise for serving static files
- Gunicorn for production deployment
- Additional libraries for document processing (PyMuPDF, python-docx)
- Spacy for NLP functionality

## 5. Frontend Structure (Next.js)

```
frontend/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin interface
│   ├── (auth)/             # Authentication-related routes
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── reset-password/
│   │   └── signup/
│   ├── companies/          # Companies pages
│   ├── competitions/       # Competition-related pages
│   │   ├── create/
│   │   └── [id]/           # Dynamic route for competition details
│   │       ├── edit/
│   │       └── submissions/
│   ├── internships/        # Internship listings
│   ├── invitations/        # User invitations
│   ├── jobs/               # Job listings
│   ├── my-competitions/    # User's competitions
│   ├── profile/            # User profile page
│   └── verify-email/       # Email verification
├── components/             # Reusable React components
│   ├── competitions/       # Competition-specific components
│   └── ui/                 # General UI components
├── contexts/               # React context providers
├── lib/                    # Utility functions and helpers
├── package.json            # Frontend dependencies
├── public/                 # Static assets
└── types/                  # TypeScript type definitions
```

### 5.1 Frontend Dependencies

Key frontend packages:
- Next.js 15.3
- React 19
- React Hook Form for form handling
- Zod for validation
- TailwindCSS for styling
- Radix UI for accessible components
- Axios for API requests
- Next Auth for authentication
- Material UI components
- React Router for client-side routing
- Various UI utilities and components

## 6. Data Flow and Component Interaction

### 6.1 Development Environment

In development:
1. **Frontend** (localhost:3000):
   - Next.js server with hot module reloading
   - Makes API calls directly to the backend

2. **Backend** (localhost:8000):
   - Django development server
   - Serves REST API endpoints
   - Connects to PostgreSQL database

3. **Database** (localhost:5432):
   - PostgreSQL instance
   - Data persisted in Docker volume

### 6.2 Production Environment

In production:
1. **Nginx** (port 80):
   - Receives all incoming HTTP requests
   - Routes `/api/*` requests to the backend
   - Routes all other requests to the frontend
   - Serves static and media files directly

2. **Frontend**:
   - Next.js in production mode
   - Server-side rendering for optimized performance
   - Makes API calls to `/api/*` routes

3. **Backend**:
   - Gunicorn WSGI server running Django
   - Handles all API requests
   - Connects to PostgreSQL database

4. **Database**:
   - PostgreSQL instance
   - Data persisted in Docker volume

## 7. Environment Variables

The project uses two environment files:
- `.env` for development
- `.env.prod` for production

These files contain:
- Database connection details
- Secret keys
- API endpoints
- Authentication settings
- Other configuration parameters

## 8. Static and Media Files

- `/static/`: Contains CSS, JavaScript, and other static assets
  - In development: Served by Django's development server
  - In production: Collected using Django's collectstatic and served by Nginx

- `/media/`: Contains user-uploaded files
  - `profile_pictures/`: User profile images
  - `submissions/`: Files submitted by users
  - In both environments: Served either by Django or Nginx

## 9. Conclusion

Internflow uses a modern containerized architecture that separates concerns between the frontend, backend, and database services. Docker Compose orchestrates the entire application stack with different configurations for development and production environments.

The Django backend provides a robust API while the Next.js frontend delivers a responsive user interface. The use of Docker ensures consistency across development and production environments while providing isolation between services.

