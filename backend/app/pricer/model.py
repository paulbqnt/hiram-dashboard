from enum import Enum

from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, Dict, Union


class OptionType(str, Enum):
    EUROPEAN = "EUROPEAN"
    AMERICAN = "AMERICAN"


class ModelType(str, Enum):
    BLACK_SCHOLES = "Black Scholes"
    MONTE_CARLO = "Monte Carlo"


class OptionPricingRequest(BaseModel):
    underlyingPrice: float = Field(default=100, ge=0.0)
    volatility: float = Field(default=0.2, ge=0.0)
    riskFreeRate: float = Field(default=0.05, ge=0.0)
    dividendYield: float = Field(default=0, ge=0.0)
    strikePrice: float = Field(default=100, ge=0.0)
    maturity: float = Field(default=1, ge=0.0)
    optionType: OptionType
    isCall: bool = True
    modelType: ModelType



class Greeks(BaseModel):
    delta: Optional[float] = None
    gamma: Optional[float] = None
    vega: Optional[float] = None
    theta: Optional[float] = None
    rho: Optional[float] = None

    model_config = ConfigDict(
        extra='ignore',
        strict=False
    )

class PricingResult(BaseModel):
    value: float
    greeks: Greeks = Field(default_factory=Greeks)

    def to_json(self) -> Dict[str, Union[float, Dict[str, Optional[float]]]]:
        return {
            "value": self.value,
            "greeks": self.greeks.model_dump()
        }
