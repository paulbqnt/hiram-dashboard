from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from backend.app.stocks.repository import StockRepository
from backend.app.database import get_db
from hiram_pricing.stock import Stock
import numpy as np
import pandas as pd
from fastapi import status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import json

class StocksService:
    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.stock_repository = StockRepository(db) if db else None

    def get_all_stocks_symbols_and_names(self) -> List[Dict[str, str]]:
        return self.stock_repository.get_all_stocks_symbols_and_names()

    def get_stock_data_by_symbol(self, symbol: str):
        try:
            stock = Stock(ticker=symbol)
            hist = stock.hist.copy()  # Create an explicit copy
            hist['Date'] = hist.index
            hist = hist[['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Dividends']]
            hist['daily_return'] = hist['Close'].pct_change()
            hist['cumulative_return'] = (1 + hist["daily_return"]).cumprod() - 1

            hist = json.loads(hist.to_json(orient='records'))


            return {"hist": hist}


        except Exception as e:
            print(f"Error processing {symbol}: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"price": None, "hist": [], "error": str(e)}
            )