# 🔦 Beacon

**A URL shortener with click analytics, built full-stack in Node.js.**

Beacon turns long URLs into short, shareable codes and tracks every time
one is opened — total clicks and last-clicked time, visible right on the
dashboard. It's a compact example of a real Node/Express service done
properly: a swappable data layer, a fully tested API with no database
required to run the test suite, containers, and a CI/CD pipeline.

![CI](https://github.com/Aryamaan-mathur-001/beacon/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-20-339933)
![Express](https://img.shields.io/badge/Express-4-000000)
![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey)

## Why this exists

This is the third project in a small full-stack + DevOps series, each one
deliberately using a different stack so the patterns generalize:

| Project | Backend | Database | Frontend |
|---|---|---|---|
| Anchor | Next.js (Node) | PostgreSQL + Prisma | React (App Router) |
| Anchor (Python Edition) | FastAPI | PostgreSQL + SQLAlchemy | Jinja2 + vanilla JS |
| **Beacon** | **Express (Node)** | **MongoDB + Mongoose** | **EJS + vanilla JS** |

Beacon's standout design choice: routes never talk to Mongoose directly.
They talk to a small `linkStore` interface (`src/linkStore.js`), which has
two implementations — one backed by MongoDB, one an in-memory `Map`. Tests
inject the in-memory store, so the full test suite runs with **zero**
external services, in well under a second.

## Stack

| Layer      | Choice                                   |
|------------|--------------------------------------------|
| Backend    | Node.js 20, Express                         |
| Frontend   | EJS server-rendered views + vanilla JS      |
| Database   | MongoDB + Mongoose                          |
| Testing    | Vitest + Supertest, against an in-memory store |
| Containers | Docker, docker-compose                      |
| CI/CD      | GitHub Actions → GitHub Container Registry  |

## Project structure

```
beacon/
├── server.js                 # entrypoint: connects Mongo, starts the app
├── src/
│   ├── app.js                 # Express app factory (store injected in)
│   ├── db.js                  # Mongoose connection helper
│   ├── linkStore.js           # Mongo store + in-memory store, same interface
│   ├── models/Link.js         # Mongoose schema
│   ├── routes/links.js        # /api/links + short-code redirect route
│   └── utils/shortcode.js     # collision-resistant short code generator
├── views/                     # index.ejs, 404.ejs
├── public/                    # style.css, app.js
├── test/app.test.js           # Vitest + Supertest suite (in-memory store)
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Quick start

### With Docker (recommended)
```bash
git clone https://github.com/Aryamaan-mathur-001/beacon.git
cd beacon
docker compose up --build
```
Visit **http://localhost:4000**.

### Without Docker
Requirements: Node.js 20+, a local or hosted MongoDB instance.
```bash
npm install
cp .env.example .env      # edit MONGODB_URI if needed
npm run dev
```

## API reference

| Method | Route              | Description                          |
|--------|---------------------|----------------------------------------|
| GET    | `/api/links`         | List all links, newest first          |
| POST   | `/api/links`         | Create a shortened link (`originalUrl`, optional `label`) |
| DELETE | `/api/links/:id`     | Delete a link                         |
| GET    | `/:code`             | Redirect to the original URL, logging the click |
| GET    | `/health`            | Liveness/readiness probe              |

## Running tests

```bash
npm test
```

All six cases run against the in-memory store — no MongoDB connection needed.

## CI/CD pipeline

Every push and pull request to `main` runs:
1. **Lint & test** — `eslint` + `vitest`
2. **Build & publish** *(main only)* — builds the Docker image and pushes it to
   `ghcr.io/Aryamaan-mathur-001/beacon`, tagged `latest` and with the commit SHA

## Roadmap

- [ ] Per-link click history (not just a running count)
- [ ] Custom short codes (vanity links)
- [ ] Rate limiting on link creation

## License

MIT — see [LICENSE](./LICENSE).
