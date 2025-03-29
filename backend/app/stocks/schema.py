from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class StockBase(BaseModel):
    symbol: str
    name: Optional[str] = None
    current_price: Optional[float] = None

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: int
    last_updated: datetime

    # Enable ORM mode for compatibility with SQLAlchemy
    model_config = ConfigDict(from_attributes=True)