# 🕷️ Web Scraper

[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-%5E8.0.0-E0234E)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D4.0-blue)](https://www.typescriptlang.org/)
[![Axios](https://img.shields.io/badge/Axios-0.21.1-3b82f6)](https://axios-http.com/)
[![Cheerio](https://img.shields.io/badge/Cheerio-1.0.0-ff69b4)](https://cheerio.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> A powerful and flexible web scraping tool built with Node.js, NestJS, Axios, and Cheerio to extract and store website data efficiently.

---

## 📌 Features
- 🔍 Extract page **title** and headings (**H1**, **H2**, **H3**)
- ⏳ Add **timestamp** for each scrape
- 📂 Save results as JSON files in `scraped-data/`
- ⚡ Lightweight & fast
- 🛠 Robust error handling for invalid URLs and network errors
- ✅ Returns JSON response from API and persists same object to disk

---

## 💡 How it works (visual)
```mermaid
graph TD
    subgraph "Web Scraper API"
        A[POST /scrape with URL] --> B{Axios};
        B -- Fetches HTML --> C{Cheerio};
        C -- Parses HTML --> D[Extract Title & Headings];
        D -- Formats Data --> E{JSON Object};
    end

    subgraph "Output"
        E --> F[API Response];
        E --> G[Save to .json file];
    end
```

## 🛠 Tech Stack
- Node.js (v14+)
- NestJS (framework)
- TypeScript
- Axios (HTTP client)
- Cheerio (server-side HTML parsing)
- Prettier / ESLint (optional)
