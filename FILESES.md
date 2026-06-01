# Complete Viva Presentation List: Frontend vs Backend Files

Use this guide for your viva. It explicitly separates the visual pages the user sees (Frontend) from the background logic making the data work (Backend). Every single file is broken down in simple terms.

---

# 🎨 LIST 1: FRONTEND FILES (Things the user can see)

These files are your "Views". They are responsible for painting pixels on the screen, showing data to the user, and reacting to clicks.

## The Main Pages (`app/` folder)

### `app/layout.tsx`
**Summary: The master HTML wrapper for the entire website.**
- **Looks like:** You don't "see" it directly, but it loads the background colors and global fonts for every other page.
- **Data shown:** Global layout structure and metadata.
- **API called:** None.

### `app/page.tsx`
**Summary: The welcome screen for brand new, unlogged-in users.**
- **Looks like:** A big landing page pitching the product with login buttons.
- **Data shown:** Static text explaining the features of the Strava Year-End app.
- **API called:** None.

### `app/(auth)/login/page.tsx`
**Summary: The screen where returning users type their passwords.**
- **Looks like:** A simple, clean form asking for Email and Password, or Google Sign-in.
- **Data shown:** Blank input boxes.
- **API called:** Calls `api/auth/...nextauth` when the Login button is pressed.

### `app/(auth)/register/page.tsx`
**Summary: The screen where brand new users create their accounts.**
- **Looks like:** Similar to login, but asks for passwords twice to confirm them.
- **Data shown:** Registration forms.
- **API called:** Calls `api/auth/register` to save the new account.

### `app/dashboard/page.tsx`
**Summary: The most important screen; the master year-end summary.**
- **Looks like:** A glowing, cyberpunk-themed control panel filled with numbers, bar charts, and spinning donuts.
- **Data shown:** Total lifetime miles, monthly breakdowns, and lists of past runs.
- **API called:** Calls `api/statistics/route.ts` to get all the heavy math results.

### `app/activity/[id]/page.tsx`
**Summary: A deep-dive screen for one specific workout.**
- **Looks like:** A giant GPS map on top, with detailed heart rate and speed line-graphs below it.
- **Data shown:** Micro-metrics of a single run, like exact cadence and mile-splits.
- **API called:** Calls `api/strava/activity/[id]` to get that specific workout's data.

### `app/chat/page.tsx`
**Summary: The screen where users talk to the AI Coach.**
- **Looks like:** A classic messaging app (like WhatsApp) where the user types at the bottom.
- **Data shown:** Text bubbles showing the conversation history.
- **API called:** Calls `api/ai/chat/route.ts` every time you hit send.

### `app/roast/page.tsx`
**Summary: The screen displaying the funny, aggressive AI performance review.**
- **Looks like:** A dramatic text box displaying an insulting critique of the user's fitness.
- **Data shown:** AI-generated text output.
- **API called:** Calls `api/ai/roast/route.ts`.

## UI Lego Pieces (`components/` folder)
*These are tiny visual blocks used to build the main pages above.*

### `components/auth/` (Login Forms)
* **`LoginForm.tsx` & `RegisterForm.tsx`**: The actual HTML boxes where users type their email. No APIs called, just visual inputs.
* **`OAuthButtons.tsx`**: The shiny "Sign in with Google" buttons on the login screen.

### `components/dashboard/` (Dashboard Widgets)
* **`CoreSummary.tsx` & `YearEndSummary.tsx`**: The big bold text boxes showing total miles ran. Gets data directly from the Dashboard page.
* **`MonthlyGraphs.tsx`**: The bar chart showing which month was most active.
* **`ActivityList.tsx` & `ActivityCard.tsx`**: The scrolling feed on the side showing all past runs as tiny square tiles.
* **`BestPerformances.tsx`**: The glowing boxes pointing out your fastest and longest single days.
* **`StravaConnect.tsx`**: The huge orange button begging the user to link their Strava account. Calls `api/strava/connect`.
* **`FunFacts.tsx`**: A tiny box displaying AI-generated weird trivia about their year.
* **`TimeOfDayChart.tsx` & `ActivityTypeBreakdown.tsx`**: Circular donut charts showing if they run at night, or if they bike instead of run.
* **`ParticleCanvas.tsx`**: The cool animated background that has dots floating around. Pure visual code, no data used.

### `components/activity/` (Single Run Widgets)
* **`RouteMap.tsx`**: The box containing the interactive map showing the GPS squiggly line.
* **`ElevationGraph.tsx`, `PaceGraph.tsx`, `HeartRateGraph.tsx`, `CadenceGraph.tsx`**: Recharts line-graphs showing how high their heart rate went or how steep the hills were.
* **`MetricsGrid.tsx` & `SplitsTable.tsx`**: Simple spreadsheet-like boxes showing speed per mile.

### `components/ShareActivity/` (Instagram Posters)
* **`OverlayCard.tsx`**: The actual artwork poster combining the map and statistics, ready to be exported.
* **`ShareBottomSheet.tsx` & `ActionButtons.tsx`**: The final buttons that let the user "Save to Camera Roll".

