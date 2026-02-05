

# Personal CRM & Implementation Tracker

## Overview
A personal CRM and project tracker designed for ADHD-friendly workflows, helping you manage 100+ accounts with visual progress tracking, Google Sheets sync, and AI-powered automation via Gemini.

We'll build this iteratively, starting with the core foundation and adding complexity over time.

---

## Phase 1: Core Foundation (Initial Build)

### 1. Dashboard — At-a-Glance Overview
- **Account health summary** with color-coded cards showing total accounts, accounts needing attention, and projects in progress
- **Warning alerts** for accounts that haven't been touched in X days (configurable threshold)
- **Progress rings and bars** showing pipeline stage distribution
- **Quick stats** — accounts by stage, overdue tasks, upcoming deadlines

### 2. Account Management
- **Account list view** with search, filter, and sort capabilities
- **Account detail page** inspired by the Dynamics 365 reference — showing contact info, pipeline stage, activity timeline, and next actions
- **Visual pipeline stages** — a configurable flow (e.g., Qualify → Develop → Propose → Close) with the ability to customize stages per project type
- **Kanban board view** for dragging accounts between stages

### 3. Task / Todo Board
- **Kanban-style task board** linked to accounts
- **Task cards** with due dates, priority levels, and account associations
- **Visual indicators** — color coding by priority and overdue status
- **Quick-add tasks** from any view

### 4. Authentication & Database
- **User login** with email/password via Supabase Auth
- **Database tables** for accounts, tasks, pipeline stages, and activity logs
- **Row-level security** so your data stays private

---

## Phase 2: Google Sheets Integration

### 5. Read-Only Google Sheets Sync
- **Import accounts** from your existing Google Sheet (Andys Account Implementation Tracker)
- **Manual refresh** button to pull latest data
- **Field mapping** to match your sheet columns to CRM fields
- **Sync status indicators** showing when data was last refreshed

---

## Phase 3: AI-Powered Features (Gemini via Lovable AI)

### 6. AI Account Research
- **One-click research** on any account — pulls company info, recent news, and insights
- **AI-generated account summaries** saved to the account record

### 7. AI Task Suggestions & Daily Briefing
- **Smart task suggestions** based on account status, cadence gaps, and priorities
- **Daily briefing page** — an AI-generated summary of what needs your attention today
- **Handover notes generator** — AI creates structured handover documentation for any account

### 8. Scheduled AI Flows
- **Configurable automations** — e.g., "Every Monday, review stale accounts and suggest actions"
- **AI-powered cadence monitoring** — flags accounts falling behind schedule

---

## Design Approach
- **Clean, modern UI** with a sidebar navigation similar to the Dynamics 365 reference
- **ADHD-friendly**: bold visual progress indicators (progress rings, color-coded status bars, score badges), clear visual hierarchy, minimal clutter
- **Warm color palette** with green/yellow/red status indicators for at-a-glance understanding
- **Responsive layout** optimized for desktop use

