# 🤖 Ask My DB AI — Talk to Your Database

Turn simple English into SQL queries — and get results instantly.  
Built with **FastAPI**, **React**, **OpenRouter**, and **MySQL**.

> “Ask your database questions like you talk to a colleague.”

---

## 🧱 Architecture Diagram

────────────────┐ NATURAL LANGUAGE ┌─────────────────────────────┐
│ ✨ React App │ ───────────────────────▶ │ 🧠 FastAPI Backend │
│ - Tailwind UI │ │ - Table Extraction (LLM) │
│ - Query History │ ◀─────────────────────── │ - Secure SQL Generation │
└────────────────┘ SQL + DATA │ - MySQL Execution Layer │
│ - OpenRouter Chat Completions│
└──────────────┬──────────────┘
│
SQL Query ▼
┌─────────────────┐
│ 🛢 MySQL Database│
└─────────────────┘
