from fastapi import APIRouter, HTTPException
from .model import OptionPricingRequest, PricingResult
from .service import PricerService

router = APIRouter(
    prefix="/api/pricer",
    tags=["pricer"]
)

pricerService = PricerService()

@router.post("/options/price", response_model=PricingResult)
def calculate_option_price(option_pricing_request: OptionPricingRequest):
    try:
        result = pricerService.calculate_price(option_pricing_request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))