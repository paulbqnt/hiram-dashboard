from enum import Enum

from pydantic import BaseModel, Field
from typing import Literal

class OptionType(str, Enum):
    EUROPEAN = "EUROPEAN"
    AMERICAN = "AMERICAN"


class ModelType(str, Enum):
    BLACK_SCHOLES = "Black Scholes"
    MONTE_CARLO = "Monte Carlo"


class MarketDataRequest(BaseModel):
    underlyingPrice: float = Field(..., ge=0.0)
    volatility: float = Field(..., ge=0.0)
    riskFreeRate: float = Field(..., ge=0.0)
    dividendYield: float = Field(..., ge=0.0)
    strikePrice: float = Field(..., ge=0.0)
    maturity: float = Field(..., ge=0.0)
    optionType: OptionType
    isCall: bool = True  # Set default value to True
    modelType: ModelType


class OptionPricingRequest(BaseModel):
    underlyingPrice: float
    volatility: float
    riskFreeRate: float
    dividendYield: float
    optionType: str  # "CALL" or "PUT"
    modelType: ModelType   # "BlackScholes" or "MonteCarlo"
    strikePrice: float
    maturity: float