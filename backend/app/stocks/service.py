from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from backend.app.stocks.repository import StockRepository
from backend.app.database import get_db
from hiram_pricing.stock import Stock



class StocksService:
    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.stock_repository = StockRepository(db) if db else None

    def get_all_stocks_symbols_and_names(self) -> List[Dict[str, str]]:
        return self.stock_repository.get_all_stocks_symbols_and_names()


    def get_stock_data_by_symbol(self, symbol: str):
        stock = Stock(ticker=symbol)
        hist = stock.hist
        hist['Date'] = hist.index
        hist = hist[['Open', 'High', 'Low', 'Close', 'Volume', 'Dividends']]
        hist_dict = stock.hist.to_dict(orient='records')
        return {"price": stock.price, "hist": hist_dict}
