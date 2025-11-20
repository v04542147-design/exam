# MongoDB — Installation, Atlas Configuration, and CRUD Examples

This project contains:
- Step-by-step instructions to install MongoDB locally (Windows/macOS/Linux) and install the MongoDB Shell (mongosh).
- Step-by-step instructions to configure MongoDB Atlas (cloud) for development or production.
- A small Node.js sample demonstrating CRUD operations (insertOne, find, updateOne, deleteOne) against either a local MongoDB or MongoDB Atlas.
- A Docker Compose file to run a local MongoDB server without installing it system-wide.

Files in this repo:
- `package.json` — Node project manifest
- `test_crud.js` — runnable script demonstrating CRUD operations
- `src/db.js` — helper to connect to MongoDB
- `src/crud.js` — CRUD helper functions
- `.env.example` — example environment variables
- `docker-compose.yml` — optional local MongoDB using Docker

## Quick start (Windows PowerShell)
1. Copy `.env.example` to `.env` and edit `MONGO_URI` (local or Atlas connection string).
2. Install dependencies:

```powershell
npm install
```

3. Run the demo:

```powershell
npm start
```

The script will connect to the database, insert a few `students` documents, query them, update and delete examples, then print results.

## Part A — Install MongoDB locally

Windows (summary):
1. Go to https://www.mongodb.com/try/download/community and download the MSI for your Windows version.
2. Run the MSI and choose "Complete".
3. Check "Install MongoDB as a Service" to run automatically (optional).
4. Optionally install MongoDB Compass when prompted.

macOS (summary):
- Use the macOS `.pkg` installer from the same download page or install via Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
```

Linux (summary):
- Follow distro-specific instructions on the MongoDB download page (Ubuntu, RHEL, Amazon Linux, etc.).

### Installing the MongoDB Shell (mongosh)
- Visit https://www.mongodb.com/try/download/shell and download the installer for your OS.
- Windows: MSI installer — run it and add `C:\Program Files\MongoDB\mongosh\` to PATH if needed.
- macOS: download the `.tgz` or use Homebrew: `brew install mongosh`.
- Linux: use the distro packages or download the tgz package.

Verify installation in a terminal:

```powershell
mongosh --version
```

To connect to a local server:

```powershell
mongosh
# then inside shell:
use mydatabase
db.mycollection.insertOne({ name: 'Test', value: 1 })
db.mycollection.find()
```

## Part B — Configure MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas and sign up.
2. Build a cluster (choose Free tier M0 for testing).
3. Create a database user under Security → Database Access. Give readWrite role for development.
4. Configure Network Access → Add IP Address. For testing you can add `0.0.0.0/0`. For production, add only trusted IPs.
5. In Clusters → Connect → Connect your application → copy the `mongodb+srv://...` connection string. Replace `<username>`, `<password>`, and database name.

## Use the Node.js sample
1. Copy `.env.example` to `.env` and edit `MONGO_URI`.
2. `npm install` then `npm start`.

If you don't want to install MongoDB locally, you can run a local server with Docker:

```powershell
docker compose up -d
```

This starts a MongoDB instance at `mongodb://localhost:27017`.

## Creating a live link / hosted demo
I can't create an externally accessible live link from here, but you can deploy the Node.js demo to a hosting provider (Render, Railway, Fly, Heroku, Vercel with a serverless function, or Replit). Steps in short:
- Push this repo to GitHub.
- Create a new app on the host of your choice, set environment variable `MONGO_URI` to your Atlas connection string, and deploy.
- The host will provide a publicly accessible URL (the "live link").

If you want, I can help deploy this repo to a chosen provider and set up the environment variables — tell me which provider and I will create the necessary deployment files and guide you through granting access.

---

## Security notes
- Never commit real credentials to version control. Use environment variables or a secret manager.
- Use IP whitelisting and least-privilege DB users for production.

## Appendix: commands used in the demo
All sample commands used by `test_crud.js` are standard MongoDB Node driver calls: `insertOne`, `find`, `updateOne`, `deleteOne`, and `deleteMany`.

Enjoy — if you'd like I'll deploy this repo to a free host and return a public live link if you provide the provider you'd like to use.