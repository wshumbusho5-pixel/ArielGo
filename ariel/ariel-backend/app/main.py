from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import questions, scraper, ai

app = FastAPI(
    title="Ariel API",
    description="Revolutionary revision platform - AI-powered learning without distractors",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(scraper.router, prefix="/api/scraper", tags=["scraper"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Ariel API",
        "tagline": "Learning forward, always positive",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
