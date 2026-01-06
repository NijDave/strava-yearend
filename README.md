# Strava Year-End Application

A full-stack Next.js application that connects to your Strava account and displays all your activities organized by year with beautiful statistics and filtering.

## Features

- 🔐 **Multiple Authentication Methods**
  - Email/Password registration and login
  - Google OAuth
  - Apple OAuth

- 🚴 **Strava Integration**
  - Connect your Strava account via OAuth
  - Automatic activity synchronization
  - Real-time updates via webhooks

- 📊 **Activity Management**
  - View all activities organized by year
  - Year-wise statistics (total distance, time, activity count)
  - Beautiful activity cards with details
  - Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- API credentials for:
  - Google OAuth
  - Apple OAuth (optional)
  - Strava API

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/strava-yearend

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth (optional)
APPLE_ID=your-apple-client-id
APPLE_SECRET=your-apple-client-secret
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key

# Strava API
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# Strava Webhook (optional)
STRAVA_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
```

3. Generate a NextAuth secret:

```bash
openssl rand -base64 32
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Up API Keys

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

### Apple OAuth

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a new App ID with Sign in with Apple capability
3. Create a Service ID
4. Configure Sign in with Apple
5. Create a Key with Sign in with Apple enabled
6. Add the credentials to your `.env.local`

### Strava API

1. Go to [Strava Developers](https://www.strava.com/settings/api)
2. Create a new application
3. Set the Authorization Callback Domain to `localhost:3000`
4. Copy the Client ID and Client Secret to your `.env.local`
5. The redirect URI should be: `http://localhost:3000/api/strava/callback`

### Strava Webhook (Optional)

1. Use a tool like ngrok to expose your local server: `ngrok http 3000`
2. Go to [Strava Webhook Settings](https://www.strava.com/settings/api)
3. Create a webhook subscription pointing to your ngrok URL: `https://your-ngrok-url.ngrok.io/api/strava/webhook`
4. Set the verify token in your `.env.local`

## Project Structure

```
strava-yearend/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── dashboard/        # Dashboard components
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # MongoDB connection
│   └── strava.ts         # Strava API client
├── models/                # Mongoose models
└── types/                 # TypeScript types
```

## Usage

1. **Register/Login**: Create an account or sign in with Google/Apple
2. **Connect Strava**: Click "Connect Strava Account" on the dashboard
3. **Authorize**: Authorize the app in Strava
4. **View Activities**: Your activities will be automatically synced and displayed by year
5. **Filter by Year**: Click on any year to filter activities
6. **Sync**: Click "Sync Activities" to manually refresh your activities

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **NextAuth.js** - Authentication
- **MongoDB + Mongoose** - Database
- **Tailwind CSS** - Styling
- **Strava API** - Activity data

## License

MIT

