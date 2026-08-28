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

_raw_origins = settings.cors_origins.strip()
if _raw_origins == "*":
    _origins = ["*"]
    _allow_creds = False
else:
    _origins = [o.strip() for o in _raw_origins.split(",")]
    _allow_creds = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_allow_creds,
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
