# CLAUDE.md

This file gives Claude Code context on this project. Read this fully before starting any work, and re-check it before starting each new phase.

---

## Project Overview

**Name:** Corporate Jargon Translator

**What it does:** A web app where a user pastes a corporate-jargon-filled sentence (e.g. "let's leverage synergies to ideate a scalable solution") and gets back a blunt, funny, plain-English translation, powered by Claude via the Anthropic API.

**Why it exists:** This is a portfolio project meant to be simple, funny, and shareable (LinkedIn-friendly) while demonstrating a working cloud + AI stack end to end.

**Request flow:**
```
User input (webpage) -> API Gateway -> Lambda (Node.js) -> Anthropic API (Claude Haiku 4.5) -> response flows back the same path -> shown on webpage
```

**Important context:** This project originally planned to use AWS Bedrock to call Claude. That was abandoned due to an unresolved AWS India account billing issue (AWS Marketplace subscription failing with INVALID_PAYMENT_INSTRUMENT, even after adding a valid card). The project now calls the Anthropic API directly instead of Bedrock. Do not reintroduce Bedrock, bedrock-runtime SDK calls, model IDs, or inference profiles anywhere in this project unless explicitly told the AWS issue is resolved and to switch back.

---

## Tech Stack

| Layer | Tech | Purpose |
|---|---|---|
| Frontend | HTML + CSS + JavaScript (no framework) | Text input, button, output display |
| Hosting | AWS Amplify | Public hosting for the frontend |
| API | AWS API Gateway | Routes requests from frontend to Lambda |
| Backend | AWS Lambda (Node.js 18+) | Receives input, calls the Anthropic API, returns output |
| AI | Anthropic API (Claude Haiku 4.5) | Generates the actual translation, called via a normal HTTPS request to api.anthropic.com |

Keep the stack exactly as above. No extra frameworks, no build tools, no TypeScript, no Bedrock, unless explicitly asked. This is intentionally a small, simple project.

**Anthropic API key handling:**
- The API key (starts with `sk-ant-`) is stored as a Lambda environment variable (e.g. `ANTHROPIC_API_KEY`), never hardcoded in any file.
- Never print, log, or commit the actual key value anywhere, including in commit messages, comments, or console.log statements.
- Confirm `.env` and any file containing real keys is listed in `.gitignore` before the first commit that touches backend code.

---

## Folder Structure

```
corporate-jargon/
|
├── backend/
│   ├── lambda/
│   │   ├── index.js              # Main Lambda handler
│   │   ├── prompt.js             # System prompt + few-shot examples
│   │   └── package.json
│   └── infra/
│       └── (optional) template.yaml
|
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
|
├── README.md
├── CLAUDE.md
└── .gitignore
```

This matches the current repo structure. Don't restructure folders without asking first.

---

## Development Phases

Work through these phases **in order**. Do not skip ahead or combine phases unless explicitly told to.

### Phase 0 — Setup
- Confirm folder structure matches the one above
- Confirm `.gitignore` excludes node_modules, `.env`, and any credential files
- Confirm an Anthropic API key exists and is available (ask the user to confirm they have it — never ask them to paste the actual key value into chat)

### Phase 1 — Backend (Lambda + Anthropic API)
- Draft `prompt.js`: system prompt + 3-5 example translations, tone = blunt, sarcastic, short
- Write `index.js`: Lambda handler that makes an HTTPS request to `https://api.anthropic.com/v1/messages` with the system prompt + user's text, using the API key from `process.env.ANTHROPIC_API_KEY`, parses the response, returns `{ translation: "..." }`
- Help prepare deployment (zip/package), but actual `aws deploy`/console steps requiring credentials are the user's to run
- Help set up API Gateway route + CORS config (as code/CLI commands the user runs, not by directly accessing AWS)
- Document how to set the `ANTHROPIC_API_KEY` environment variable on the Lambda function via the AWS console or CLI

### Phase 2 — Frontend
- Build `index.html` + `style.css`: input box, button, output area, clean simple styling
- Build `script.js`: fetch() call to the API Gateway endpoint, loading state, error handling
- Confirm it works against the live API URL before considering this phase done

### Phase 3 — Polish + Launch
- Add more test cases for tone consistency
- Add basic rate-limiting consideration (note it, don't over-engineer)
- Write/update `README.md`
- Final review pass on code quality and structure

---

## Workflow Rules (follow these strictly)

1. **After completing each phase (or each meaningful step within a phase):**
   - Give a brief plain-language summary of what was just done and why it was needed, written so a non-expert could follow it. Cover: what changed, why it was necessary for the project, and what's next.
   - Do NOT just say "done". Explain it like updating a teammate who's been away.

2. **Git workflow, after completing each phase or each step:**
   - Stage and commit the changes with a clear, descriptive commit message (e.g. `feat: add Lambda handler calling Anthropic API`)
   - Push to GitHub
   - Confirm the push succeeded before moving to the next step
   - If git isn't initialized yet or there's no remote configured, stop and ask the user rather than guessing at repo setup
   - Never commit a file containing a real API key, even accidentally. If unsure whether a file contains a secret, ask before committing.

3. **Don't make AWS console changes or run AWS deploy commands that require real credentials without flagging it to the user first.** Lay out the exact commands/steps and let the user confirm or run them, since this involves their actual AWS account.

4. **Ask before deviating** from the stack, folder structure, or phase order defined in this file. In particular, do not switch back to AWS Bedrock without explicit confirmation from the user.

5. **Keep code simple.** This is a learning/portfolio project. Prioritize readability and clear comments over cleverness or premature optimization.

---

## Current Status

(Update this section as phases are completed, so future sessions pick up where things left off.)

- [x] Phase 0 — Setup (folder structure confirmed, .gitignore confirmed, git initialized locally — no remote yet, Anthropic API key not yet created by user)
- [x] Phase 1 — Backend (deployed and verified end-to-end: Lambda `corporate-jargon-translator` in us-east-1, fronted by API Gateway HTTP API at <https://xe920nlaba.execute-api.us-east-1.amazonaws.com>, calling Anthropic API directly via Node 18 fetch, billing credits added, confirmed returning correct translations)
- [ ] Phase 2 — Frontend
- [ ] Phase 3 — Polish + Launch