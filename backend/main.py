import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.routers import auth, member1_plant, member2, member3, member4
from app.user_model import User

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

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@bioheritage.ai")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == admin_email).first()
        if not existing:
            admin = User(email=admin_email, hashed_password=hash_password(admin_password), role="admin")
            db.add(admin)
            db.commit()
            print(f"Seeded default admin account: {admin_email} / {admin_password} (change this password!)")
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(member1_plant.router, prefix="/api/member1", tags=["member1-plant-identification"])
app.include_router(member2.router, prefix="/api/member2", tags=["member2"])
app.include_router(member3.router, prefix="/api/member3", tags=["member3"])
app.include_router(member4.router, prefix="/api/member4", tags=["member4"])
