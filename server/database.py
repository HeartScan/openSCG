import sqlite3

DATABASE_NAME = "openscg.db"

def get_db_connection():
    """Creates a connection to the SQLite database."""
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    """Initializes the database and creates tables if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL
    )
    """)

    # Create scg_records table
    # A single session can have multiple recordings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scg_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        samples_json TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    # This allows us to initialize the database from the command line
    print("Initializing database...")
    initialize_database()
    print("Database initialized successfully.")
