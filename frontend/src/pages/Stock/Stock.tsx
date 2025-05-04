import React, { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import {
    Button,
    ComboboxItem,
    Container,
    OptionsFilter,
    Paper,
    Select,
    Text,
    Title,
    LoadingOverlay,
    Group,
    Badge,
    Flex,
    Grid,
    Divider,
    Table,
    ThemeIcon,
    Tooltip
} from "@mantine/core";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import {ArrowUp, ArrowDown, Coin, TrendingUp, Activity, ChartBar, Star} from 'tabler-icons-react';

interface StockSymbol {
    symbol: string;
    security_name: string;
}

interface StockPriceData {
    date: string;
    close: number;
    cumulativeReturn: number;
    volume: number;
}

interface OptionsData {
    expiry_dates: string[];
    put_call_ratio: number;
    nearest_expiry: string;
}

interface StockResponse {
    price: number;
    hist: any[];
    market_cap: number;
    pe_ratio: number;
    beta: number;
    dividend_yield: number;
    fifty_two_week_high: number;
    fifty_two_week_low: number;
    ma_50: number;
    ma_200: number;
    rsi: number;
    historical_volatility: number;
    options_data: OptionsData | null;
}

const optionsFilter: OptionsFilter = ({ options, search }) => {
    const splittedSearch = search.toLowerCase().trim().split(' ');
    return (options as ComboboxItem[]).filter((option) => {
        const words = option.label.toLowerCase().trim().split(' ');
        return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
    });
};

// Function to fetch stock symbols from the server
const fetchStockSymbols = async () => {
    try {
        const { data } = await axios.get('http://localhost:8000/api/v1/stocks/reference/data/symbols');
        console.log("Fetched stock symbols:", data);
        return data as StockSymbol[];
    } catch (error) {
        console.error("Error fetching stock symbols:", error);
        throw error;
    }
};

// Function to transform backend data to frontend expected format
const transformStockData = (data) => {
    return data.map(item => ({
        date: new Date(item.Date).toISOString().split('T')[0], // Format date as YYYY-MM-DD
        close: item.Close,
        volume: item.Volume,
        cumulativeReturn: item.cumulative_return
    }));
};

// Function to fetch price data for a specific stock
const fetchStockPriceData = async (symbol: string) => {
    if (!symbol) return null;
    try {
        const { data } = await axios.get(`http://localhost:8000/api/stocks/${symbol}/data`);
        console.log("Fetched stock price data:", data);
        return data as StockResponse;
    } catch (error) {
        console.error("Error fetching stock price data:", error);
        throw error;
    }
};

// Format large numbers for display
const formatLargeNumber = (num: number | undefined): string => {
    if (num === undefined) return 'N/A';

    if (num >= 1000000000) {
        return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(2)}K`;
    } else {
        return `$${num.toFixed(2)}`;
    }
};

const Stock: React.FC = () => {
    const [selectedStock, setSelectedStock] = useState<string | null>(null);
    const [shouldFetchPrice, setShouldFetchPrice] = useState(false);
    const [timeRange, setTimeRange] = useState<'5y' | '1y' | '6m' | '1m'>('1y');
    const [analysisRun, setAnalysisRun] = useState(false);
    const [portfolioStocks, setPortfolioStocks] = useState<string[]>([]);
    // Query for stock symbols
    const {
        data: symbolsData,
        error: symbolsError,
        isLoading: symbolsLoading
    } = useQuery({
        queryKey: ['stockSymbols'],
        queryFn: fetchStockSymbols,
    });

    // Query for stock price data - only runs when shouldFetchPrice is true
    const {
        data: stockData,
        error: priceError,
        isLoading: priceLoading,

        refetch: refetchPriceData
    } = useQuery({
        queryKey: ['stockPrice', selectedStock],
        queryFn: () => fetchStockPriceData(selectedStock || ''),
        enabled: shouldFetchPrice && !!selectedStock,
        onSuccess: () => {
            setShouldFetchPrice(false); // Reset after successful fetch
        }
    });

    // Extract current price and historical data
    const currentPrice = stockData?.price;
    const beta = stockData?.beta;
    const priceData = stockData?.hist ? transformStockData(stockData.hist) : [];

    const stockOptions = React.useMemo(() => {
        if (!symbolsData) return [];

        return symbolsData.map(stock => ({
            value: stock.symbol,
            label: `${stock.symbol} - ${stock.security_name}`
        }));
    }, [symbolsData]);

    const handleStockChange = (value: string | null) => {
        setSelectedStock(value);
        setShouldFetchPrice(false); // Reset fetch flag when selection changes
        setAnalysisRun(false); // Reset analysis state when selection changes
    };

    const handleRunAnalysis = () => {
        if (selectedStock) {
            setShouldFetchPrice(true);
            setAnalysisRun(true);
            refetchPriceData();
        }
    };

    const filterDataByTimeRange = (data: StockPriceData[]) => {
        const today = new Date();
        const filterDate = (offset: number, unit: 'year' | 'month') => {
            const date = new Date();
            if (unit === 'year') date.setFullYear(today.getFullYear() - offset);
            if (unit === 'month') date.setMonth(today.getMonth() - offset);
            return date;
        };

        switch (timeRange) {
            case '5y':
                return data.filter(item => new Date(item.date) >= filterDate(5, 'year'));
            case '1y':
                return data.filter(item => new Date(item.date) >= filterDate(1, 'year'));
            case '6m':
                return data.filter(item => new Date(item.date) >= filterDate(6, 'month'));
            case '1m':
                return data.filter(item => new Date(item.date) >= filterDate(1, 'month'));
            default:
                return data;
        }
    };

    const filteredPriceData = priceData ? filterDataByTimeRange(priceData) : [];

    // Determine price change color
    const getPriceChangeColor = (value: number | undefined) => {
        if (value === undefined) return 'gray';
        return value >= 0 ? 'green' : 'red';
    };

    // Get risk assessment based on volatility and beta
    const getRiskAssessment = (): { level: string; color: string } => {
        const volatility = stockData?.historical_volatility || 0;
        const beta = stockData?.beta || 0;

        if (volatility > 40 || beta > 1.5) {
            return { level: 'High', color: 'red' };
        } else if (volatility > 20 || beta > 1.2) {
            return { level: 'Medium', color: 'yellow' };
        } else {
            return { level: 'Low', color: 'green' };
        }
    };

    // Get RSI assessment
    const getRsiAssessment = (): { status: string; color: string } => {
        const rsi = stockData?.rsi || 0;

        if (rsi > 70) {
            return { status: 'Overbought', color: 'red' };
        } else if (rsi < 30) {
            return { status: 'Oversold', color: 'green' };
        } else {
            return { status: 'Neutral', color: 'blue' };
        }
    };


    const isInPortfolio = (symbol: string | null): boolean => {
        if (!symbol) return false;
        return portfolioStocks.includes(symbol);
    };

    // Function to add stock to portfolio
    const addToPortfolio = () => {
        if (selectedStock && !isInPortfolio(selectedStock)) {
            setPortfolioStocks([...portfolioStocks, selectedStock]);
            setShowAddedNotification(true);

            // Hide notification after 3 seconds
            setTimeout(() => {
                setShowAddedNotification(false);
            }, 3000);

            // You could also save this to local storage or your backend
            localStorage.setItem('portfolioStocks', JSON.stringify([...portfolioStocks, selectedStock]));
        }
    };

    // Load portfolio from localStorage on component mount
    React.useEffect(() => {
        const savedPortfolio = localStorage.getItem('portfolioStocks');
        if (savedPortfolio) {
            try {
                setPortfolioStocks(JSON.parse(savedPortfolio));
            } catch (e) {
                console.error('Error loading portfolio from localStorage', e);
            }
        }
    }, []);


    const risk = getRiskAssessment();
    const rsiStatus = getRsiAssessment();

    if (symbolsLoading) return <Container><Text>Loading stock symbols...</Text></Container>;
    if (symbolsError) return <Container><Text color="red">Error loading stock symbols</Text></Container>;

    return (
        <Container size="lg">
            {/* Stock Selection Interface - Always Visible */}
            <Paper withBorder shadow="md" p="md" mt="md" mb="md" radius="md">
                <Select
                    label="Stock Symbols"
                    placeholder="Pick a stock"
                    data={stockOptions}
                    value={selectedStock}
                    onChange={handleStockChange}
                    filter={optionsFilter}
                    searchable
                />
                <Button
                    fullWidth
                    mt="md"
                    onClick={handleRunAnalysis}
                    disabled={!selectedStock}
                >
                    Run Analysis
                </Button>
            </Paper>

            {/* Stock Data Interface - Only Visible After Running Analysis */}
            {analysisRun && (
                <>
                    <Paper withBorder shadow="md" p="md" mt="md" radius="md" style={{ position: 'relative', minHeight: '100px' }}>
                        <LoadingOverlay visible={priceLoading} overlayBlur={2} />

                        {!priceLoading && !priceError && (
                            <>
                                <Flex justify="space-between" align="center">
                                    <Title order={3}>
                                        {selectedStock} Stock Price
                                    </Title>
                                    <Button
                                        variant={isInPortfolio(selectedStock) ? "light" : "filled"}
                                        color={isInPortfolio(selectedStock) ? "gray" : "blue"}
                                        onClick={addToPortfolio}
                                        disabled={!selectedStock || isInPortfolio(selectedStock)}
                                        leftIcon={<Star size={16} />}
                                        size="sm"
                                    >
                                        {isInPortfolio(selectedStock) ? "In Portfolio" : "Add to Portfolio"}
                                    </Button>
                                </Flex>

                                {currentPrice !== undefined && (
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <Title order={1}>
                                                $ {currentPrice.toFixed(2)}
                                            </Title>
                                            <Flex mt="xs" align="center" gap="md">
                                                {stockData?.ma_50 && stockData?.ma_200 && (
                                                    <>
                                                        <Badge
                                                            color={stockData.ma_50 > stockData.ma_200 ? 'green' : 'red'}
                                                            variant="light"
                                                            size="lg"
                                                        >
                                                            {stockData.ma_50 > stockData.ma_200 ? 'Golden Cross' : 'Death Cross'}
                                                        </Badge>

                                                        <Badge
                                                            color={risk.color}
                                                            variant="light"
                                                            size="lg"
                                                        >
                                                            {risk.level} Risk
                                                        </Badge>

                                                        <Badge
                                                            color={rsiStatus.color}
                                                            variant="light"
                                                            size="lg"
                                                        >
                                                            RSI: {rsiStatus.status}
                                                        </Badge>
                                                    </>
                                                )}




                                            </Flex>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Text size="sm" color="dimmed">52 Week Range</Text>
                                            <Flex gap="xs" align="center">
                                                <Text>{stockData?.fifty_two_week_low?.toFixed(2)}</Text>
                                                <div style={{
                                                    flex: 1,
                                                    height: '4px',
                                                    background: 'linear-gradient(to right, #e74c3c, #3498db)',
                                                    borderRadius: '2px',
                                                    position: 'relative'
                                                }}>
                                                    {stockData?.fifty_two_week_low !== undefined &&
                                                        stockData?.fifty_two_week_high !== undefined &&
                                                        currentPrice !== undefined && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                left: `${((currentPrice - stockData.fifty_two_week_low) /
                                                                    (stockData.fifty_two_week_high - stockData.fifty_two_week_low)) * 100}%`,
                                                                transform: 'translateX(-50%)',
                                                                top: '-10px',
                                                                width: '2px',
                                                                height: '24px',
                                                                background: '#2c3e50'
                                                            }} />
                                                        )}
                                                </div>
                                                <Text>{stockData?.fifty_two_week_high?.toFixed(2)}</Text>
                                            </Flex>
                                        </Grid.Col>
                                    </Grid>
                                )}
                            </>
                        )}
                    </Paper>

                    {/* Financial Metrics Panel */}
                    <Paper withBorder shadow="md" p="md" mt="md" radius="md" style={{ position: 'relative', minHeight: '150px' }}>
                        <LoadingOverlay visible={priceLoading} overlayBlur={2} />

                        {!priceLoading && !priceError && (
                            <>
                                <Title order={3} mb="md">Key Financial Metrics</Title>
                                <Grid>
                                    <Grid.Col span={4}>
                                        <Paper withBorder p="sm" radius="md">
                                            <Group position="apart">
                                                <Text size="xs" color="dimmed">Market Cap</Text>
                                                <ThemeIcon size="sm" variant="light" radius="xl" color="blue">
                                                    <Coin size={16} />
                                                </ThemeIcon>
                                            </Group>
                                            <Text size="lg" weight={700} mt="xs">
                                                {formatLargeNumber(stockData?.market_cap)}
                                            </Text>
                                        </Paper>
                                    </Grid.Col>

                                    <Grid.Col span={4}>
                                        <Paper withBorder p="sm" radius="md">
                                            <Group position="apart">
                                                <Text size="xs" color="dimmed">P/E Ratio</Text>
                                                <ThemeIcon size="sm" variant="light" radius="xl" color="violet">
                                                    <ChartBar size={16} />
                                                </ThemeIcon>
                                            </Group>
                                            <Text size="lg" weight={700} mt="xs">
                                                {stockData?.pe_ratio?.toFixed(2) || 'N/A'}
                                            </Text>
                                        </Paper>
                                    </Grid.Col>

                                    <Grid.Col span={4}>
                                        <Paper withBorder p="sm" radius="md">
                                            <Group position="apart">
                                                <Text size="xs" color="dimmed">Dividend Yield</Text>
                                                <ThemeIcon
                                                    size="sm"
                                                    variant="light"
                                                    radius="xl"
                                                    color={stockData?.dividend_yield ? 'green' : 'gray'}
                                                >
                                                    {stockData?.dividend_yield ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                                </ThemeIcon>
                                            </Group>
                                            <Text size="lg" weight={700} mt="xs">
                                                {stockData?.dividend_yield ? `${stockData.dividend_yield.toFixed(2)}%` : 'None'}
                                            </Text>
                                        </Paper>
                                    </Grid.Col>

                                    <Grid.Col span={4}>
                                        <Paper withBorder p="sm" radius="md">
                                            <Group position="apart">
                                                <Text size="xs" color="dimmed">Beta</Text>
                                                <ThemeIcon size="sm" variant="light" radius="xl" color="indigo">
                                                    <TrendingUp size={16} />
                                                </ThemeIcon>
                                            </Group>
                                            <Text
                                                size="lg"
                                                weight={700}
                                                mt="xs"
                                                color={stockData?.beta && stockData.beta > 1 ? 'red' : 'green'}
                                            >
                                                {stockData?.beta?.toFixed(2) || 'N/A'}
                                            </Text>
                                        </Paper>
                                    </Grid.Col>

                                    <Grid.Col span={4}>
                                        <Paper withBorder p="sm" radius="md">
                                            <Group position="apart">
                                                <Text size="xs" color="dimmed">Historical Volatility</Text>
                                                <ThemeIcon size="sm" variant="light" radius="xl" color="orange">
                                                    <Activity size={16} />
                                                </ThemeIcon>
                                            </Group>
                                            <Text
                                                size="lg"
                                                weight={700}
                                                mt="xs"
                                                color={stockData?.historical_volatility && stockData.historical_volatility > 30 ? 'red' : 'blue'}
                                            >
                                                {stockData?.historical_volatility ? `${stockData.historical_volatility.toFixed(2)}%` : 'N/A'}
                                            </Text>
                                        </Paper>
                                    </Grid.Col>

                                    <Grid.Col span={4}>
                                        <Paper withBorder p="sm" radius="md">
                                            <Group position="apart">
                                                <Text size="xs" color="dimmed">RSI (14)</Text>
                                                <ThemeIcon
                                                    size="sm"
                                                    variant="light"
                                                    radius="xl"
                                                    color={rsiStatus.color}
                                                >
                                                    <Activity size={16} />
                                                </ThemeIcon>
                                            </Group>
                                            <Text
                                                size="lg"
                                                weight={700}
                                                mt="xs"
                                                color={rsiStatus.color}
                                            >
                                                {stockData?.rsi ? stockData.rsi.toFixed(2) : 'N/A'}
                                            </Text>
                                        </Paper>
                                    </Grid.Col>
                                </Grid>

                                {/* Options Data Summary */}
                                {stockData?.options_data && (
                                    <div mt="md">
                                        <Divider my="md" label="Options Overview" labelPosition="center" />
                                        <Group grow>
                                            <Paper withBorder p="sm" radius="md">
                                                <Text size="xs" color="dimmed">Put/Call Ratio</Text>
                                                <Text size="lg" weight={700} mt="xs">
                                                    {stockData.options_data.put_call_ratio.toFixed(2)}
                                                </Text>
                                                <Text size="xs" color="dimmed" mt="xs">
                                                    {stockData.options_data.put_call_ratio > 1
                                                        ? 'Bearish sentiment (more puts than calls)'
                                                        : 'Bullish sentiment (more calls than puts)'}
                                                </Text>
                                            </Paper>

                                            <Paper withBorder p="sm" radius="md">
                                                <Text size="xs" color="dimmed">Next Expiration</Text>
                                                <Text size="lg" weight={700} mt="xs">
                                                    {stockData.options_data.nearest_expiry}
                                                </Text>
                                                <Text size="xs" color="dimmed" mt="xs">
                                                    {stockData.options_data.expiry_dates.length} expiration dates available
                                                </Text>
                                            </Paper>
                                        </Group>
                                    </div>
                                )}
                            </>
                        )}
                    </Paper>

                    {/* Charts Panel */}
                    <Paper withBorder shadow="md" p="md" mt="md" radius="md" style={{ position: 'relative', minHeight: '350px' }}>
                        <LoadingOverlay visible={priceLoading} overlayBlur={2} />

                        {priceError && (
                            <Text color="red" align="center">Error loading price data</Text>
                        )}

                        {!priceLoading && !priceError && (
                            <>
                                <Title order={3}>
                                    Historical Prices
                                </Title>
                                <Group position="apart" mb="md">
                                    <Group>
                                        <Button size="xs" variant={timeRange === '5y' ? 'filled' : 'outline'} onClick={() => setTimeRange('5y')}>5Y</Button>
                                        <Button size="xs" variant={timeRange === '1y' ? 'filled' : 'outline'} onClick={() => setTimeRange('1y')}>1Y</Button>
                                        <Button size="xs" variant={timeRange === '6m' ? 'filled' : 'outline'} onClick={() => setTimeRange('6m')}>6M</Button>
                                        <Button size="xs" variant={timeRange === '1m' ? 'filled' : 'outline'} onClick={() => setTimeRange('1m')}>1M</Button>
                                    </Group>
                                </Group>

                                {filteredPriceData.length > 0 ? (
                                    <div>
                                        <div style={{ width: '100%', height: 400 }}>
                                            <ResponsiveContainer>
                                                <AreaChart
                                                    data={filteredPriceData}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottomRight', offset: 0 }} />
                                                    <YAxis label={{ value: 'Close Price', angle: -90, position: 'insideLeft' }} />
                                                    <RechartsTooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Close Price']} />
                                                    <Legend />
                                                    <Area type="monotone" dataKey="close" stroke="#1c7ed6" fill="#1c7ed6" name="Close Price" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <Title order={3} mt="xl">
                                            Return Performance
                                        </Title>
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer>
                                                <LineChart
                                                    data={filteredPriceData}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis label={{ value: 'Cumulative Return (%)', angle: -90, position: 'insideLeft' }} />
                                                    <RechartsTooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Return']} />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="cumulativeReturn"
                                                        stroke="#2ecc71"
                                                        name="Cumulative Return"
                                                        dot={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <Title order={3} mt="xl">
                                            Trading Volume
                                        </Title>
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer>
                                                <AreaChart
                                                    data={filteredPriceData}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottomRight', offset: 0 }} />
                                                    <YAxis label={{ value: 'Volume', angle: -90, position: 'insideLeft' }} />
                                                    <RechartsTooltip formatter={(value) => [`${value.toLocaleString()}`, 'Volume']} />
                                                    <Legend />
                                                    <Area type="monotone" dataKey="volume" stroke="#8884d8" fill="#8884d8" name="Volume" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ) : (
                                    <Text align="center" color="dimmed">
                                        No data available for the selected time range
                                    </Text>
                                )}
                            </>
                        )}
                    </Paper>
                </>
            )}
        </Container>
    );
};

export default Stock;