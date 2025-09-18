# CallingItNow

A web app where users record predictions ("Calls") about future events. Predictions are time-stamped, tied to user accounts, and can be public or private. Users can vote on, back, and categorize calls.

## Tech Stack

- **Frontend**: Next.js (React, App Router) with TailwindCSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Auth**: JWT + Google OAuth + email/password
- **Hosting**: DigitalOcean App Platform

## Project Structure

```
callingitnow/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── docker-compose.yml # Local development setup
├── .env.example       # Environment variables template
└── README.md         # This file
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or use Docker)
- Docker & Docker Compose (optional, for local development)

### Local Development

1. Clone and setup:
```bash
cd callingitnow
cp .env.example .env
# Edit .env with your configuration
```

2. Start with Docker Compose:
```bash
docker-compose up -d
```

3. Or run services individually:

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Core Features

- **User Accounts**: Register/login with email+password or Google OAuth
- **Predictions (Calls)**: Create, view, and categorize predictions
- **Voting & Backing**: Support predictions with votes and backing
- **Groups/Boards**: Private or semi-public prediction groups
- **Leaderboards**: Top calls, creators, and categories
- **Moderation**: Content filtering and reporting system

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

Configured for DigitalOcean App Platform with:
- Next.js web service
- FastAPI API service
- Managed PostgreSQL database

## License

MIT License
