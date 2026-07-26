# Web Application Development Guide: Supabase & Cloudflare

## Overview
This guide details the steps to build a web application using Supabase as the database, Cloudflare for hosting, and the Antigravity IDE for development.

## Is a GitHub Repository Best Practice?
**Yes, absolutely.** Creating a GitHub repository *before* deploying your web page is an industry-standard best practice. Here is why:
- **Version Control:** You can track your changes, revert mistakes, and manage different features safely via branches.
- **Continuous Integration/Continuous Deployment (CI/CD):** Cloudflare Pages integrates directly with GitHub. When you push your code to your repository, Cloudflare will automatically detect the changes, build your site, and deploy the new version seamlessly.
- **Collaboration & Backup:** Your code is safely backed up in the cloud, preventing data loss.

---

## Step-by-Step Implementation Guide

### Step 1: Initializing Version Control (GitHub)
1. Go to [GitHub](https://github.com) and create a new, empty repository.
2. In your Antigravity IDE terminal, create your project folder and initialize Git:
   ```bash
   mkdir my-web-app
   cd my-web-app
   git init
   git remote add origin <your-github-repo-url>
   ```

### Step 2: Project Setup
For a modern web app, using a fast build tool like Vite is recommended.
1. Run the initialization command in your Antigravity terminal:
   ```bash
   npx create-vite@latest . --template react
   npm install
   ```
*(Note: If prompted to remove existing files, you can create the Vite app first, then run `git init` inside it).*

### Step 3: Antigravity IDE & MCP Server Setup
To develop effectively in Antigravity:
1. **MCP Servers:** Antigravity supports Model Context Protocol (MCP) servers. If you want the AI to interact directly with Supabase or Cloudflare APIs on your behalf (e.g., executing remote queries), you can configure their MCP servers in your `C:\Users\Aleja\.gemini\antigravity\mcp\` directory. 
2. **Context Awareness:** Antigravity automatically reads your workspace. As you create components, the AI will have full context of your React files and can help you write queries or design UI components.

### Step 4: Supabase Integration
1. Go to the [Supabase Dashboard](https://app.supabase.com/) and create a new project.
2. Once created, go to **Project Settings -> API** to get your `Project URL` and `anon public` API key.
3. In Antigravity, install the Supabase JavaScript client:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Create a `.env.local` file in your project root to store your credentials securely:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Create a `supabaseClient.js` (or `.ts`) file in your `src` folder to initialize the connection:
   ```javascript
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

### Step 5: Development Workflow in Antigravity
1. Start your local development server to see your app live:
   ```bash
   npm run dev
   ```
2. You can now prompt the Antigravity assistant to generate UI components, write database queries using your `supabaseClient.js`, and style your application.
3. When you are ready to save changes, commit them via Git in the terminal:
   ```bash
   git add .
   git commit -m "Initial setup with Supabase integration"
   git branch -M main
   git push -u origin main
   ```

### Step 6: Cloudflare Hosting (Cloudflare Pages)
Cloudflare Pages is the best way to host front-end applications, especially when linked to GitHub.
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2. Click **Create Application** -> **Pages** -> **Connect to Git**.
3. Authorize Cloudflare to access your GitHub account and select your repository.
4. Configure the build settings:
   - **Framework Preset:** Select `Vite` (or `React`).
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **Environment Variables:** **Crucial Step** — Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Cloudflare settings so the deployed app can communicate with your database.
6. Click **Save and Deploy**.

### Next Steps
Now, every time you push code from the Antigravity IDE to GitHub, Cloudflare will automatically build and deploy the updates. You can focus entirely on writing code alongside the AI inside Antigravity!
