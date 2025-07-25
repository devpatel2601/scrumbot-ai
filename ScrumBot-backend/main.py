from fastapi import FastAPI
from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ScrumBot AI")

app.include_router(router, prefix="/api")
# Allow your frontend origin here
origins = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:5173",
    # Add your deployed frontend URL if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allow specific origins (or use ["*"] to allow all)
    allow_credentials=True,
    allow_methods=["*"],              # GET, POST, etc.
    allow_headers=["*"],              # Authorization, Content-Type, etc.
)
