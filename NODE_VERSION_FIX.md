# Node.js Version Issue

## Problem
You're using Node.js v23.11.0, which is very new and may have compatibility issues with Next.js 14.2.0.

## Solution

### Option 1: Use Node Version Manager (nvm) - RECOMMENDED

1. Install nvm if you don't have it:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Install and use Node.js 20 (LTS - recommended):
   ```bash
   nvm install 20
   nvm use 20
   ```

3. Verify:
   ```bash
   node --version  # Should show v20.x.x
   ```

4. Reinstall dependencies:
   ```bash
   cd /Users/nijdave/Documents/Strava_yearend
   rm -rf node_modules package-lock.json
   npm install
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Option 2: Use Node.js 18 (also compatible)

```bash
nvm install 18
nvm use 18
```

### Option 3: Try with current Node but add compatibility flag

Add to `package.json` scripts:
```json
"dev": "NODE_OPTIONS='--no-experimental-fetch' next dev"
```

## Why This Happens
Next.js 14.2.0 was tested with Node.js 18 and 20. Node.js 23 is very new and may have breaking changes that Next.js hasn't adapted to yet.

