import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import {
    Button,
    ComboboxItem,
    Container,
    OptionsFilter,
    Paper,
    Select,
} from "@mantine/core";

const optionsFilter: OptionsFilter = ({ options, search }) => {
    const splittedSearch = search.toLowerCase().trim().split(' ');
    return (options as ComboboxItem[]).filter((option) => {
        const words = option.label.toLowerCase().trim().split(' ');
        return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
    });
};

// Function to fetch stock data from the server
const fetchStockData = async () => {
    const { data } = await axios.get('http://localhost:8000/api/stocks/data/symbols');
    return data;
};

const Stock: React.FC = () => {
    // Use TanStack Query to fetch data
    const { data, error, isLoading } = useQuery({
        queryKey: ['stockData'],
        queryFn: fetchStockData,
    });

    const stockOptions = React.useMemo(() => {
        if (!data) return [];

        return data.map(stock => ({
            value: stock.symbol, // Use the stock symbol as the value
            label: `${stock.symbol} - ${stock.security_name}` // Combine symbol and name for the label
        }));

    }, [data]);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    return (
        <div>
            <Container>
                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    <Select
                        label="Stock Symbols"
                        placeholder="Pick a stock"
                        data={stockOptions} // Use the transformed data
                        filter={optionsFilter}
                        searchable

                    />
                    <Button fullWidth mt="xl">
                        Run
                    </Button>
                </Paper>
            </Container>
        </div>
    );
};

export default Stock;