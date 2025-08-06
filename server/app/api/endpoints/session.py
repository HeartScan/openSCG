import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from psycopg import Connection
from app.shared.limiter import limiter
from app.models.session import Session
from app.models.sample import Sample
from app.models.error import Error
from app.db.database import get_db
from app.core.sockets import manager
from typing import List

router = APIRouter()

@router.post("/sessions", response_model=Session, status_code=201)
@limiter.limit("10/minute")
def create_session(request: Request, db: Connection = Depends(get_db)):
    """
    Creates a new measurement session.
    """
    session_id = uuid.uuid4()
    created_at = datetime.now(timezone.utc)
    
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO sessions (id, created_at, status) VALUES (%s, %s, %s)",
                (session_id, created_at, 'created')
            )
            db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    return Session(
        sessionId=session_id,
        createdAt=created_at,
        status='created',
        viewerUrl=f"/view/{session_id}",
        websocketUrl=f"/ws/{session_id}"
    )

@router.post("/sessions/{session_id}/end", responses={404: {"model": Error}})
@limiter.limit("60/minute")
def end_session(request: Request, session_id: uuid.UUID, db: Connection = Depends(get_db)):
    """
    Marks a session as complete and writes the buffered data to the database.
    """
    # 1. Get buffered data from the connection manager
    buffered_data = manager.get_and_clear_data(str(session_id))

    try:
        with db.cursor() as cursor:
            # 2. Update session status
            cursor.execute(
                "UPDATE sessions SET status = %s WHERE id = %s",
                ('ended', session_id)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Session not found")

            # 3. Write buffered data to the database
            if buffered_data:
                data_to_insert = [
                    (session_id, sample.t, sample.ax, sample.ay, sample.az)
                    for sample in buffered_data
                ]
                cursor.executemany(
                    "INSERT INTO scg_raw_data (session_id, t, ax, ay, az) VALUES (%s, %s, %s, %s, %s)",
                    data_to_insert
                )
            
            db.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    return {"message": f"Session ended successfully. {len(buffered_data)} samples saved."}

@router.get("/sessions/{session_id}", response_model=Session, responses={404: {"model": Error}})
@limiter.limit("60/minute")
def get_session_metadata(request: Request, session_id: uuid.UUID, db: Connection = Depends(get_db)):
    """
    Retrieves metadata for a specific session.
    """
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT id, created_at, status FROM sessions WHERE id = %s", (session_id,))
            session_row = cursor.fetchone()
            if not session_row:
                raise HTTPException(status_code=404, detail="Session not found")
            
            return Session(
                sessionId=session_row['id'],
                createdAt=session_row['created_at'],
                status=session_row['status'],
                viewerUrl=f"/view/{session_row['id']}",
                websocketUrl=f"/ws/{session_row['id']}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.get("/sessions/{session_id}/data", responses={404: {"model": Error}})
@limiter.limit("60/minute")
def get_session_data(request: Request, session_id: uuid.UUID, db: Connection = Depends(get_db)):
    """
    Retrieves the full raw data for a completed session.
    """
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT t, ax, ay, az FROM scg_raw_data WHERE session_id = %s ORDER BY t", (session_id,))
            data_rows = cursor.fetchall()
            if not data_rows:
                # Check if session exists at all to give a proper 404
                cursor.execute("SELECT id FROM sessions WHERE id = %s", (session_id,))
                if not cursor.fetchone():
                    raise HTTPException(status_code=404, detail="Session not found")
            
            return {"samples": [Sample(t=row['t'], ax=row['ax'], ay=row['ay'], az=row['az']) for row in data_rows]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
