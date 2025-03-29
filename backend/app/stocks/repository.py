from sqlalchemy.orm import Session, InstrumentedAttribute
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional, Dict
from backend.app.stocks.model import Stock

class StockRepository:
    def __init__(self, db: Session):
        self.db = db


    def get_all_stocks_symbols_and_names(self):
        """
         Retrieve all stocks symbols and security names
         """
        return [{"symbol": stock.symbol, "security_name": stock.security_name} for stock in self.db.query(Stock).all()]
