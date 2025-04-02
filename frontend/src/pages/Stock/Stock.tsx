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
    Group
} from "@mantine/core";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StockSymbol {
    symbol: string;
    security_name: string;
}

interface StockPriceData {
    date: string;
    close: number;
    cumulativeReturn: number;
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
    const { data } = await axios.get('http://localhost:8000/api/stocks/data/symbols');
    return data as StockSymbol[];
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
    const { data } = await axios.get(`http://localhost:8000/api/stocks/${symbol}/data`);
    return transformStockData(data.hist); // Transform the data
};

const Stock: React.FC = () => {
    const [selectedStock, setSelectedStock] = useState<string | null>(null);
    const [shouldFetchPrice, setShouldFetchPrice] = useState(false);
    const [timeRange, setTimeRange] = useState<'5y' | '1y' | '6m' | '1m'>('1y');

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
        data: priceData,
        error: priceError,
        isLoading: priceLoading,
        refetch: refetchPriceData
    } = useQuery({
        queryKey: ['stockPrice', selectedStock],
        queryFn: () => fetchStockPriceData(selectedStock || ''),
        enabled: shouldFetchPrice && !!selectedStock,
        onSuccess: (data) => {
            // Log the first item to see the structure
            if (data && data.length > 0) {
                console.log("First data point:", data[0]);
            }
            setShouldFetchPrice(false); // Reset after successful fetch
        }
    });

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
    };

    const handleRunAnalysis = () => {
        if (selectedStock) {
            setShouldFetchPrice(true);
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


    if (symbolsLoading) return <Container><Text>Loading stock symbols...</Text></Container>;
    if (symbolsError) return <Container><Text color="red">Error loading stock symbols</Text></Container>;

    return (
        <Container size="lg">
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

            <Paper withBorder shadow="md" p="md" mt="md" radius="md" style={{ position: 'relative', minHeight: '350px' }}>
                <LoadingOverlay visible={priceLoading} overlayBlur={2} />

                {priceError && (
                    <Text color="red" align="center">Error loading price data</Text>
                )}

                {!priceLoading && !priceError && (
                    <>
                        <Group position="apart" mb="md">
                            <Title order={3}>
                                {selectedStock ? `${selectedStock} Stock Price` : 'Select a stock to view price data'}
                            </Title>
                            <Group>
                                <Button size="xs" variant={timeRange === '5y' ? 'filled' : 'outline'} onClick={() => setTimeRange('5y')}>5Y</Button>
                                <Button size="xs" variant={timeRange === '1y' ? 'filled' : 'outline'} onClick={() => setTimeRange('1y')}>1Y</Button>
                                <Button size="xs" variant={timeRange === '6m' ? 'filled' : 'outline'} onClick={() => setTimeRange('6m')}>6M</Button>
                                <Button size="xs" variant={timeRange === '1m' ? 'filled' : 'outline'} onClick={() => setTimeRange('1m')}>1M</Button>
                            </Group>
                        </Group>

                        {
                            selectedStock && filteredPriceData.length > 0 && (

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
                                                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Close Price']} />
                                                <Legend />
                                                <Area type="monotone" dataKey="close" stroke="#1c7ed6" fill="#1c7ed6" name="Close Price" />
                                            </AreaChart>
                                        </ResponsiveContainer>


                                    </div>

                                    <Title order={3}>
                                        {selectedStock ? `${selectedStock} Cumulative Return` : 'Select a stock to view price data'}
                                    </Title>
                                    <div style={{ width: '100%', height: 400 }}>
                                        <ResponsiveContainer>
                                            <AreaChart
                                                data={filteredPriceData}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottomRight', offset: 0 }} />
                                                <YAxis label={{ value: 'Volume', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'cumulativeReturn']} />
                                                <Legend />
                                                <Area type="monotone" dataKey="cumulativeReturn" stroke="#1c7ed6" fill="#1c7ed6" name="Cumulative Return" />
                                            </AreaChart>
                                        </ResponsiveContainer>


                                    </div>

                                    <Title order={3}>
                                        {selectedStock ? `${selectedStock} Volume` : 'Select a stock to view price data'}
                                    </Title>
                                    <div style={{ width: '100%', height: 400 }}>
                                        <ResponsiveContainer>
                                            <AreaChart
                                                data={filteredPriceData}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottomRight', offset: 0 }} />
                                                <YAxis label={{ value: 'Volume', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Volume']} />
                                                <Legend />
                                                <Area type="monotone" dataKey="volume" stroke="#1c7ed6" fill="#1c7ed6" name="Volume" />
                                            </AreaChart>
                                        </ResponsiveContainer>


                                    </div>
                                </div>




                            )}

                        {(!selectedStock || !filteredPriceData.length) && !shouldFetchPrice && (
                            <Text align="center" color="dimmed">
                                Select a stock and click "Run Analysis" to view price data
                            </Text>
                        )}
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default Stock;
