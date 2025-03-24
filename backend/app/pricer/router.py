from http.client import HTTPException
from fastapi import APIRouter
from .model import MarketDataRequest
from .service import PricerService

router = APIRouter(
    prefix="/api/pricer",
    tags=["pricer"]
)

pricerService = PricerService()

@router.post("/options/price")
def calculate_option_price(market_data_request: MarketDataRequest):
    try:
        result = pricerService.calculate_price(market_data_request)
        return {
            "value": result["value"],
            "delta": result["delta"],
            "gamma": result["gamma"],
            "vega": result["vega"],
            "theta": result["theta"],
            "rho": result["rho"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))