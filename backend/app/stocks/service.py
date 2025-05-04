from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from backend.app.stocks.repository import StockRepository
from backend.app.database import get_db
import yfinance as yf
import numpy as np
import pandas as pd
from fastapi import status
from fastapi.responses import JSONResponse

from backend.app.stocks.utils import FIELDS


def calculate_performance(hist, days):
    try:
        start_date = hist['Date'].max() - pd.Timedelta(days=days)
        filtered_hist = hist[hist['Date'] >= start_date]

        # Check if we have enough data
        if len(filtered_hist) < 2:
            return None

        first_val = filtered_hist['cumulative_return'].iloc[0]
        last_val = filtered_hist['cumulative_return'].iloc[-1]

        if first_val is None or last_val is None:
            return None

        performance = ((last_val - first_val) * 100)
        if isinstance(performance, (np.float64, np.float32)):
            performance = float(performance)

        if performance is not None and np.isfinite(performance):
            return round(performance, 2)
        return None

    except Exception as e:
        print(f"Error calculating performance for {days} days: {e}")
        return None


def calculate_ytd_performance(hist):
    try:
        if hist['Date'].dt.tz is not None:
            hist['Date'] = hist['Date'].dt.tz_localize(None)

        current_year = hist['Date'].dt.year.max()
        if pd.isna(current_year):
            return None

        start_of_year = pd.Timestamp(year=current_year, month=1, day=1)
        filtered_hist = hist[hist['Date'] >= start_of_year]

        if len(filtered_hist) < 2:
            return None

        first_val = filtered_hist['cumulative_return'].iloc[0]
        last_val = filtered_hist['cumulative_return'].iloc[-1]

        if first_val is None or last_val is None:
            return None

        performance = ((last_val - first_val) * 100)
        if isinstance(performance, (np.float64, np.float32)):
            performance = float(performance)

        if performance is not None and np.isfinite(performance):
            return round(performance, 2)
        return None

    except Exception as e:
        print(f"Error calculating YTD performance: {e}")
        return None


def make_json_serializable(obj: Any) -> Any:
    """Convert NumPy types to Python native types for JSON serialization."""
    if isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        if not np.isfinite(obj):
            return None
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return [make_json_serializable(x) for x in obj]
    elif isinstance(obj, pd.DataFrame):
        return make_json_serializable(obj.to_dict('records'))
    elif isinstance(obj, pd.Series):
        return make_json_serializable(obj.to_dict())
    elif isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(item) for item in obj]
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif obj is None or isinstance(obj, (str, int, float, bool)):
        return obj
    else:
        # Fallback for other types: try to convert to string
        try:
            return str(obj)
        except:
            return None


class StocksService:
    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.stock_repository = StockRepository(db) if db else None

    def get_all_stocks_symbols_and_names(self) -> List[Dict[str, str]]:
        result = self.stock_repository.get_all_stocks_symbols_and_names()
        return make_json_serializable(result)

    def get_stock_data_by_symbol(self, symbol: str):
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period="5y")  # Create an explicit copy
            stock_info_needed = {k: v for k in FIELDS if (v := stock.info.get(k)) is not None}
            hist['Date'] = hist.index
            if pd.api.types.is_datetime64_any_dtype(hist['Date']):
                hist['Date'] = hist['Date'].dt.to_pydatetime()

            # Extract only needed columns
            hist = hist[['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Dividends']]

            # Replace NumPy NaN values with None which is JSON serializable
            hist = hist.replace([np.nan, np.inf, -np.inf], None)

            # Calculate returns
            hist['daily_return'] = hist['Close'].pct_change()
            hist['daily_return'] = hist['daily_return'].replace([np.nan, np.inf, -np.inf], None)

            # Calculate cumulative returns
            cumulative_return = []
            current_cum_return = 0

            for return_val in hist['daily_return']:
                if return_val is not None:
                    current_cum_return = (1 + current_cum_return) * (1 + return_val) - 1
                cumulative_return.append(current_cum_return)

            hist['cumulative_return'] = cumulative_return

            performance = {
                "fiveYears": calculate_performance(hist, 5 * 365),
                "threeYears": calculate_performance(hist, 3 * 365),
                "oneYear": calculate_performance(hist, 252),
                "sixMonths": calculate_performance(hist, 182),
                "oneMonth": calculate_performance(hist, 30),
                "ytd": calculate_ytd_performance(hist)
            }

            # Remove None values for JSON compliance
            performance = {k: v for k, v in performance.items() if v is not None}

            # Get the current price correctly from yfinance API
            # First try the fast_info property which is recommended by yfinance
            price = None
            try:
                # First method: Use fast_info.last_price which is the recommended method
                if hasattr(stock, 'fast_info') and hasattr(stock.fast_info, 'last_price'):
                    price = stock.fast_info.last_price
                # Second method: Use the last closing price from history
                elif not hist.empty and hist['Close'].iloc[-1] is not None:
                    price = hist['Close'].iloc[-1]
                # Third method: Try the direct info dictionary
                elif 'regularMarketPrice' in stock.info:
                    price = stock.info['regularMarketPrice']
                elif 'currentPrice' in stock.info:
                    price = stock.info['currentPrice']

                # Ensure price is a proper float
                if price is not None:
                    if isinstance(price, (np.float64, np.float32)):
                        price = float(price)

                    # Check if price is a finite number
                    if not np.isfinite(price):
                        price = None
            except Exception as price_error:
                print(f"Error getting price for {symbol}: {str(price_error)}")
                price = None

            response = {
                "price": round(price, 2) if price is not None else None,
                "performance": performance,
                "hist": hist,
                "info": stock_info_needed
            }

            return make_json_serializable(response)

        except Exception as e:
            print(f"Error processing {symbol}: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"price": None, "error": str(e)}
            )