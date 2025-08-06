import psycopg
from psycopg.rows import dict_row
from app.core.config import settings

def get_db_connection():
    """Creates a connection to the PostgreSQL database."""
    return psycopg.connect(settings.DATABASE_URL, row_factory=dict_row)

def initialize_database():
    """Initializes the database and creates tables if they don't exist."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        # Create sessions table with status
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id UUID PRIMARY KEY,
            created_at TIMESTAMPTZ NOT NULL,
            status TEXT NOT NULL DEFAULT 'created'
        )
        """)

        # Create scg_raw_data table for individual samples
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS scg_raw_data (
            id BIGSERIAL PRIMARY KEY,
            session_id UUID NOT NULL,
            t DOUBLE PRECISION NOT NULL,
            ax DOUBLE PRECISION NOT NULL,
            ay DOUBLE PRECISION NOT NULL,
            az DOUBLE PRECISION NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
        )
        """)
        
        # Remove old scg_records table if it exists
        cursor.execute("DROP TABLE IF EXISTS scg_records;")

        conn.commit()
    conn.close()

# Dependency for FastAPI
def get_db():
    """
    FastAPI dependency to get a database connection.
    Yields a connection and ensures it's closed after the request.
    """
    conn = None
    try:
        conn = get_db_connection()
        yield conn
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Initializing database...")
    initialize_database()
    print("Database initialized successfully.")