## Frontend Tools (`hooks/`)
*These run in the browser and handle clicking and resizing, but have no backend server logic.*
* **`useIsMobile.ts`**: Checks if the browser window is small (like an iPhone).
* **`useCountUp.ts`**: Makes the numbers in the dashboard visually roll up from 0 to 100 for a cool animation effect.
* **`useClipboardImage.ts` & `useShareSheet.ts`**: Hacks the browser to forcefully copy the generated Instagram image into the user's phone clipboard.


---


# ⚙️ LIST 2: BACKEND FILES (Server logic, no UI)

These files live secretly on your server. The user can never directly touch them or see their code. They handle the databases, the math, and the security.

## The Server Endpoints (`app/api/` folder)

### `api/auth/[...nextauth]/route.ts`
**Summary: The master bouncer validating user logins.**
- **Actual Job:** Encrypts user emails, checks passwords, and issues a secure session cookie.
- **Database Model:** Checks the `User` model to see if the email exists.
- **Returns:** A success/fail token back to the frontend Login page.

### `api/auth/register/route.ts`
**Summary: The endpoint that creates brand new accounts in the database.**
- **Actual Job:** Takes a typed-in password, secures it with a cryptographic hash, and saves the new user block.
- **Database Model:** Uses the `User` model.
- **Returns:** An "Account Created Successfully" message to the frontend.

### `api/statistics/route.ts`
**Summary: The heavy mathematical engine powering the dashboard.**
- **Actual Job:** Loads all the user's past runs and runs giant math loops to add up total distances, group them by month, and establish records.
- **Database Model:** Pulls everything from the `Activity` model.
- **Returns:** A perfectly formatted, clean block of JSON data back to `dashboard/page.tsx`.

### `api/strava/connect/route.ts` & `callback/route.ts`
**Summary: The security handshakes authorizing Strava integration.**
- **Actual Job:** Sends the user to Strava's website to ask for permission, and catches them when they return, securely stashing their OAuth keys.
- **Database Model:** Updates the `User` model with Strava secret tokens.
- **Returns:** Sends the user back to the frontend Dashboard immediately after syncing.

### `api/strava/activities/route.ts`
**Summary: The massive data vacuum sucking in past runs.**
- **Actual Job:** Quietly talks to Strava's servers, begging for page after page of old runs in the background.
- **Database Model:** Saves thousands of new `Activity` models.
- **Returns:** Nothing to be seen; updates the DB so the dashboard has fresh data.

### `api/strava/webhook/route.ts`
**Summary: The red phone hotline listening for new workouts.**
- **Actual Job:** Sits silently waiting. If the user finishes a run while outside, Strava silently rings this file to say "Hey, they just ran!" so it can update instantly.
- **Database Model:** Creates a single new `Activity` model.
- **Returns:** Returns a "200 OK" status back to Strava (the user never sees this).

### `api/ai/chat/route.ts` & `api/ai/roast/route.ts`
**Summary: The middlemen who talk to the Llama AI.**
- **Actual Job:** Grabs the user's typing prompt, grabs their Strava stats, glues them together, and ships them over the internet to the Groq Llama 3.3 server.
- **Database Model:** Saves the conversation into the `ChatHistory` model.
- **Returns:** Returns streaming AI text back to the frontend chat UI.

### `api/groq/fun-facts/route.ts`
**Summary: Engine for generating quirky trivia facts.**
- **Actual Job:** Dumps the year's stats into an AI prompt specifically asking for weird fun facts (like "You ran enough to cross the state of Texas!").
- **Database Model:** Pulls from `Activity`.
- **Returns:** Returns 3-4 text string arrays to the frontend FunFacts component.

## Logic and Engine Services (`lib/` and `utils/` and `models/`)
*These are imported and used heavily by the endpoints above.*

### `lib/db.ts`
**Summary: The direct ethernet cable to the MongoDB database.**
- **Actual Job:** Makes sure the server only opens one steady connection to MongoDB instead of crashing it by opening a million separate connections.

### `lib/statistics.ts`
**Summary: The massive repository of mathematical formulas.**
- **Actual Job:** Contains all the complex functions (`calculateMonthly()`, `getBestPace()`) that the `api/statistics/route` uses to process the raw GPS output.

### `lib/strava.ts`
**Summary: A translated dictionary of strict commands for Strava's servers.**
- **Actual Job:** Stores exact website URLs and API rules required to successfully fetch or authenticate data without getting blocked by Strava.

### `models/User.ts`, `models/Activity.ts`, `models/ChatHistory.ts`
**Summary: The strict bouncers guarding the database structure.**
- **Actual Job:** Ensures you don't accidentally save corrupted data. For example, the `Activity` model makes it completely illegal to save a run without a distance number. 

### `utils/canvasOverlay.ts` & `polylineToSVG.ts`
**Summary: The hardcore graphics processing scripts.**
- **Actual Job:** `polyline` takes Strava's encoded map gibberish and turns it into normal X/Y coordinates. `canvasOverlay` uses those X/Y coordinates to manually draw pixels for the Instagram poster feature.
