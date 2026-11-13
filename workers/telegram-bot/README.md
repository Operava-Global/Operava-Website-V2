# OPERAVA Telegram Bot

Dedicated Cloudflare Worker for [@operavaglobalbot](https://t.me/operavaglobalbot).

## AVA knowledge integration

The bot forwards visitor questions to the OPERAVA website's existing `POST https://www.operavaglobal.com/api/chat` endpoint. This is intentional: the Telegram channel uses the same AVA system instruction, structured website knowledge, contact routing, privacy policy and configured AI backend as the website assistant. It does not maintain a second, drifting copy of company facts.

The AVA endpoint currently accepts:
```json
{ "message": "What services does OPERAVA provide?", "history": [] }
```
and returns a JSON object containing `text`.

## Worker configuration

Worker name: `operava-telegram-bot`

Required secrets (set through Cloudflare Worker Secrets; never commit values):
- `TELEGRAM_BOT_TOKEN` — newly rotated BotFather token
- `TELEGRAM_WEBHOOK_SECRET` — random 1–256 character webhook secret using Telegram's allowed characters

Optional variable:
- `AVA_CHAT_API` — defaults to `https://www.operavaglobal.com/api/chat`

Webhook:
`https://<worker-host>/webhook`

Health check:
`GET https://<worker-host>/health`

## Telegram webhook registration

After deploying the Worker and setting both secrets, register the webhook from a secure operator environment (do not place the token in source control, browser code, chat messages or logs):

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TELEGRAM_WEBHOOK_URL\",\"secret_token\":\"$TELEGRAM_WEBHOOK_SECRET\",\"allowed_updates\":[\"message\",\"edited_message\"]}"
```

Check webhook status:
```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

## Supported commands

- `/start`, `/help`
- `/services`
- `/quote`
- `/support`
- `/careers`
- `/contact`
- `/human`
- `/privacy`

## Safety and scope

- Never collect passwords, OTPs, card details, identity numbers or confidential customer records in Telegram.
- The bot does not claim to create tickets, submit quotes, send emails or contact staff.
- Unknown facts, pricing, delivery commitments, certifications and guarantees remain subject to AVA's existing knowledge boundary.
- This initial test does not persist Telegram messages or leads in D1.
- Rotate any token that has been exposed before configuring the Worker.
