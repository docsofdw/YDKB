# Vercel Deployment Checklist

## Pre-Deployment Steps

1. ✅ Create `.env.example` file as template for environment variables
2. ✅ Update `.gitignore` to exclude sensitive files
3. ✅ Optimize `next.config.js` for production
4. ✅ Enhance security headers in `vercel.json`
5. ✅ Add metadata for SEO optimization
6. ✅ Add deployment documentation

## Environment Variables to Set in Vercel Dashboard

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_SITE_URL` | Production site URL | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Site name | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Clerk sign-in URL | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk sign-up URL | Yes |
| `ADMIN_API_KEY` | Admin API access key | Yes |
| `CRON_SECRET` | Secret for cron job authentication | Yes |
| `THESPORTSDB_API_KEY` | TheSportsDB API key | Yes |

## Deployment Steps

1. **Push to GitHub**
   - Ensure all necessary changes are committed
   - Push to your GitHub repository

2. **Connect to Vercel**
   - Create a new project in Vercel
   - Connect to your GitHub repository
   - Configure project settings:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`
     - Node.js Version: 18.x

3. **Environment Setup**
   - Add all environment variables from the above table
   - Ensure production URLs are used for production deployment

4. **Deploy**
   - Click "Deploy" in the Vercel dashboard
   - Monitor build logs for any errors

## Post-Deployment Verification

1. **Test Application**
   - Ensure all pages load correctly
   - Test login/signup functionality
   - Verify API routes work as expected

2. **Performance Check**
   - Run Lighthouse test for performance metrics
   - Check Core Web Vitals in Google Search Console

3. **Security Verification**
   - Ensure environment variables are set correctly
   - Verify security headers are applied correctly

## Troubleshooting Common Issues

- **Build Failures**: Check build logs for specific errors
- **API 500 Errors**: Verify environment variables are set correctly
- **Authentication Issues**: Check Clerk configuration
- **Database Connection Problems**: Verify Supabase credentials and connection

## Continuous Deployment

The repository is configured for continuous deployment. Any push to the main branch will trigger a new deployment on Vercel.

To disable automatic deployments:
1. Go to your project settings in Vercel
2. Navigate to Git tab
3. Disable "Auto Deployments" 