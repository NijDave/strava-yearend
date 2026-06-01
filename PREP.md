# Developer Viva Prep Guide: Codebase Architecture

Use this document to prepare for your viva. It breaks down the architecture folder-by-folder, explaining the "why", the "what", and the "how".

---

## 1. Folder: `app/`

**1. What is the purpose of this folder?**
If the examiner asks, tell them: "The `app` folder is the core routing engine of our Next.js application. It leverages the Next.js App Router paradigm. Every sub-folder in here with a `page.tsx` represents an actual URL the user can visit, while folders under `app/api` represent our backend server endpoints."

**2. What does each file do?**
* **Root UI (`layout.tsx`, `page.tsx`, `globals.css`)**: The structural wrappers. `layout` provides the HTML shell (fonts, caching, metadata), `page` is the root login screen, and `globals.css` injects Tailwind styling.
* **`(auth)/`**: Handles UI for `/login` and `/register`. Parentheses mean this doesn't add to the URL path.
* **`dashboard/`, `activity/`, `chat/`, `roast/`**: These house the main visual pages for viewing stats, single workouts, talking to the Coach AI, and getting roasted by the AI.
* **`api/ai/`**: Server endpoints parsing data and contacting Llama 3.3 for responses.
* **`api/auth/`**: NextAuth.js internals taking care of JSON Web Tokens, sessions, and OAuth handshakes.
* **`api/strava/`**: Endpoints specifically crafted to handshake with Strava's external servers (fetching data, syncing Webhooks).
* **`api/statistics/`**: The backend endpoint serving up processed dashboard graphs.

**3. How do they talk to each other?**
* The visual `page.tsx` files (like Dashboard) make `fetch()` GET requests to the `api/` endpoints (like `api/statistics`).
* The API endpoints then do the heavy lifting, talking to our Database, and returning JSON data back to the `page.tsx`.
* The `layout.tsx` wraps everything inside `providers.tsx`. This provider constantly broadcasts the user's login state downward, so every page instantly knows if it's allowed to show data or if it needs to redirect to the log-in gate.

---

## 2. Folder: `components/`

**1. What is the purpose of this folder?**
Tell the examiner: "This folder contains our custom React User Interfaces. Instead of writing massive 1000-line front-end files, we broke everything down into modular, reusable UI components. This ensures separation of concerns."

**2. What does each file do?**
* **`auth/` (LoginForm, OAuthButtons)**: Pure visual inputs for typing in passwords or clicking Google buttons.
* **`dashboard/` (MonthlyGraphs, CoreSummary, ActivityCard)**: The UI widgets making up the dashboard. `ActivityCard` gets generated hundreds of times as a list.
* **`activity/` (RouteMap, MetricsGrid, PaceGraph)**: Visualizers for a single workout. The Mapbox layer, the pace variations, etc.
* **`ShareActivity/` (OverlayCard, ShareBottomSheet)**: The UI responsible for drawing the picture users share on Instagram, and the mobile popup to save it.

**3. How do they talk to each other?**
* Components adopt a "Parent-to-Child" communication model via React `props`. 
* For example, the `Dashboard/page.tsx` (Parent) fetches the massive block of user data. It then passes small pieces of that data down to the children: it passes speed data into `BestPerformances.tsx`, and timeline data into `MonthlyGraphs.tsx`. The components themselves are "dumb"—they just blindly render whatever data the parent hands them.

---

## 3. Folder: `lib/`

**1. What is the purpose of this folder?**
Tell the examiner: "This is our 'Library' of backend logic and services. There are no UI files here. These are the tools that our `app/api/` folder imports so it can execute database writes, authenticate users, or crunch numbers without cluttering the routing files."

**2. What does each file do?**
* **`db.ts`**: The database connection singleton. It ensures we don't open 5,000 connections to MongoDB and crash the system; it intelligently pools the connection.
* **`auth.ts`**: The strict rulebook on how NextAuth verifies cookies, session tokens, and passwords.
* **`strava.ts`**: A wrapper containing specific `fetch` commands with embedded Strava Secret Keys, allowing us to safely pull someone's 10-mile run from Strava.
* **`statistics.ts`**: A massive mathematical calculation factory. It takes 500 raw runs and boils them down into "800 total miles", "3rd fastest month", etc.
* **`utils.ts`**: Tiny helper logic for string manipulation (like turning "2024-01-01" into "Jan 1, 2024") and combining Tailwind classes (`cn`).

**3. How do they talk to each other?**
* `lib/` files generally act as standalone tools. Our `api/` routes import them. 
* For example: `api/statistics/route.ts` will first import `db.ts` to get workouts, then import `statistics.ts` to crunch those workouts, and finally return the result. They are pure utilitarian functions.

