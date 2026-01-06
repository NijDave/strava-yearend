# Strava API Application Setup - Step by Step

## Form Fields Guide

### 1. Application Name
**Issue:** "App name does not comply with our Brand Guidelines"

**Solution:** 
- Don't use "Strava" in the name
- Use something like:
  - `Year-End Activity Tracker`
  - `My Activity Dashboard`
  - `Activity Year Review`
  - `Personal Activity Tracker`
  - `Yearly Activity Stats`

**Avoid:**
- ❌ "Strava Year-End" (contains "Strava")
- ❌ "Strava App"
- ✅ "Year-End Activity Tracker" (no "Strava" in name)

### 2. Category
**Issue:** Can't find "Website" option

**Solution:**
The category options may have changed. Try these:
- **"Website"** (if available)
- **"Web"** (alternative)
- **"Other"** (if Website/Web not available)
- **"Personal Project"** (if available)

If you don't see Website, use **"Other"** - it will work fine.

### 3. Website
**Required field - Enter:**
```
http://localhost:3000
```

### 4. Application Description
**Required field - Enter something like:**
```
Personal activity tracking and year-end statistics dashboard
```
or
```
View and organize your activities by year with detailed statistics
```

### 5. Authorization Callback Domain
**IMPORTANT - This is the key field!**

**Enter (without http://):**
```
localhost:3000
```

**NOT:**
- ❌ `http://localhost:3000`
- ❌ `localhost:3000/`
- ❌ `http://localhost:3000/api/strava/callback`
- ✅ `localhost:3000` (correct!)

### 6. Club
**Optional** - Leave blank

### 7. Terms of Service URL
**Optional** - Leave blank for now

### 8. Privacy Policy URL
**Optional** - Leave blank for now

## Complete Example Form

```
Application Name: Year-End Activity Tracker
Category: Other (or Website if available)
Website: http://localhost:3000
Application Description: Personal activity tracking and year-end statistics dashboard
Authorization Callback Domain: localhost:3000
Club: (leave blank)
Terms of Service URL: (leave blank)
Privacy Policy URL: (leave blank)
```

## After Creating

1. You'll see your **Client ID** (a number like `12345`)
2. You'll see your **Client Secret** (a long string)
3. Copy both to your `.env.local` file

## Troubleshooting

**If you get "App name does not comply":**
- Remove "Strava" from the name
- Use a generic name like "Activity Tracker"

**If Website category is missing:**
- Use "Other" - it works the same way

**If form won't submit:**
- Make sure all required fields are filled
- Check that Authorization Callback Domain is exactly: `localhost:3000` (no http://)

