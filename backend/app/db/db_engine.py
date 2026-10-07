from sqlalchemy import create_engine

class DBEngine:

    def __init__(self):
        self.engine = create_engine()