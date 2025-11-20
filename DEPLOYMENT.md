# Deployment Guide - Option 1

## Overview
- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Railway

## Step 1: Deploy Backend to Railway

### Option A: Using Railway Web Interface (Recommended)

1. **Go to Railway**: https://railway.app/
2. **Sign up/Login** with GitHub
3. **Create New Project** → "Deploy from GitHub repo"
4. **Select** your backend repository (or upload the backend folder)
5. **Configure**:
   - Root Directory: `backend` (if monorepo) or `.` (if separate repo)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. **Add Environment Variables**:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   JWT_SECRET=your_jwt_secret
   PORT=3000
   NODE_ENV=production
   ```
7. **Deploy** and wait for deployment to complete
8. **Copy the Railway URL** (e.g., `https://your-app.up.railway.app`)

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend folder
cd backend

# Initialize and deploy
railway init
railway up

# Add environment variables
railway variables set GEMINI_API_KEY=your_key
railway variables set JWT_SECRET=your_secret
railway variables set NODE_ENV=production
```

## Step 2: Update Frontend Configuration

1. **Update `.env.production`** with your Railway backend URL:
   ```
   VITE_API_URL=https://your-app.up.railway.app/api
   ```

## Step 3: Deploy Frontend to Vercel

### Option A: Using Vercel Web Interface (Recommended)

1. **Go to Vercel**: https://vercel.com/
2. **Sign up/Login** with GitHub
3. **Import Project** → Select your frontend repo
4. **Configure**:
   - Framework Preset: Vite
   - Root Directory: `frontend` (if monorepo) or `.` (if separate)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Add Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://your-app.up.railway.app/api`
6. **Deploy**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? N (first time)
# - Project name: career-roadmap
# - Directory: ./
# - Override settings? N

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://your-app.up.railway.app/api

# Deploy to production
vercel --prod
```

## Step 4: Configure CORS on Backend

Update `backend/src/index.ts` to allow your Vercel domain:

```typescript
app.use(cors({
    origin: [
        'http://localhost:5173', // Development
        'https://your-vercel-app.vercel.app' // Production
    ]
}));
```

Redeploy backend after this change.

## Step 5: Test Deployment

1. Visit your Vercel URL
2. Register a new account
3. Upload a resume
4. Fill out questionnaire
5. Verify roadmap generation works

## Troubleshooting

### Backend Issues:
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure database file is created (SQLite)

### Frontend Issues:
- Check browser console for API errors
- Verify VITE_API_URL is correct
- Check CORS configuration

### API Connection Issues:
- Test backend endpoint directly: `https://your-railway-url.app/api`
- Verify Railway app is running
- Check if API requests have correct headers

## URLs to Keep

After deployment, save these:
- **Frontend URL**: `https://your-app.vercel.app`
- **Backend URL**: `https://your-app.up.railway.app`
- **API Endpoint**: `https://your-app.up.railway.app/api`

## Cost

- **Vercel**: Free tier (plenty for this app)
- **Railway**: Free $5 credit/month (should cover development usage)

## Next Steps

Once deployed and tested, you can:
1. Add custom domain
2. Set up monitoring
3. Add analytics
4. Implement additional features
