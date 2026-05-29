# 🌌 Fandom Vibe

Fandom Vibe is a stunning, cinematic social platform designed where **fandom meets lifestyle**. Organize your life, hobbies, and favorite communities in a cohesive, glassmorphism-inspired interface. Find your people through the things you love, the hobbies you repeat, and the feelings you cannot quite explain.

---

## ✨ Features

- **Vibe-based Spaces:** Sub-communities organized by emotional/aesthetic categories (e.g., Midnight Energy, Cozy Cafe, Streetwear, Film Aesthetic).
- **Scrapbook Posting:** Compose status updates with text, images, mood tags, and music links.
- **Identity Signals:** Onboarding flows to select fandoms, hobbies, and vibes to build a custom profile.
- **Dual-Mode Backend:** 
  - **Demo Mode:** Works out of the box in the browser (using local storage) if no database is connected.
  - **Supabase Mode:** Fully secure, real-time database support for user authentication, posts, comments, and profile management.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` or create it in the root directory:
```bash
cp .env.example .env
```
Fill in your Supabase details (or leave them empty to run in **Demo Mode**).

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 🗄️ Database Setup (Supabase)

To enable persistent data storage and secure user authentication:

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase Dashboard.
3. Paste the contents of [supabase/schema.sql](file:///C:/Users/rapol/OneDrive/Desktop/startup/supabase/schema.sql) and run it to set up the database tables (`users`, `spaces`, `posts`, `comments`) along with Row Level Security (RLS) policies.
4. Retrieve your **Project URL** and **API Anon Key** from *Project Settings -> API*.
5. Add these credentials to your `.env` file (locally) or your deployment environment variables (production).

---

## ☁️ Deployment

This project is built with Next.js and optimized for deployment on the Vercel platform.

### Deploy to Vercel in 1-Click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fyour-repo-name&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Manual Vercel Deployment

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Add the environment variables when prompted:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **Styling:** TailwindCSS 3 & CSS Variables
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend/Auth:** Supabase JS SDK
