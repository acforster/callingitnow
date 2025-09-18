# Quick Start: Hosting Requirements

## What You Need From DigitalOcean

### 1. JWT Secret (Required)
**What it is**: A secure random string used to sign authentication tokens.

**How to generate** (run on your local computer):
```python
# Open Python on your computer (Windows: python, Mac/Linux: python3)
import secrets
print(secrets.token_urlsafe(32))
```
**Example output**: `xvz9k2mN8pQ7rL5wE3tY6uI1oP4sA0dF9gH2jK8lM7nB5vC3xZ`

**Where to use**: Copy this value and set as `JWT_SECRET` environment variable in DigitalOcean dashboard

### 2. Database Connection (Auto-provided)
**What it is**: PostgreSQL database connection string.

**DigitalOcean provides**: `${db.DATABASE_URL}` automatically
**Format**: `postgresql://doadmin:password@host:25060/defaultdb?sslmode=require`

**You don't need to generate this** - DigitalOcean creates it when you deploy.

### 3. Google OAuth (Optional)
**What it is**: Credentials for "Sign in with Google" feature.

**How to get**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/) in your web browser
2. Create project → Enable Google+ API → Create OAuth 2.0 credentials
3. Set redirect URI to: `https://your-app.ondigitalocean.app/auth/google/callback`

**You get**: 
- `GOOGLE_OAUTH_CLIENT_ID` (looks like: `123456789-abc123.apps.googleusercontent.com`)
- `GOOGLE_OAUTH_CLIENT_SECRET` (looks like: `GOCSPX-abc123def456`)

## Where to Execute Commands

### Local Commands (Your Computer)
Run these in your terminal/command prompt on your local machine:

```bash
# Navigate to your project (Windows Command Prompt or PowerShell)
cd C:\Users\acfor\CascadeProjects\callingitnow

# Initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/callingitnow.git
git branch -M main
git push -u origin main

# Generate JWT secret (Python)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### DigitalOcean Dashboard (Web Browser)
These actions are done in your web browser at [cloud.digitalocean.com](https://cloud.digitalocean.com):

1. **Create App**: Apps → Create App → Connect GitHub
2. **Set Environment Variables**: Your App → Settings → App-Level Environment Variables
3. **Monitor Deployment**: Your App → Activity tab
4. **View Logs**: Your App → Runtime Logs

### DigitalOcean Console (No SSH Required)
For database migrations, use the built-in web console:

1. Go to your app in DigitalOcean dashboard
2. Click on the **"api"** service (your FastAPI backend)
3. Click the **"Console"** tab
4. A terminal will open in your web browser
5. Run the migration command:
```bash
alembic upgrade head
```

**No SSH needed!** DigitalOcean provides a web-based terminal.

### Alternative: Local Database Connection
If you prefer to run migrations from your local computer:

1. **Get database credentials** from DigitalOcean:
   - Go to Databases → your database → Connection Details
   - Copy the connection string

2. **Update your local .env file**:
```bash
# In C:\Users\acfor\CascadeProjects\callingitnow\.env
DATABASE_URL=postgresql://doadmin:your-password@your-host:25060/defaultdb?sslmode=require
```

3. **Run migrations locally**:
```bash
# In your local terminal
cd C:\Users\acfor\CascadeProjects\callingitnow\backend
pip install -r requirements.txt
alembic upgrade head
```

## Deployment Checklist

### Before Deploying (Local Computer):
- [ ] **Generate JWT secret**: Run `python -c "import secrets; print(secrets.token_urlsafe(32))"` 
- [ ] **Push to GitHub**: Initialize git repo and push your code
- [ ] **Update app.yaml**: Edit `.do/app.yaml` with your GitHub repo path

### In DigitalOcean Dashboard (Web Browser):
- [ ] **Create app**: Apps → Create App → Connect to GitHub repo
- [ ] **Set JWT_SECRET**: Settings → App-Level Environment Variables
- [ ] **Set Google OAuth** (optional): Add client ID and secret
- [ ] **Deploy**: Click "Create Resources" and wait ~10 minutes

### After Deployment (DigitalOcean Console):
- [ ] **Run migrations**: Go to api service → Console tab → `alembic upgrade head`
- [ ] **Test the app**: Visit your frontend URL and try registering/login
- [ ] **Create test prediction**: Verify core functionality works

## Environment Variables Summary

**Set these in DigitalOcean Dashboard → Settings → App-Level Environment Variables:**

**Required**:
```
JWT_SECRET=your-generated-secret-here
```

**Optional**:
```
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
```

**Auto-provided by DigitalOcean** (don't set these):
- `DATABASE_URL` (from managed PostgreSQL)
- Service URLs for frontend/backend communication

## Command Execution Summary

| Task | Where | How |
|------|-------|-----|
| Generate JWT secret | Your computer | Python command in terminal |
| Push code to GitHub | Your computer | Git commands in terminal |
| Create DigitalOcean app | Web browser | DigitalOcean dashboard |
| Set environment variables | Web browser | DigitalOcean dashboard |
| Run database migrations | Web browser | DigitalOcean console tab |
| View logs/monitor | Web browser | DigitalOcean dashboard |

## Cost: ~$25/month
- Frontend service: $5/month
- Backend service: $5/month  
- PostgreSQL database: $15/month

## Need Help?
1. **Detailed guide**: Check `DEPLOYMENT.md` for step-by-step screenshots
2. **DigitalOcean support**: Chat available in dashboard
3. **View logs**: App Platform → Runtime Logs for debugging
4. **Database issues**: Use DigitalOcean console (no SSH required)
