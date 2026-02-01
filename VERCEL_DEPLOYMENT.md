# Deploying to Vercel

## Steps:

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set Environment Variables in Vercel

Go to your Vercel project settings and add:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase public key

### 4. Deploy
```bash
vercel
```

Or from GitHub:
1. Connect your GitHub repo to Vercel
2. Vercel will auto-detect the configuration
3. Add environment variables in project settings
4. Deploy!

## Configuration

The `vercel.json` file handles:
- Express.js as serverless functions
- Static file serving from `/public`
- API routing to `/api/*`
- Environment variables

## Notes

- Your game will be live at: `https://your-project.vercel.app`
- All API calls use serverless functions
- Supabase credentials stay secure (env vars only)
- Database operations are server-side only