---

## 4. Folder: `models/`

**1. What is the purpose of this folder?**
Tell the examiner: "We are using MongoDB, which is naturally schema-less. The `models/` folder uses Mongoose to enforce strict Document Object Models. It guarantees that our database will never accidentally save an Activity that's missing a distance or let a user register without an email."

**2. What does each file do?**
* **`User.ts`**: Declares that every human needs a Google/Apple ID or hashed password, plus an array of Strava permissions.
* **`Activity.ts`**: Defines that a workout includes GPS data (`map`), speed, distance, elevation, and timestamps.
* **`ChatHistory.ts`**: States that AI chats are saved as Arrays of 'User' and 'Assistant' text blocks tied to a specific `UserId`.

**3. How do they talk to each other?**
* Models primarily relate via "References" (Foreign Keys). 
* Notice how an `Activity` has a field pointing to a `User_ID`. When we load the Dashboard, we query MongoDB using Mongoose: "Find all `Activity` models where `User_ID` equals the logged-in user."

---

## 5. Folder: `hooks/`

**1. What is the purpose of this folder?**
Tell the examiner: "Hooks are custom React abstractions that manage 'State' or 'Lifecycle' events. We extracted messy side-effects—like listening to Window resizing or copying image blobs to the clipboard—out of our components to keep our UI clean."

**2. What does each file do?**
* **`useIsMobile.ts`**: Sets up an event listener on the browser window. If the width drops below 768px, it flips a boolean allowing our app to dynamically remove desktop UI.
* **`useCountUp.ts`**: Uses `requestAnimationFrame` to animate static numbers dynamically incrementing on screen.
* **`useClipboardImage.ts` / `useShareSheet.ts`**: Handles the deeply complex browser APIs that take an HTML canvas, convert it into an image memory Blob, and pass it to Apple/Android system-level sharing APIs.
* **`useOverlayActions.ts`**: Orchestrates the state when someone is designing their social share (toggling themes like 'Cyberpunk' vs 'Minimalist').

**3. How do they talk to each other?**
* Hooks are imported directly by components. For example, the `ShareBottomSheet` component imports `useShareSheet`. When a user clicks the "Share" button, the component immediately triggers the logic inside the hook, executing the browser-level pop-ups.

---

## 6. Folder: `utils/`

**1. What is the purpose of this folder?**
Tell the examiner: "This folder houses heavy, highly-specialized helper logic. Currently, it is strictly dedicated to translating raw Map coordinates and drawing literal pixels on HTML Canvases for our social sharing feature."

**2. What does each file do?**
* **`canvasOverlay.ts`**: Operates on a coordinate grid setting precise `ctx.arc()` draw commands to render UI text and GPS lines dynamically on an absolute coordinate plane.
* **`formatActivityOverlay.ts`**: Massages the raw activity JSON into the strict string text requested by the canvas drawing.
* **`polylineToSVG.ts`**: Converts a crazy encoded map string (`{c}mF...`) originally sent by Strava into standard math coordinates (latitude/longitude), and turns that into a scalable SVG visual path.

**3. How do they talk to each other?**
* They are imported sequentially. Our `OverlayCard` component imports `polylineToSVG` to draw the physical line of the run, and subsequently imports `canvasOverlay` when the user actually decides to export that element to a `.PNG`.

---

## 7. Folder: `types/`

**1. What is the purpose of this folder?**
Tell the examiner: "TypeScript ensures code reliability before we even run it. The `types` folder acts as our global dictionary, ensuring all variables and function returns conform exactly to the shapes we expect, absolutely destroying runtime errors related to missing data."

**2. What does each file do?**
* **`index.ts`**: The main dictionary. It outlines shapes like `IActivity` (which mirrors our Mongoose models) or `SessionUser` (defining what fields exist when a user logs in).
* **`mapbox-polyline.d.ts`**: A declaration file. Mapbox wrote an old library entirely in Javascript without type definitions. This file artificially wraps their library so our TypeScript compiler stops screaming at us.

**3. How do they talk to each other?**
* Types don't "execute" or "talk" at runtime. They are purely compile-time constructs. We import them everywhere (`import { IActivity } from '@/types'`) as a strict contract that the rest of the codebase must uphold.

---

### Final Summary for the Examiner
"Sir/Madam, to trace the lifecycle: A user hits a visual page (`app/`), the page calls an API route (`app/api`), the API uses our business logic (`lib/`) to talk to the database (`models/`), returning strict shapes (`types/`). The page receives that data and passes it down into reusable visual blocks (`components/`), which use interactive state patterns (`hooks/` and `utils/`) to present a seamless UI/UX to the end user."
