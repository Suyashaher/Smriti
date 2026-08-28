from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager

from .config import settings
from .database import create_indexes, client

from app.routers import health, auth, patients, games, reminders, routines, settings as settings_router, sync, caregivers, analytics, alerts, family

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_indexes()
    yield
    # Shutdown
    client.close()

app = FastAPI(
    title="Smriti API",
    version=settings.app_version,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(games.router)
app.include_router(games.router2)
app.include_router(reminders.router)
app.include_router(routines.router)
app.include_router(settings_router.router)
app.include_router(sync.router)
app.include_router(caregivers.router)
app.include_router(analytics.router)
app.include_router(alerts.router)
app.include_router(family.router)
app.include_router(family.patients_router)

@app.get("/")
def root():
    return RedirectResponse(url="/docs")
