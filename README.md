# 🚀 InternFlow - Comprehensive Internship Tracking Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)

> **InternFlow** is a comprehensive internship tracking platform that streamlines the job search process with real-time updates, intelligent analytics, and community-driven insights. Track applications, discover opportunities, and land your dream internship.

## ✨ Features

### 🎯 Smart Job Tracking
- **Real-Time Updates** - Live job postings from top companies via API integration
- **Application Dashboard** - Customizable interface to monitor deadlines and status changes
- **Automated Notifications** - Email alerts for new positions matching your preferences
- **Status Management** - Track application progress with automated status updates

### 🤝 Community & Networking
- **Company Forums** - Share experiences, tips, and insights with fellow applicants
- **Network Visualization** - Interactive maps showing your connections at target companies
- **LinkedIn Integration** - Track company employees and their career progression
- **Peer Collaboration** - Connect with other applicants and share strategies

### 📊 Analytics & Insights
- **Hiring Trends** - Data-driven insights on company hiring patterns
- **Success Rates** - Track application success rates across different companies
- **Salary Analytics** - Comprehensive salary insights and benefits comparison
- **Performance Metrics** - Personal application statistics and improvement suggestions

### 🎓 Preparation Resources
- **Company-Specific Prep** - Tailored interview preparation for each target company
- **Resource Library** - Curated interview questions, coding challenges, and tips
- **Mobile App** - On-the-go tracking with instant push notifications
- **Career Guidance** - Personalized recommendations based on your profile

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Django)      │◄──►│ (PostgreSQL)    │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         └──────────────│  (Cache/Queue)  │──────────────┘
                        │   Port: 6379    │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+
- Python 3.11+
- Git

### One-Command Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/internflow.git
cd internflow

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Panel: http://localhost:8000/admin
```

### Development Setup

#### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/yourusername/internflow.git
cd internflow

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

#### 2. Using Docker (Recommended)
```bash
# Build and start services
docker-compose up --build

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

#### 3. Manual Setup (Development)
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
internflow/
├── backend/                 # Django REST API
│   ├── config/             # Django configuration
│   │   ├── __pycache__/    # Python cache files
│   │   ├── __init__.py     # Package initialization
│   │   ├── asgi.py         # ASGI configuration
│   │   ├── settings.py     # Django settings
│   │   ├── urls.py         # URL routing
│   │   └── wsgi.py         # WSGI configuration
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
├── docker/                 # Docker configuration
│   ├── backend/
│   │   └── Dockerfile      # Backend container config
│   ├── frontend/
│   │   └── Dockerfile      # Frontend container config
│   └── nginx/
│       ├── Dockerfile      # Nginx container config
│       └── default.conf    # Nginx configuration
├── frontend/               # Next.js React application
│   ├── app/               # App Router pages
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── public/           # Static assets
│   ├── types/            # TypeScript definitions
│   └── package.json      # Node.js dependencies
├── nginx/                  # Nginx reverse proxy
│   └── default.conf       # Nginx configuration
├── media/                  # User uploaded files
├── static/                 # Django static files
├── scripts/                # Utility scripts
├── .env                    # Environment variables
├── .env.prod              # Production environment
├── .gitignore             # Git ignore rules
├── docker-compose.yml     # Development setup
├── docker-compose.prod.yml # Production setup
└── README.md              # Project documentation
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@db:5432/internflow

# Redis
REDIS_URL=redis://redis:6379/0

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# API Keys
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
OPENAI_API_KEY=your-openai-api-key

# External APIs
GLASSDOOR_API_KEY=your-glassdoor-key
INDEED_API_KEY=your-indeed-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your-linkedin-client-id
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
```

## 🛠️ Development Commands

### Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Execute commands in containers
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run build

# Stop services
docker-compose down
```

### Backend Commands
```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic --noinput

# Start development server
python manage.py runserver
```

### Frontend Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
docker-compose exec backend python manage.py test

# Run with coverage
docker-compose exec backend python -m pytest --cov

# Run specific test file
docker-compose exec backend python manage.py test config.tests
```

### Frontend Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Component tests
npm run test:components
```

## 📊 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Charts**: Recharts + D3.js
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: Django 5.0 + Django REST Framework
- **Language**: Python 3.11
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Background Jobs**: Celery + Celery Beat
- **Authentication**: JWT + OAuth2

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **File Storage**: Local Media/Static directories
- **Email**: SMTP / SendGrid
- **Environment Management**: .env files

## 🚀 Deployment

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Run production migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Environment Setup
1. Set up production environment variables
2. Configure SSL certificates
3. Set up domain and DNS
4. Configure email service
5. Set up monitoring and logging

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new functionality**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/TypeScript
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages

## 📝 API Documentation

### Authentication Endpoints
```
POST /api/auth/register/     # User registration
POST /api/auth/login/        # User login
POST /api/auth/refresh/      # Refresh JWT token
POST /api/auth/logout/       # User logout
```

### Application Endpoints
```
GET    /api/applications/           # List user applications
POST   /api/applications/           # Create new application
GET    /api/applications/{id}/      # Get application details
PUT    /api/applications/{id}/      # Update application
DELETE /api/applications/{id}/      # Delete application
```

### Company Endpoints
```
GET  /api/companies/              # List companies
GET  /api/companies/{id}/         # Company details
GET  /api/companies/{id}/jobs/    # Company job listings
POST /api/companies/{id}/follow/  # Follow company
```

## 🔒 Security

- JWT-based authentication
- CORS configuration
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection protection
- XSS protection
- CSRF protection

## 📈 Performance

- Database query optimization
- Redis caching for frequently accessed data
- Lazy loading for large datasets
- Image optimization and compression
- Gzip compression for static files
- CDN integration ready

## 🎯 Roadmap

### Phase 1 (Current)
- [x] User authentication and profiles
- [x] Basic application tracking
- [x] Company data integration
- [ ] Real-time notifications

### Phase 2
- [ ] Advanced analytics dashboard
- [ ] LinkedIn API integration
- [ ] Mobile app development
- [ ] AI-powered recommendations

### Phase 3
- [ ] Video interview scheduling
- [ ] Resume builder integration
- [ ] Mentorship matching
- [ ] Career path visualization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by modern job tracking platforms
- Built with amazing open-source technologies

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/internflow/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/internflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/internflow/discussions)
- **Email**: support@internflow.dev

---

<div align="center">
  <strong>Made with ❤️ for aspiring interns everywhere</strong>
</div>
