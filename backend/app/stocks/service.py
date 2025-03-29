from typing import List, Dict
from sqlalchemy.orm import Session
from backend.app.stocks.model import Stock
from backend.app.stocks.repository import StockRepository
from backend.app.database import get_db




class StocksService:
    def __init__(self, db: Session):
        self.db = db
        self.stock_repository = StockRepository(db)

    def get_all_stocks_symbols_and_names(self) -> List[Dict[str, str]]:
        return self.stock_repository.get_all_stocks_symbols_and_names()