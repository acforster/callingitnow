# DigitalOcean Deployment Guide for CallingItNow

This guide walks you through deploying CallingItNow to DigitalOcean App Platform step by step.

## Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **GitHub Repository**: Your code needs to be in a GitHub repository
3. **Domain Name** (optional): If you want a custom domain like `callingitnow.com`

## Step 1: Prepare Your Repository

### 1.1 Create GitHub Repository
```bash
# Initialize git in your project
cd C:\Users\acfor\CascadeProjects\callingitnow
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/callingitnow.git
git branch -M main
git push -u origin main
```

### 1.2 Update App Configuration
Edit `.do/app.yaml` and replace `your-username/callingitnow` with your actual GitHub repository path.

## Step 2: Generate Required Secrets

### 2.1 JWT Secret
Generate a secure JWT secret key:

**Option A: Using Python**
```python
import secrets
jwt_secret = secrets.token_urlsafe(32)
print(f"JWT_SECRET: {jwt_secret}")
```

**Option B: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option C: Online Generator**
Visit [generate-secret.vercel.app](https://generate-secret.vercel.app/32) for a secure random string.

Save this value - you'll need it for the `JWT_SECRET` environment variable.

### 2.2 Google OAuth Setup (Optional)
If you want Google login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://your-app-name.ondigitalocean.app/auth/google/callback`
   - `https://callingitnow.com/auth/google/callback` (if using custom domain)
7. Save the Client ID and Client Secret

## Step 3: Deploy to DigitalOcean

### 3.1 Create App on DigitalOcean

1. **Login to DigitalOcean**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Navigate to "Apps" in the left sidebar
   - Click "Create App"

2. **Connect GitHub Repository**
   - Choose "GitHub" as source
   - Authorize DigitalOcean to access your GitHub
   - Select your `callingitnow` repository
   - Choose the `main` branch
   - Check "Autodeploy" to deploy on every push

3. **Configure App Settings**
   - DigitalOcean will detect the `.do/app.yaml` file
   - Review the detected configuration
   - The app should show:
     - **web** service (Next.js frontend)
     - **api** service (FastAPI backend)
     - **db** database (PostgreSQL)

### 3.2 Set Environment Variables

In the DigitalOcean dashboard, you need to set these environment variables:

#### Global Environment Variables
Click "Settings" → "App-Level Environment Variables":

```
JWT_SECRET=your-generated-jwt-secret-from-step-2.1
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id (optional)
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret (optional)
```

#### Database Connection
The database URL is automatically provided by DigitalOcean as `${db.DATABASE_URL}` in the app.yaml, so you don't need to set this manually.

### 3.3 Deploy the App

1. Click "Create Resources" to start the deployment
2. DigitalOcean will:
   - Create the PostgreSQL database
   - Build and deploy the FastAPI backend
   - Build and deploy the Next.js frontend
   - Set up networking between services

3. **Wait for deployment** (usually 5-10 minutes)

## Step 4: Access Your Deployed App

### 4.1 Get Your App URLs

After deployment, you'll get URLs like:
- **Frontend**: `https://your-app-name-web-xxxxx.ondigitalocean.app`
- **API**: `https://your-app-name-api-xxxxx.ondigitalocean.app`

### 4.2 Test the Deployment

1. Visit your frontend URL
2. Try creating an account
3. Make a test prediction
4. Verify voting and backing work

## Step 5: Database Setup

### 5.1 Get Database Connection Details

1. In DigitalOcean dashboard, go to "Databases"
2. Click on your `callingitnow-db` database
3. Go to "Connection Details"
4. You'll see:
   - **Host**: `your-db-host.db.ondigitalocean.com`
   - **Port**: `25060`
   - **Database**: `defaultdb`
   - **Username**: `doadmin`
   - **Password**: `[auto-generated]`

### 5.2 Run Database Migrations

**Option A: Using DigitalOcean Console**
1. Go to your API service in the App Platform
2. Click "Console" tab
3. Run migration commands:
```bash
alembic upgrade head
```

**Option B: Local Connection**
```bash
# Update your local .env with production database URL
DATABASE_URL=postgresql://doadmin:password@host:25060/defaultdb?sslmode=require

# Run migrations locally
cd backend
alembic upgrade head
```

## Step 6: Custom Domain Setup (Optional)

### 6.1 Configure Domain in DigitalOcean

1. In your app settings, go to "Domains"
2. Click "Add Domain"
3. Enter your domain: `callingitnow.com`
4. Add www alias: `www.callingitnow.com`

### 6.2 Update DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.):

```
Type: CNAME
Name: @
Value: your-app-name.ondigitalocean.app

Type: CNAME  
Name: www
Value: your-app-name.ondigitalocean.app
```

### 6.3 SSL Certificate

DigitalOcean automatically provisions SSL certificates for custom domains.

## Step 7: Monitoring and Maintenance

### 7.1 View Logs
- Go to your app → "Runtime Logs"
- Monitor both web and api service logs
- Check for errors or performance issues

### 7.2 Database Monitoring
- Go to "Databases" → your database
- Monitor "Metrics" tab for performance
- Set up alerts for high CPU/memory usage

### 7.3 Scaling
- Start with basic-xxs instances ($5/month each)
- Scale up in "Settings" → "Components" as traffic grows
- Enable autoscaling for automatic scaling

## Troubleshooting

### Common Issues

**1. Build Failures**
- Check "Activity" tab for build logs
- Verify all dependencies in package.json/requirements.txt
- Ensure environment variables are set correctly

**2. Database Connection Issues**
- Verify DATABASE_URL is correctly referenced as `${db.DATABASE_URL}`
- Check if database is in same region as app
- Ensure SSL mode is enabled for production

**3. CORS Errors**
- Verify ALLOWED_ORIGINS includes your frontend URL
- Check that API routes are properly configured

**4. Authentication Issues**
- Verify JWT_SECRET is set and consistent
- Check Google OAuth redirect URIs match your domain
- Ensure cookies are secure in production

### Getting Help

- **DigitalOcean Docs**: [docs.digitalocean.com/products/app-platform](https://docs.digitalocean.com/products/app-platform/)
- **Community**: [digitalocean.com/community](https://digitalocean.com/community)
- **Support**: Available through DigitalOcean dashboard

## Cost Estimation

**Monthly Costs (USD)**:
- Web service (basic-xxs): ~$5
- API service (basic-xxs): ~$5  
- Database (dev tier): ~$15
- **Total**: ~$25/month

Scale up as needed based on traffic and performance requirements.

## Security Checklist

- [ ] JWT_SECRET is secure and not exposed
- [ ] Database uses SSL connections
- [ ] CORS is properly configured
- [ ] Environment variables are not in source code
- [ ] Google OAuth redirect URIs are restricted
- [ ] Rate limiting is enabled
- [ ] Content filtering is active
