# Deploying to Vercel

This guide will help you deploy your Research Archive application to Vercel.

## Prerequisites

1. [Vercel Account](https://vercel.com/signup) (free tier available)
2. [Vercel CLI](https://vercel.com/cli) installed: `npm i -g vercel`
3. MongoDB Atlas account (for production database)
4. Cloudinary account (for file storage)

## Pre-Deployment Checklist

### 1. Set Up MongoDB Atlas
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string (should look like: `mongodb+srv://...`)
- Whitelist all IPs (0.0.0.0/0) for serverless access

### 2. Prepare Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGO_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Generate a secure random string (min 32 chars)
- `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` - From Cloudinary
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - If using Google OAuth
- `FRONTEND_URL` - Will be your Vercel app URL (e.g., https://your-app.vercel.app)

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**
   - In Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Set them for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Method 2: Deploy via CLI

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy to Production**
   ```bash
   vercel --prod
   ```

3. **Add Environment Variables**
   ```bash
   vercel env add MONGO_URI production
   vercel env add JWT_SECRET production
   vercel env add CLOUD_NAME production
   # ... add all other variables
   ```

4. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

### 1. Update Frontend URL
Once deployed, update the `FRONTEND_URL` environment variable with your actual Vercel URL:
- Go to Project Settings → Environment Variables
- Update `FRONTEND_URL` to your deployed URL (e.g., `https://your-app.vercel.app`)
- Redeploy for changes to take effect

### 2. Update Google OAuth (if applicable)
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Add your Vercel URL to authorized JavaScript origins
- Add `https://your-app.vercel.app/api/auth/google/callback` to authorized redirect URIs

### 3. Update Cloudinary Settings (if needed)
- Ensure your Cloudinary account allows uploads from your Vercel domain

## Architecture Overview

### How It Works on Vercel

- **Frontend**: Static files served from `capstone-frontend/public/`
- **Backend API**: Serverless functions under `/api` route
- **Database**: MongoDB Atlas (external, persistent)
- **File Storage**: Cloudinary (external)

### File Structure
```
research-archived/
├── api/
│   └── index.js              # Serverless API entry point
├── capstone-backend/         # Backend logic (imported by api/)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── config/
├── capstone-frontend/        # Frontend files
│   ├── app.js               # Express server for frontend
│   └── public/              # Static HTML/CSS/JS
├── vercel.json              # Vercel configuration
└── .env.example             # Environment template
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Routes Not Working
- Check that paths start with `/api/`
- Verify environment variables are set
- Check function logs in Vercel Dashboard

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Ensure IP whitelist includes `0.0.0.0/0`
- Check MongoDB Atlas user permissions

### CORS Errors
- Verify `FRONTEND_URL` matches your deployment URL
- Check browser console for specific CORS errors
- Ensure credentials are properly configured

## Monitoring & Maintenance

### View Logs
```bash
vercel logs your-deployment-url
```

### Check Function Execution
- Go to Vercel Dashboard → Your Project → Functions
- View real-time function executions and errors

### Performance Tips
- MongoDB connection is cached for better performance
- Serverless functions have cold start (~1-2s first request)
- Consider upgrading to Vercel Pro for longer execution times

## Limits (Free Tier)

- **Bandwidth**: 100 GB/month
- **Function Execution**: 100 GB-hours/month
- **Function Duration**: 10 seconds max
- **Deployments**: Unlimited

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` environment variable

## Rollback Deployment

If something goes wrong:
```bash
vercel rollback
```

Or select a previous deployment in the Vercel Dashboard.

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- Check function logs for detailed error messages

---

**Note**: Keep your `.env` file secure and never commit it to version control. Always use environment variables in Vercel for sensitive data.
