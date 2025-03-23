from fastapi import FastAPI
from app.routes import users, events, sessions, feedback

app = FastAPI()

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])

@app.get("/")
def root():
    return {"message": "Realtime Feedback API Running"}
