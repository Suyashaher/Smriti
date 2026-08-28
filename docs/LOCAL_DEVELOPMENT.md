# Starting the Full Stack Locally

With the completion of Phase 8, Smriti now operates as a full-stack application with offline-first capabilities.

## 1. Start MongoDB
Ensure Docker Desktop is running.
```bash
docker-compose up -d
```
This starts MongoDB 7.0 on `localhost:27017` with a persistent volume (`mongo-data`).

## 2. Start the FastAPI Backend
Open a new terminal.
```bash
cd backend
python -m venv .venv
# Activate venv:
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The backend API is now running at `http://localhost:8000`.
Swagger documentation is available at `http://localhost:8000/docs`.

## 3. Start the React Frontend
Open a third terminal.
```bash
cd frontend
npm install
npm run dev
```
The frontend is now running at `http://localhost:5173`.
Vite is configured to proxy `/api/*` requests to `http://localhost:8000/*` to avoid CORS issues during development.

## Testing Offline Sync
1. With all three services running, open the app in Chrome.
2. In Chrome DevTools > Network tab, select "Offline".
3. Play a game or create a reminder. Notice the UI shows "Offline" in the top right.
4. Switch back to "No throttling" (Online).
5. Watch the top right indicator change to "Syncing..." and then "Saved".
6. Check MongoDB (or FastAPI logs) to verify the data arrived.
