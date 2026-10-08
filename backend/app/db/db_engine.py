import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(PROJECT_ROOT / ".env")

engine = create_engine(
    os.environ["DATABASE_URL"],
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine)
