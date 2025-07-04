# Confesso 🎙️

Confesso is an anonymous voice confession platform where users can record, upload, and listen to confessions. Users can explore trending confessions, interact using emoji reactions, and even delete their own submissions via a unique deletion code — all without creating an account.

Built with [Next.js](https://nextjs.org) + [Supabase](https://supabase.com).

---

## 🚀 Features

- 🎤 **Anonymous Voice Upload** — No login required.
- 🧾 **Optional Description & Tags** — Provide context and categorize confessions.
- 🔒 **Deletion via Unique Code** — Each upload returns a private deletion code.
- 📈 **"Today's Popular"** — See which confessions were most played in the last 24 hours.
- 🧠 **Clean UI** — Minimal, intuitive interface for ease of use.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router, TypeScript)
- **Backend**: Supabase (Database, Auth, Storage, CRON jobs)
- **Audio**: WebM recording + Supabase Storage

---

## 🧪 Getting Started (Dev Setup)

Clone the repo and install dependencies:

```bash
git clone https://github.com/ykDhiRaj/confesso.git
cd confesso
npm install
