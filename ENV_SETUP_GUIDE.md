# Environment Variables Setup Guide

## Quick Setup

Run the setup script to create your `.env.local` file:

```bash
chmod +x setup-env.sh
./setup-env.sh
```

Or manually create `.env.local` in the root directory with the template below.

## Required Environment Variables

### 1. MongoDB URI

**For Local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/strava-yearend
```

**For MongoDB Atlas (Cloud):**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Click "Connect" → "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database password
8. Replace `<dbname>` with `strava-yearend`

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/strava-yearend?retryWrites=true&w=majority
```

### 2. NextAuth Configuration

**NEXTAUTH_URL:**
```
NEXTAUTH_URL=http://localhost:3000
```
(Change to your production URL when deploying)

**NEXTAUTH_SECRET:**
Generate a random secret:
```bash
openssl rand -base64 32
```

Or use this one (already generated):
```
NEXTAUTH_SECRET=eFyXHuOHwbU/MoqucDRKiwN6ZV6mZdxEtxgnxX3J3WA=
```

### 3. Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click "Select a project" → "New Project"
   - Give it a name (e.g., "Strava Year-End")

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: Strava Year-End
     - User support email: your email
     - Developer contact: your email
     - Click "Save and Continue" through the steps

5. **Create OAuth Client ID**
   - Application type: Web application
   - Name: Strava Year-End (or any name)
   - Authorized redirect URIs: 
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click "Create"

6. **Copy Credentials**
   - Copy the "Client ID" → `GOOGLE_CLIENT_ID`
   - Copy the "Client secret" → `GOOGLE_CLIENT_SECRET`

### 4. Apple OAuth Setup (Optional)

Apple OAuth is more complex. You can skip this if you only want Google and email/password.

If you want to set it up:
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID with "Sign in with Apple" capability
3. Create a Service ID
4. Configure Sign in with Apple
5. Create a Key with Sign in with Apple enabled
6. Add the credentials to `.env.local`

**Note:** For development, you can leave Apple OAuth empty and it will be disabled.

### 5. Strava API Setup

1. **Go to Strava API Settings**
   - Visit: https://www.strava.com/settings/api
   - Log in with your Strava account

2. **Create an Application**
   - Click "Create App" or "My API Application"
   - Fill in the form:
     - **Application Name**: Strava Year-End (or any name)
     - **Category**: Website
     - **Website**: http://localhost:3000
     - **Application Description**: Personal activity tracker
     - **Authorization Callback Domain**: `localhost:3000`
     - **Terms of Service URL**: (optional)
     - **Privacy Policy URL**: (optional)

3. **Get Your Credentials**
   - After creating, you'll see:
     - **Client ID** → `STRAVA_CLIENT_ID`
     - **Client Secret** → `STRAVA_CLIENT_SECRET`

4. **Update .env.local**
   ```
   STRAVA_CLIENT_ID=your-client-id-here
   STRAVA_CLIENT_SECRET=your-client-secret-here
   STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
   ```

### 6. Strava Webhook (Optional)

Only needed if you want real-time activity updates. For now, you can skip this.

## Complete .env.local Template

```env
# Database
MONGODB_URI=mongodb://localhost:27017/strava-yearend

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=eFyXHuOHwbU/MoqucDRKiwN6ZV6mZdxEtxgnxX3J3WA=

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Apple OAuth (Optional - leave empty if not using)
APPLE_ID=
APPLE_SECRET=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

# Strava API
STRAVA_CLIENT_ID=your-strava-client-id-here
STRAVA_CLIENT_SECRET=your-strava-client-secret-here
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# Strava Webhook (Optional)
STRAVA_WEBHOOK_VERIFY_TOKEN=
```

## Verification

After setting up, verify your `.env.local` file:
- ✅ All required variables are filled (except optional ones)
- ✅ No quotes around values (unless the value itself contains spaces)
- ✅ MongoDB URI is correct
- ✅ Strava redirect URI matches exactly: `http://localhost:3000/api/strava/callback`

## Troubleshooting

**"MongoDB connection failed"**
- Check if MongoDB is running: `mongod --version`
- Verify the connection string format
- For Atlas, check IP whitelist

**"OAuth not working"**
- Verify redirect URIs match exactly (no trailing slashes)
- Check API keys are correct (no extra spaces)
- Ensure OAuth consent screen is configured (Google)

**"Strava connection fails"**
- Verify callback domain is set to `localhost:3000` (no http://)
- Check Client ID and Secret are correct
- Ensure redirect URI matches: `http://localhost:3000/api/strava/callback`

## Next Steps

Once `.env.local` is set up:
1. Run `npm install` (if not done)
2. Start MongoDB (if using local)
3. Run `npm run dev`
4. Open http://localhost:3000

