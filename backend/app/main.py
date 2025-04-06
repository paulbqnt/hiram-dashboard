import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.pricer.router import router as pricer_router
from backend.app.stocks.router import router as stocks_router

app = FastAPI()

origins = [
    "http://localhost:5173",  # Add your frontend URL here
    # Add more origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"Hello": "World"}

app.include_router(pricer_router)
app.include_router(stocks_router)