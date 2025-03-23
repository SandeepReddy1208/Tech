from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.schemas import EventCreate

router = APIRouter()

@router.post("/create")
def create_event(event: EventCreate):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("INSERT INTO events (title, description, date, location, organizer_id, access_code) VALUES (%s, %s, %s, %s, %s, %s)",
                   (event.title, event.description, event.date, event.location, event.organizer_id, event.access_code))
    db.commit()
    return {"message": "Event created successfully"}
