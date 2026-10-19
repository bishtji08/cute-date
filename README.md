# Cute Date Invitation 💙

A small React + Vite website with three screens:
1. Welcome screen
2. Date invitation with a playful No button
3. Celebration screen

## Run locally

Requirements: Node.js 18+ recommended.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

While the Vite development server is running, invitation opens and responses are
printed in the terminal and appended to `logs/responses.log`. The log records
timestamps and event types (`opened`, `no_attempt`, and `yes`). A `yes` entry
also includes the message submitted in the dialog. No visitor identity is
collected. This file-based logger is for local development only.

For Netlify deployments, enable **Forms > Form detection** in the site dashboard
and redeploy. The `date-invitation` submissions include a `response` value
(`yes` or the first `no` attempt) and, for `yes`, the message. They appear under
**Forms > Submissions**. Configure a submission notification there if you want
the responses emailed to you.

## Build for production

```bash
npm run build
npm run preview
```

## Notes
- The bear illustration is built with CSS, so no external sticker assets are required.
- The No button moves when hovered or clicked.
- The project respects the `prefers-reduced-motion` accessibility setting.
# cute-date
