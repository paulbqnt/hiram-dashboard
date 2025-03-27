from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pricer.router import router as pricer_router
app = FastAPI()

origins = [
    "http://localhost:5173",
    "localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"Hello": "World"}

app.include_router(pricer_router)