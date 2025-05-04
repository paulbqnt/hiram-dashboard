from enum import Enum

from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, Dict, Union, List
# Define the enums and models from your code

class OptionFamily(str, Enum):
    EUROPEAN = "EUROPEAN"
    AMERICAN = "AMERICAN"

class OptionType(str, Enum):
    CALL = "CALL"
    PUT = "PUT"


class ModelType(str, Enum):
    BLACK_SCHOLES = "Black Scholes"
    MONTE_CARLO = "Monte Carlo"




class OptionPricingRequest(BaseModel):
    spot: float
    volatility: float
    riskFreeRate: float
    dividendYield: float
    strike: float
    maturity: float
    optionFamily: OptionFamily
    optionType: OptionType
    modelType: ModelType

    # Optional plot parameters
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    num_points: Optional[int] = None




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


class CombinedPriceAndPlotResponse(BaseModel):
    value: float
    greeks: Greeks
    x_values: Optional[List[float]] = None
    price: Optional[List[float]] = None
    greeks_plot: Optional[Dict[str, List[float]]] = None


class PlotDataRequest(BaseModel):
    param_to_vary: str = "spot"
    min_value: float
    max_value: float
    num_points: int = 100
    optionType: OptionType = OptionType.CALL
    optionFamily: OptionFamily = OptionFamily.EUROPEAN
    modelType: ModelType = ModelType.BLACK_SCHOLES
    spot: float = 100.0
    volatility: float = 0.2
    riskFreeRate: float = 0.05
    dividendYield: float = 0.01
    strike: float = 100.0
    maturity: float = 1.0

class PlotDataResponse(BaseModel):
    x_values: List[float]
    price: List[float]
    greeks: Dict[str, List[float]]