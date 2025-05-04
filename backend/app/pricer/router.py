import numpy as np
from fastapi import APIRouter, HTTPException
from .model import OptionPricingRequest, PricingResult, PlotDataRequest, PlotDataResponse, CombinedPriceAndPlotResponse
from .service import PricerService

router = APIRouter(
    prefix="/api/v1/pricer",
    tags=["pricer"]
)

pricerService = PricerService()

@router.post("/options/price", response_model=CombinedPriceAndPlotResponse)
def calculate_option_price(option_pricing_request: OptionPricingRequest):
    try:
        result = pricerService.calculate_price(option_pricing_request)

        response = {
            "value": result.value,
            "greeks": result.greeks,
        }

        if (
            option_pricing_request.min_value is not None and
            option_pricing_request.max_value is not None and
            option_pricing_request.num_points is not None
        ):
            param_range = np.linspace(
                option_pricing_request.min_value,
                option_pricing_request.max_value,
                option_pricing_request.num_points
            )

            plot_data = pricerService.generate_option_data(
                param_range=param_range,
                base_request=option_pricing_request
            )

            response.update({
                "x_values": plot_data["x_values"].tolist(),
                "price": plot_data["price"].tolist(),
                "greeks_plot": {
                    greek: plot_data["greeks"][greek].tolist()
                    for greek in plot_data["greeks"]
                }
            })

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/options/plot-data", response_model=PlotDataResponse)
def get_option_plot_data(plot_request: PlotDataRequest):
    try:
        # Create the base request
        base_request = OptionPricingRequest(
            spot=plot_request.spot,
            volatility=plot_request.volatility,
            riskFreeRate=plot_request.riskFreeRate,
            dividendYield=plot_request.dividendYield,
            strike=plot_request.strikePrice,
            maturity=plot_request.maturity,
            optionType=plot_request.optionType,
            modelType=plot_request.modelType
        )

        param_range = np.linspace(
            plot_request.min_value,
            plot_request.max_value,
            plot_request.num_points
        )

        result_data = pricerService.generate_option_data(
            param_range=param_range,
            base_request=base_request
        )

        return PlotDataResponse(
            x_values=result_data['x_values'].tolist(),
            price=result_data['price'].tolist(),
            greeks={
                greek: result_data['greeks'][greek].tolist()
                for greek in result_data['greeks']
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
