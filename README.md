# LeadFlow — Automated Lead Management & Email Tracking System

## How to run

```bash
npm install
npm start
```

Then open:
- `http://localhost:3000/index.html` — lead capture form
- `http://localhost:3000/dashboard.html` — analytics dashboard
- `http://localhost:3000/inbox.html` — sent emails (simulated mailbox, see note below)

## Technologies used

- **Backend:** Node.js + Express
- **Storage:** Lightweight JSON file database (`data/db.json`) — chosen over SQL/Mongo so the project runs anywhere with zero setup; the `db.js` module is a thin data-access layer, so swapping in Postgres/MongoDB/Supabase only means rewriting that one file.
- **Frontend:** Plain HTML/CSS/JS (no framework) for the form, dashboard, and inbox views.
- **AI bonus feature:** Rule-based classifier (`classifier.js`) that tags each lead's requirement text with a `category` (AI Automation, Web Development, Mobile App, E-commerce, Marketing, Consulting, General Inquiry) and a `priority` (High/Medium/Low) using keyword heuristics. This is a drop-in placeholder — swapping in a real LLM call (e.g. the Anthropic API) only means replacing the body of `classifyLead()`.

## Architecture

```
Browser (index.html) --POST /api/leads--> Express server
                                              |
                                              v
                                 1. classify requirement (classifier.js)
                                 2. save lead to db.json (db.js)
                                 3. build personalized HTML email with
                                    a tracking pixel + trackable link (mailer.js)
                                 4. save the email record to db.json

Browser (dashboard.html) --GET /api/dashboard--> aggregates leads + emails
                                                  into totals/rates

Browser (inbox.html)     --GET /api/inbox--> returns generated emails for preview
```

## How tracking works

**Open tracking:** every generated email embeds a 1×1 invisible GIF:
`<img src="/track/open/:emailId">`. When an email client (or the inbox preview) renders that image, the server marks `opened = true` and records `openedAt`. This is the same technique used by real ESPs like Mailchimp/SendGrid.

**Click tracking:** the "Learn more" button doesn't link directly to the destination. It points to `/track/click/:emailId?url=<destination>`. The server logs the click (`clicked = true`, `clickedAt`), and only then issues a `302` redirect to the real destination URL — so the user experience is unaffected, but every click is captured first.

**Dashboard:** `/api/dashboard` reads all leads + emails from storage and computes:
- Total Leads, Total Emails Sent
- Total Emails Opened, Open Rate %
- Total Links Clicked, Click Rate %
- Category/Priority breakdown from the AI classifier
- A live table of recent leads with sent/opened/clicked status

The dashboard auto-refreshes every 5 seconds.

## Note on email delivery

This sandbox environment has no outbound network access to SMTP providers, so real emails aren't physically delivered to an inbox. Instead, every generated email (full HTML, tracking pixel, and trackable link, exactly as it would be emailed) is persisted and rendered at `/inbox.html` so the entire pipeline — generation, open tracking, click tracking, redirect — can be exercised end-to-end.

To go live, replace the "save email to db" step in `server.js` with a real send call (e.g. `nodemailer` + SMTP credentials, or the SendGrid/Resend/Postmark API) using the same `htmlContent` already being generated in `mailer.js`. No other part of the system needs to change.

## API endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/leads` | Submit a new lead, stores it, sends (simulated) tracked email |
| GET | `/api/leads` | List all leads |
| GET | `/api/dashboard` | Aggregated analytics |
| GET | `/api/inbox` | List all generated/sent emails for preview |
| GET | `/track/open/:emailId` | Tracking pixel endpoint (marks email opened) |
| GET | `/track/click/:emailId` | Tracking redirect endpoint (marks click, then 302 redirects) |
