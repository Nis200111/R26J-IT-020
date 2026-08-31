import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, SessionLocal, engine
from app.routers import member1_plant, member2, member3, member4

app = FastAPI(title="Bio Heritage AI - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": True, "message": "Something went wrong in this feature. Other features are not affected."},
    )


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Loads the herb assistant's models on a background thread, so the first
    # question does not pay the ~17 s startup cost.
    member2.warm_up()



@app.get("/api/health")
def health():
    return {"status": "ok"}



app.include_router(member1_plant.router, prefix="/api/member1", tags=["member1-plant-identification"])
app.include_router(member2.router, prefix="/api/member2", tags=["member2"])
app.include_router(member3.router, prefix="/api/member3", tags=["member3"])
app.include_router(member4.router, prefix="/api/member4", tags=["member4"])
