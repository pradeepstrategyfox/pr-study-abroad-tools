# PR Study Abroad — Free Tools

Lead-magnet tools for [prstudyabroad.com](https://prstudyabroad.com):

1. **University Match / Admit Predictor** (`/university-match`) — bucket universities into Ambitious / Target / Safe based on a student's profile.
2. **Study Abroad Cost Calculator** (`/cost-calculator`) — country & city-wise itemized INR cost with year-on-year breakdown and monthly burn rate.

Both tools show results inline, then gate the **PDF report** behind a name+email+phone capture form. Leads are sent to a webhook (Google Sheets via Apps Script, or any URL that accepts POST JSON).

## Tech

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- jsPDF for client-side PDF generation
- Deployed on Vercel

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Environment variables

| Variable           | Purpose                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `LEAD_WEBHOOK_URL` | URL of a Google Apps Script webhook (or any webhook). When unset, leads are console-logged on the server (visible in Vercel logs). |

### Setting up a Google Sheet webhook

1. Create a new Google Sheet, e.g. "PR Study Abroad — Leads".
2. Extensions → Apps Script. Paste:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["timestamp", "tool", "name", "email", "phone", "payload"]);
  }
  sheet.appendRow([
    data.submittedAt || new Date(),
    data.tool,
    data.name,
    data.email,
    data.phone,
    JSON.stringify(data.payload),
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

3. Deploy → New deployment → Type "Web app" → Execute as "Me" → Access "Anyone".
4. Copy the web app URL and set `LEAD_WEBHOOK_URL` in Vercel project settings.

## Editing data

- Universities: `data/universities.json`
- Cost ranges per country/city: `data/costs.json`

Push a commit; Vercel redeploys.

## Files

- `app/page.tsx` — landing
- `app/university-match/page.tsx` — tool 1
- `app/cost-calculator/page.tsx` — tool 2
- `app/api/lead/route.ts` — lead webhook
- `lib/predictor.ts` — admit probability scoring
- `lib/costs.ts` — cost computation
- `lib/pdf.ts` — PDF generation
- `components/LeadModal.tsx` — email/phone capture
