import numpy as np
from hiram_pricing.market_data import MarketData
from hiram_pricing.payoff import CallPayoff, PutPayoff
from hiram_pricing.engine import BlackScholesPricingEngine, BlackScholesPricer
from hiram_pricing.option import VanillaOption
from hiram_pricing.facade import OptionFacade
from hiram_pricing.models import PricingResult, Greeks

from backend.app.pricer.model import OptionPricingRequest, ModelType, OptionType, OptionFamily


class PricerService:
    def __init__(self):
        pass

    @staticmethod
    def calculate_price(request):
        market = MarketData(
            spot=request.spot,
            rate=request.riskFreeRate,
            volatility=request.volatility,
            dividend=request.dividendYield
        )

        payoff = CallPayoff(strike=request.strike) if request.optionType.CALL else PutPayoff(strike=request.strike)
        option = VanillaOption(payoff=payoff, expiry=request.maturity)
        pricing_engine = BlackScholesPricingEngine(pricer=BlackScholesPricer)
        option_facade = OptionFacade(option, pricing_engine, market)
        result = option_facade.price()

        return PricingResult(
            value=result['value'],
            greeks=Greeks(
                delta=result["greeks"].get('delta'),
                gamma=result["greeks"].get('gamma'),
                vega=result["greeks"].get('vega'),
                theta=result["greeks"].get('theta'),
                rho=result["greeks"].get('rho')
            )
        )


    @staticmethod
    def generate_option_data(base_request, param_range, param_to_vary="spot"):
        if base_request is None:
            base_request = OptionPricingRequest(
                spot=100.0,
                volatility=0.2,
                riskFreeRate=0.05,
                dividendYield=0.01,
                strikePrice=100.0,
                maturity=1.0,
                optionFamily=OptionFamily.EUROPEAN,
                optionType=OptionType.CALL,
                modelType=ModelType.BLACK_SCHOLES
            )

        if param_range is None:
            if param_to_vary == 'spot':
                param_range = np.linspace(50, 150, 100)
            elif param_to_vary == 'strikePrice':
                param_range = np.linspace(50, 150, 100)
            elif param_to_vary == 'riskFreeRate':
                param_range = np.linspace(0.01, 0.1, 100)
            elif param_to_vary == 'volatility':
                param_range = np.linspace(0.05, 0.5, 100)
            elif param_to_vary == 'dividendYield':
                param_range = np.linspace(0, 0.05, 100)
            elif param_to_vary == 'maturity':
                param_range = np.linspace(0.1, 2.0, 100)

        prices = np.zeros_like(param_range, dtype=float)
        deltas = np.zeros_like(param_range, dtype=float)
        gammas = np.zeros_like(param_range, dtype=float)
        vegas = np.zeros_like(param_range, dtype=float)
        thetas = np.zeros_like(param_range, dtype=float)
        rhos = np.zeros_like(param_range, dtype=float)

        pricer = PricerService()

        for i, param_value in enumerate(param_range):
            request_dict = {"spot": base_request.spot, "volatility": base_request.volatility,
                            "riskFreeRate": base_request.riskFreeRate, "dividendYield": base_request.dividendYield,
                            "strikePrice": base_request.strikePrice, "maturity": base_request.maturity,
                            "optionType": base_request.optionType, "isCall": base_request.isCall,
                            "modelType": base_request.modelType, param_to_vary: float(param_value)}

            request = OptionPricingRequest(**request_dict)

            result = pricer.calculate_price(request)

            prices[i] = result.value
            deltas[i] = result.greeks.delta if result.greeks.delta is not None else 0.0
            gammas[i] = result.greeks.gamma if result.greeks.gamma is not None else 0.0
            vegas[i] = result.greeks.vega if result.greeks.vega is not None else 0.0
            thetas[i] = result.greeks.theta if result.greeks.theta is not None else 0.0
            rhos[i] = result.greeks.rho if result.greeks.rho is not None else 0.0

        return {
            'x_values': param_range,
            'price': prices,
            'greeks': {
                'delta': deltas,
                'gamma': gammas,
                'vega': vegas,
                'theta': thetas,
                'rho': rhos
            }
        }
