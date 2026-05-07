# Smashify - Project Operation & Roadmap Guide

Welcome to the Smashify documentation! This guide explains how to operate the current project, lists the features that still need to be built, and provides a strategic roadmap to make Smashify a world-class platform.

---

## 1. Operating the Project

Smashify is currently built as a modern, high-performance React application using Vite, Tailwind CSS, and Framer Motion. 

### Development Commands
To work on this project locally on your computer:
1. **Install Node.js** (v18 or higher)
2. **Install dependencies**: Run `npm install`
3. **Start the development server**: Run `npm run dev` (Runs on `localhost:3000`)
4. **Build for production**: Run `npm run build` (Compiles the app into the `dist/` folder)

### Deployment to Netlify
Since you are deploying to Netlify:
1. Push this code to a **GitHub** repository.
2. In Netlify, click **"Add new site" -> "Import an existing project"** and connect your GitHub.
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. The `public/_redirects` file we added ensures that React Router works perfectly when users refresh the page.

### Converting to Mobile Apps (Android APK & iOS)
To turn this web codebase into a native app:
1. Use **Capacitor.js** (by Ionic). It wraps your web app in a native WebView.
2. Run `npm install @capacitor/core @capacitor/cli`
3. Initialize it: `npx cap init Smashify com.smashify.app`
4. Add platforms: `npm install @capacitor/android @capacitor/ios`
5. Run `npx cap add android` and `npx cap add ios`
6. Every time you build (`npm run build`), you run `npx cap sync` to copy the web assets into the Android/iOS folders. You can then open those folders in Android Studio or Xcode to build the final app.

---

## 2. What is Left to Build (The Missing Engines)

Right now, Smashify is a **"Frontend Prototype"**. The UI looks beautiful, animations work, and the flow makes sense, but the data is currently *mocked* (fake data for design purposes). 

To make it a fully working product, you need to connect a **Backend/Database**.
Here are the core technical features that must be integrated next:

*   **Database Integration (Supabase or Firebase):** You need a database to store user accounts, artist profiles, track metadata, album details, and playlist data.
*   **Authentication (Auth):** Real login, signup, and password reset flows. Artist verification where admins can approve the ID photos uploaded during registration.
*   **Audio & Image Storage (Bucket/CDN):** When an artist uploads a track (MP3/WAV) or cover art, it needs to be uploaded to a cloud storage bucket (like AWS S3, Cloudflare R2, or Firebase Storage) and served via a global CDN so it streams fast without buffering.
*   **Real Audio Player Engine:** The current player interface needs to be wired up to the HTML5 Web Audio API so it actually fetches audio URLs, handles buffering, scrubbing, and background play (especially difficult on mobile browsers unless wrapped in Capacitor).
*   **Payment Gateway Integration:** Connecting **PayChangu**, Airtel Money, or TNM Mpamba APIs so listeners can pay for Premium and artists can receive their payouts to their mobile money wallets.
*   **Search Engine:** Implementing a fast search (like Algolia or Meilisearch) so users can instantly find tracks, albums, and artists.

---

## 3. How to Make It GREAT (Strategic Roadmap)

To beat international competitors like Spotify while catering specifically to the Malawian market, Smashify needs to excel in areas where global apps fail.

### A. Hyper-Local Payment & Data Savings
*   **Data-Free Streaming Partnerships:** Partner with Airtel/TNM to zero-rate the Smashify app, so listeners don't use their data bundles when streaming. This is a massive growth hack.
*   **Offline Mode (PWA):** Build a robust offline storage mechanism where Premium users can download caches of songs to their phone's local storage to listen on the bus or in villages with poor network.
*   **Micro-Transactions:** Allow fans to tip artists in small amounts (e.g., MK 100) effortlessly during a song drop.

### B. The Artist Experience
*   **Transparent Analytics:** Artists should see *exactly* where their listeners are coming from (e.g., "500 plays from Blantyre today").
*   **Auto-Splits for Royalties:** When an artist uploads a song, allow them to add their producer's Smashify handle and automatically split the revenue (e.g., 80% to Artist, 20% to Producer). This solves huge industry headaches.
*   **Direct Fan Messaging:** Allow verified artists to send push notifications directly to their followers when they drop a new track.

### C. Superior UX & Performance
*   **Gapless Playback & Crossfading:** Audio should seamlessly transition from one track to the next.
*   **Chichewa Localization:** Offer the app interface in both English and Chichewa. 
*   **Social Sharing to WhatsApp:** Make sharing songs output a beautiful, branded image that fits perfectly in WhatsApp Statuses or Instagram Stories with a direct link back to the app.

---

## Summary of Next Steps
1. **Frontend Polish:** You have a gorgeous frontend. Deploy it to Netlify and test it on real mobile phones.
2. **Backend Setup:** Choose a backend (Firebase is great to start with, Supabase is excellent for relational data).
3. **Connect the Dots:** Hook up the Auth -> Store Users -> Upload Songs -> Stream Audio.
4. **Launch Beta:** Get 50 real Malawian artists to test the upload flow and give feedback before public launch.
