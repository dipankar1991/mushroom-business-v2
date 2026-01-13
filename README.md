# Mushroom Business PWA

A mobile-first Progressive Web App for tracking mushroom business finances.

## Quick Start for Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
3.  **Setup Database (Supabase)**:
    - Create a free project at [supabase.com](https://supabase.com).
    - Go to the **SQL Editor** in Supabase dashboard.
    - Copy content from `supabase_schema.sql` in this project and run it.
    - Get your **Project URL** and **anon Key** from Project Settings > API.
    - Create a `.env` file in the root of this project:
      ```env
      VITE_SUPABASE_URL=your_project_url
      VITE_SUPABASE_ANON_KEY=your_anon_key
      ```

## How to Install on Mobile (PWA)

1.  **Deploy**: Connect this repository to **Vercel** (free).
2.  **Open URL**: Open the deployed link on Chrome (Android) or Safari (iOS).
3.  **Install**:
    - **Android**: Tap "Install App" or "Add to Home Screen".
    - **iOS**: Tap "Share" button -> "Add to Home Screen".

## Features
- **Dashboard**: View current balance, income, expenses, and cash flow chart.
- **Add Transaction**: Record Funding, Expenses, or Revenue with category logic.
- **History**: View, filter, and search past transactions.
- **Offline Capable**: Works as a standalone app.
