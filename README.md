# Corporate Jargon Translator

Paste a corporate-jargon-filled sentence. Get a savage, funny, plain-English translation back — powered by Claude (Anthropic API).

**Live:** [https://main.drsgpl115xisu.amplifyapp.com](https://main.drsgpl115xisu.amplifyapp.com)

---

## What it does

You type something like:

> *"Let's leverage synergies to ideate a scalable, best-in-class solution and circle back offline."*

And get back something like:

> *"Let's mix everyone's bad ideas together and hope something decent falls out. Spoiler: it won't."*

It also shows a BS-O-Meter score, a jargon tier badge, highlights every buzzword in the original with hover tooltips, and lets you copy or save the result as a shareable image.

---

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Vanilla HTML + CSS + JS (single file, no framework) |
| Hosting | AWS Amplify (auto-deploys from GitHub on push) |
| API | AWS API Gateway (HTTP API) |
| Backend | AWS Lambda (Node.js 18) |
| AI | Anthropic API — Claude Haiku 4.5 |

---

## How it works

```text
Browser → API Gateway → Lambda → Anthropic API → back the same way
```

1. User types jargon into the text box and clicks **Stamp It**
2. The frontend sends a `POST /translate` request to API Gateway with `{ "text": "..." }`
3. Lambda picks it up, sends it to the Anthropic API with a sarcastic system prompt, and returns `{ "translation": "..." }`
4. The frontend shows the translation, highlights buzzwords in the original, and computes the BS-O-Meter score client-side

---

## Local development

No build step needed. Just open `frontend/index.html` in a browser — it calls the live API directly.

Or serve it locally:

```bash
cd frontend
python -m http.server 8080
# then open http://localhost:8080
```

---

## Project structure

```text
corporate-jargon/
├── backend/
│   └── lambda/
│       ├── index.js      # Lambda handler — calls Anthropic API
│       └── prompt.js     # System prompt + few-shot examples
├── frontend/
│   └── index.html        # Entire frontend (HTML + CSS + JS in one file)
├── amplify.yml           # Amplify build config
└── README.md
```

---

## Deploying changes

**Frontend** — push to `main`, Amplify auto-deploys within ~1 minute.

**Backend** — update `backend/lambda/` locally, zip and upload to Lambda:

```powershell
cd backend/lambda
Compress-Archive -Path index.js,prompt.js,package.json -DestinationPath lambda.zip -Force
aws lambda update-function-code --function-name corporate-jargon-translator --zip-file fileb://lambda.zip --region us-east-1
```
