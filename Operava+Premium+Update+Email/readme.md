# Operava Website — README

This README is for THIS repo only.
It explains the website root and the email folder you added.

## What is this repo?

This is the Operava Global Solutions website repo.
It holds the main website + the email HTML in a separate folder on the website root.

Live site root example:
- `/` = website homepage
- `/email/` = email folder (separate folder on website root)

## Folder Structure

```
/
├── index.html                  # Main website homepage
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── email/                      # <-- EMAIL FOLDER - SEPARATE FOLDER ON WEBSITE ROOT
│   ├── index.html              # Operava Premium Update Email - AI Specialist / Engineer
│   ├── operava_hero.png        # Hero PNG - purple + gold AI network
│   ├── operava_ai_specialist.png  # AI Specialist PNG - person + AI holograms
│   └── operava_future.png      # Future PNG - open door to sunset path
└── README.md                   # This file - for this repo only
```

> Do NOT move the email files into `/assets/` or into the main site folders.
> Keep them in `/email/` so the email stays separate and easy to update.

## The Email in /email/

File: `/email/index.html`

Subject: Update on your application: AI Specialist / Engineer
Company: Operava Global Solutions
Role: AI Specialist / Engineer - Technology Executive Posts

This is a premium application status email. Same exact details as the original, with better wording.

It includes:
- Decision: Will not move forward for this position
- Reason: Fit and timing, not ability
- Quote: "A difference in fit and timing. Never a difference in ability."
- Fit comparison: Your profile vs What this role needs now
- Next steps:
  1. Stay on our radar - Keep profile on file
  2. Tell us what you want - applied AI, automation, engineering leadership
  3. Ask for feedback / delete details
- Button: Keep my profile on file -> mailto: careers@yourdomain.com
- Signature: [Your Name], [Your Title], Talent Acquisition
- Footer: Confidential - you applied at Operava

## Images - PNG Only, No SVG

This email uses PNG only. No SVG code.

| File | Where it is used | What it shows |
|------|------------------|---------------|
| `operava_hero.png` | Top hero banner | Deep purple + gold AI network |
| `operava_ai_specialist.png` | After opening paragraph | AI Specialist with AI holograms |
| `operava_future.png` | Next Steps section | Open door to bright sunset path |

All 3 PNGs must stay in the same `/email/` folder as `index.html`.
The HTML uses relative paths:
```html
<img src="operava_hero.png" ...>
<img src="operava_ai_specialist.png" ...>
<img src="operava_future.png" ...>
```

If you move the HTML, move the PNGs with it.

## How to View Locally

1. Download / clone this repo
2. Open the file:
```
email/index.html
```
in your browser. Double-click it.

No build, no npm, no server needed.

## How to View on Website

After you push to your hosting:

```
https://yourdomain.com/email/
https://yourdomain.com/email/index.html
```

That is the separate email page on the website root.

## How to Edit

### Change the name / title / email

Open `/email/index.html` and edit only these placeholders:

- `[First Name]` - candidate first name
- `[Your Name]` - sender name
- `[Your Title]` - sender title
- `[careers@yourdomain.com]` - replace with real careers email (2 places: button + signature)

Do not change the decision wording unless you want to change the meaning.

### Change an image

1. Put new PNG in `/email/` folder
2. Keep same filename, or update the `src="..."` in `index.html`
3. Keep PNG format. Do not use SVG.

Example:
```
email/operava_hero.png -> replace this file
```

### Change colors

Main colors in `/email/index.html`:
- Dark purple: `#2B1055`
- Royal purple: `#4B21A3` / `#6D3FC9`
- Light lavender background: `#EFE9F8` / `#EADFFB`
- Gold accent: `#C9A86A`
- Text dark: `#20172E`

## How to Send as Email

This file is designed as a web page preview.

To send in Gmail / Outlook:
1. Open `https://yourdomain.com/email/` in browser
2. Select all + Copy, or use your email tool's "Insert HTML" / "Import HTML"
3. Paste into new email
4. Check images load - images must be hosted at `yourdomain.com/email/*.png`

For best delivery, host the PNGs on your domain. Do not attach PNGs as separate attachments if you want them inline.

## Deployment - This Repo Only

This README is only for this repo. No other repo.

Typical flow:
```bash
git add .
git commit -m "Update Operava email in /email/"
git push origin main
```

Your host (Netlify / Vercel / cPanel / GitHub Pages) will publish:
- `/` -> website
- `/email/` -> email page

Check after deploy:
- [ ] `https://yourdomain.com/email/` opens
- [ ] Hero PNG shows
- [ ] AI Specialist PNG shows
- [ ] Future PNG shows
- [ ] Button opens email to careers@yourdomain.com
- [ ] Mobile view looks good (test 360px width)

## Do NOT Do

- Do NOT put email HTML in root `index.html` - it will replace the website
- Do NOT use SVG for images - this project is PNG only
- Do NOT move PNGs to another folder without updating `src` paths
- Do NOT commit other repos' README into this repo

## Support

If email images are broken on live site:
1. Check files exist in `/email/` on server
2. Check filenames are exact lowercase: `operava_hero.png` etc.
3. Check `index.html` uses `src="operava_hero.png"` not `/operava_hero.png` or `../`
4. Hard refresh: Ctrl + Shift + R

---

Repo: Operava Website - Website Root + /email/ folder
Email: Operava Premium Update Email - AI Specialist / Engineer
Images: PNG only
