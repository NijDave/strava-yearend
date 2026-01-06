# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in all required API keys and credentials

3. **Generate NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```
   Add this to `NEXTAUTH_SECRET` in `.env.local`

4. **Start MongoDB**
   - Make sure MongoDB is running locally, or
   - Use MongoDB Atlas (cloud) and update `MONGODB_URI`

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   - Navigate to `http://localhost:3000`

## API Keys Setup

### Google OAuth
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

### Apple OAuth (Optional)
1. Visit [Apple Developer Portal](https://developer.apple.com/)
2. Create App ID with Sign in with Apple
3. Create Service ID and configure
4. Create Key for Sign in with Apple

### Strava API
1. Visit [Strava API Settings](https://www.strava.com/settings/api)
2. Create application
3. Set callback domain: `localhost:3000`
4. Copy Client ID and Secret

## Features Implemented

✅ **Authentication**
- Email/Password registration and login
- Google OAuth integration
- Apple OAuth integration
- Secure password hashing with bcrypt
- Session management with NextAuth.js

✅ **Strava Integration**
- OAuth connection flow
- Activity synchronization
- Token refresh handling
- Webhook support for real-time updates

✅ **Activity Display**
- Year-wise organization
- Beautiful activity cards
- Statistics per year (distance, time, count)
- Year filtering
- Mobile-responsive design

✅ **User Experience**
- Loading states
- Error handling
- Smooth transitions
- Touch-friendly mobile interface

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components (auth, dashboard)
- `lib/` - Utility libraries (auth, database, Strava API)
- `models/` - Mongoose schemas (User, Activity)
- `types/` - TypeScript type definitions

## Next Steps

After setup, you can:
1. Register/Login with your preferred method
2. Connect your Strava account
3. View your activities organized by year
4. Filter activities by year
5. See detailed statistics

## Troubleshooting

**MongoDB Connection Issues**
- Ensure MongoDB is running
- Check `MONGODB_URI` format
- For Atlas, whitelist your IP address

**OAuth Not Working**
- Verify redirect URIs match exactly
- Check API keys are correct
- Ensure callback URLs are properly configured

**Activities Not Syncing**
- Check Strava connection status
- Verify API tokens are valid
- Check browser console for errors

