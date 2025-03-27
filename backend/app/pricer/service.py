from hiram_pricing.market_data import MarketData
from hiram_pricing.payoff import CallPayoff, PutPayoff
from hiram_pricing.engine import BlackScholesPricingEngine, BlackScholesPricingEngine, BlackScholesPricer
from hiram_pricing.option import VanillaOption
from hiram_pricing.facade import OptionFacade
from hiram_pricing.models import PricingResult, Greeks


class PricerService:
    def __init__(self):
        pass

    def calculate_price(self, marketDataRequest):
        market = MarketData(
            spot=marketDataRequest.underlyingPrice,
            rate=marketDataRequest.riskFreeRate,
            volatility=marketDataRequest.volatility,
            dividend=marketDataRequest.dividendYield
        )

        payoff = CallPayoff(strike=marketDataRequest.strikePrice) if marketDataRequest.isCall else PutPayoff(strike=marketDataRequest.strikePrice)
        option = VanillaOption(payoff=payoff, expiry=marketDataRequest.maturity)
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