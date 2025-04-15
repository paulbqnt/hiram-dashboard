from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
from backend.app.database import get_db
from backend.app.stocks.service import StocksService

router = APIRouter(
    prefix="/api/stocks",
    tags=["stocks"]
)


@router.get("/reference/data/symbols", response_model=List[Dict[str, str]])
def get_stocks_data(db: Session = Depends(get_db)):
    try:
        stocks_service = StocksService(db)
        result = stocks_service.get_all_stocks_symbols_and_names()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{symbol}/data")
def get_stocks_data(symbol: str):
    try:
        stocks_service = StocksService()
        result = stocks_service.get_stock_data_by_symbol(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

