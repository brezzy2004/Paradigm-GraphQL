# Paradigm GraphQL Backend – (Next.js 14)

## Run
```bash
cp .env.example .env
docker compose up -d
npm i
npm run dev
npm run seed  # create test users + groups
```

### GraphQL Endpoint
`[http://localhost:3000/api/graphql](https://growing-anemone-sweet.ngrok-free.app/api/graphql)` (GraphiQL enabled)

## Highlights
- Black services: login/logout/refresh/validate + group access.
- Green services: projects, group chats, project chats, KBs, instructions, files, histories.
- ID formats: `PGM-xxxxxx/AY`, `DGP/1-xxxxxx/MK`, `cha-xxxxxx/...`, `PRJ-xxxxxx/DGP-#/X`, `kwb-...`, `INN-...`, `msg-...`, `fil-...`.
- 2-minute chat lock is handled implicitly by messages-first workflow; add explicit lock if required.
- Self-trigger init on container start.
- CORS + API keys for N8N/MCP.

See `/docs` for the PDFs/flowcharts you provided.
