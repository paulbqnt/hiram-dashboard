from fastapi import FastAPI
from pricer.router import router as pricer_router
app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(pricer_router)