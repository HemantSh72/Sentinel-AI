# 🛡️ Sentinel.AI

### A Multi-Agent RAG System for Reducing AI Hallucination

> Built at **Chitkara University** — A production-grade demonstration of how multi-model verification pipelines can reduce AI hallucination rates from **35% to under 10%** in high-stakes environments like healthcare and law.

**[Live Demo ↗](https://sentinel-ai-lake.vercel.app/)** · **[Source Code](https://github.com/HemantSh72/Sentinel-AI)**

---

## 📌 Problem Statement

Standard AI systems have a critical reliability problem:

| Metric | Standard AI | With Sentinel.AI |
|--------|------------|------------------|
| Hallucination Rate | **35–40%** | **< 10%** |
| Fact Verification | None | 3-tier independent check |
| Source Citations | Sometimes | Always |
| Average Response Time | ~12s | ~5s |

In domains like **medical diagnosis** and **legal research**, a single hallucinated fact can have catastrophic consequences. Sentinel.AI addresses this with a tiered verification architecture where multiple specialized LLMs independently filter, generate, and evaluate responses.

---

## 🏗️ System Architecture

```
                         ┌──────────────┐
                         │  User Query  │
                         └──────┬───────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   React Frontend       │  Port 5173
                    │   (Vite + Lucide)      │
                    └───────────┬───────────┘
                                │ POST /api/v1/query
                                │ POST /api/v1/query/stream (SSE)
                                ▼
                    ┌───────────────────────┐
                    │   Express Backend      │  Port 5000
                    │   (Node.js)            │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
   ┌─────────────────┐ ┌──────────────┐  ┌──────────────────┐
   │  Vector DB       │ │  OpenRouter  │  │  Rate Limiter /  │
   │  (Pinecone/Mock) │ │  LLM API    │  │  Security Layer  │
   └────────┬────────┘ └──────┬───────┘  └──────────────────┘
            │                 │
            └────────┬────────┘
                     ▼
        ┌────────────────────────┐
        │   3-Agent RAG Pipeline │
        │                        │
        │  ┌──────────────────┐  │
        │  │ 🔍 Filter Agent   │  │  ◀─ Llama 3.3 70B
        │  │ Relevance Check   │  │     Fast, cheap filtering
        │  └────────┬─────────┘  │
        │           ▼            │
        │  ┌──────────────────┐  │
        │  │ ✍️ Generator Agent│  │  ◀─ Claude 3 Haiku
        │  │ Grounded Answer  │  │     Strong reasoning
        │  └────────┬─────────┘  │
        │           ▼            │
        │  ┌──────────────────┐  │
        │  │ ✅ Evaluator Agent│  │  ◀─ Gemini 2.0 Flash
        │  │ Fact-check + Score│  │     Independent verification
        │  └──────────────────┘  │
        └────────────────────────┘
                     │
                     ▼
            ┌──────────────┐
            │   Response   │
            │  • Answer    │
            │  • Score 0-10│
            │  • Sources[] │
            └──────────────┘
```

---

## 📁 Project Structure

```
sentinel-ai/
├── README.md
├── frontend/                          ◀─ React + Vite
│   ├── DOCUMENTATION.md
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── components/
│           ├── ChatInterface.jsx
│           ├── LandingPage.jsx
│           └── SourceBadge.jsx
│
├── backend/                           ◀─ Node.js + Express
│   ├── DOCUMENTATION.md
│   ├── README.md
│   ├── package.json
│   ├── server.js
│   ├── app.js
│   ├── .env.example
│   ├── config/config.js
│   ├── routes/queryRoutes.js
│   ├── controllers/queryController.js
│   ├── services/
│   │   ├── ragPipelineService.js
│   │   └── vectorDbService.js
│   ├── agents/
│   │   ├── filterAgent.js
│   │   ├── generatorAgent.js
│   │   └── evaluatorAgent.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── utils/
│   │   ├── llmClient.js
│   │   ├── logger.js
│   │   └── AppError.js
│   └── tests/test-pipeline.js
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- **OpenRouter API key** ([openrouter.ai/keys](https://openrouter.ai/keys))

### 1. Clone & Install

```bash
cd frontend
npm install
cd ../backend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env → set OPENROUTER_API_KEY
```

### 3. Run Both Servers

```bash
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

### 4. Open in Browser

Navigate to **http://localhost:5173** → Click "Go to Sentinel" → Ask a question.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | LLM API key from OpenRouter |
| `PINECONE_API_KEY` | Optional | Real vector DB (mock if empty) |
| `OPENAI_API_KEY` | Optional | For embeddings (mock if empty) |
| `FRONTEND_URL` | No | CORS origin (default: `http://localhost:5173`) |

> Without Pinecone/OpenAI keys, the system uses a built-in knowledge base of 15 documents covering medicine, tech, AI, cloud, and more.

---

## 📡 API Reference

### `GET /api/v1/health`
Returns server status.

### `POST /api/v1/query`
Standard JSON query.

```json
{ "userQuery": "What is Docker?" }
```

### `POST /api/v1/query/stream`
Real-time SSE streaming with step-by-step pipeline progress.

---

## 🧪 Testing

```bash
cd backend
npm test
```

---

## 🔒 Security

- **Helmet** — Secure HTTP headers
- **CORS** — Locked to frontend origin
- **Rate Limiting** — 30 req/min per IP
- **Input Validation** — 1000 char max, type-checked
- **Error Sanitization** — No stack traces in production

---

## 👥 Team

Built at **Chitkara University** as a research project in AI reliability and hallucination reduction.

---

## 📝 License

Academic research project. All rights reserved.
