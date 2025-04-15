from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from backend.app.database import Base

class ReferenceStock(Base):
    __tablename__ = "reference_stocks"

    id = Column(Integer, primary_key=True)
    symbol = Column(String)
    security_name = Column(String)
    gics_sector = Column(String)
    gics_sub_sector = Column(String)
    market_index = Column(String)


    def __repr__(self):
        return f"<Stock {self.symbol}: {self.security_name} {self.gics_sector} {self.gics_sub_sector}>"
