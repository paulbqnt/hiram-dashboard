import React, { useState } from 'react';
import {
  Container,
  Paper,
  Button,
  Select,
  NumberInput,
  Group,
  Text,
  Divider,
  Grid,
  Stack,
  Tabs,
  Title,
  Switch,
  LoadingOverlay,
  Box,
  Alert
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useMutation } from '@tanstack/react-query';
import axios from "axios";

// Define interface for form values
interface PricerFormValues {
  spot: number;
  strike: number;
  riskFreeRate: number;
  volatility: number;
  optionFamily: string;
  payoffType: string;
  pricingEngine: string;
  modelType: string;
  optionType: string;
  dividendYield: number;
  maturity: number;
  stockSymbol: string | null;
}

// Interface for option pricing result
interface PricingResult {
  price: number;
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
  };
  payoffData: Array<{ spot: number; payoff: number }>;
  greeks: {
    delta: Array<{ x: number; value: number }>;
    gamma: Array<{ x: number; value: number }>;
    theta: Array<{ x: number; value: number }>;
    vega: Array<{ x: number; value: number }>;
  };
}




const Pricer: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PricingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('price');
  // const [addedToPortfolio, setAddedToPortfolio] = useState<boolean>(false);

  // Sample stock data for the dropdown
  const stockOptions = [
    { value: 'AAPL', label: 'Apple Inc. (AAPL)' },
    { value: 'MSFT', label: 'Microsoft Corporation (MSFT)' },
    { value: 'AMZN', label: 'Amazon.com Inc. (AMZN)' },
    { value: 'GOOGL', label: 'Alphabet Inc. (GOOGL)' },
    { value: 'TSLA', label: 'Tesla Inc. (TSLA)' },
    { value: 'META', label: 'Meta Platforms Inc. (META)' },
    { value: 'NVDA', label: 'NVIDIA Corporation (NVDA)' },
    { value: 'JPM', label: 'JPMorgan Chase & Co. (JPM)' },
    { value: 'V', label: 'Visa Inc. (V)' },
    { value: 'JNJ', label: 'Johnson & Johnson (JNJ)' }
  ];

  const priceOption = async (values: PricerFormValues): Promise<PricingResult> => {
    const response = await axios.post<PricingResult>('http://localhost:8000/api/v1/pricer/options/price', values);
    return response.data;
  };

  // React Query mutation hook
  const { mutate: submitPricing, isLoading } = useMutation({
    mutationFn: priceOption,
    onSuccess: (data) => {
      setResult(data);
    },
    onError: () => {
      setError('Error pricing option. Please try again.');
    },
  });

  // Form submit handler
  const handleSubmit = (values: PricerFormValues) => {
    setError(null);
    submitPricing(values); // ✅ This must be in the same scope
  };





  // Initialize form with defaults
  const form = useForm<PricerFormValues>({
    initialValues: {
      spot: 100,
      strike: 100,
      riskFreeRate: 0.05,
      volatility: 0.2,
      optionFamily: 'european',
      payoffType: 'vanilla',
      pricingEngine: 'analytical',
      modelType: 'black_scholes',
      optionType: 'CALL',
      dividendYield: 0,
      maturity: 1,
      stockSymbol: null
    },
    validate: {
      spot: (value) => (value <= 0 ? 'Spot price must be positive' : null),
      strike: (value) => (value <= 0 ? 'Strike price must be positive' : null),
      volatility: (value) => (value < 0 ? 'Volatility cannot be negative' : null),
      maturity: (value) => (value <= 0 ? 'Maturity must be positive' : null),
    },
  });



  // Handle stock selection
  const handleStockSelect = (stockSymbol: string | null) => {
    // In a real app, you would fetch stock data and update the form values
    if (stockSymbol) {
      // Mock data for demonstration
      const stockData: Record<string, { price: number, volatility: number, dividendYield: number }> = {
        'AAPL': { price: 175.23, volatility: 0.22, dividendYield: 0.0053 },
        'MSFT': { price: 327.89, volatility: 0.20, dividendYield: 0.0082 },
        'AMZN': { price: 142.56, volatility: 0.25, dividendYield: 0 },
        'GOOGL': { price: 132.45, volatility: 0.18, dividendYield: 0 },
        'TSLA': { price: 245.67, volatility: 0.35, dividendYield: 0 },
        'META': { price: 320.54, volatility: 0.28, dividendYield: 0 },
        'NVDA': { price: 450.32, volatility: 0.32, dividendYield: 0.0037 },
        'JPM': { price: 142.56, volatility: 0.15, dividendYield: 0.0245 },
        'V': { price: 230.45, volatility: 0.16, dividendYield: 0.0075 },
        'JNJ': { price: 155.67, volatility: 0.12, dividendYield: 0.0280 }
      };

      const selectedStock = stockData[stockSymbol];

      if (selectedStock) {
        form.setValues({
          ...form.values,
          spot: selectedStock.price,
          volatility: selectedStock.volatility,
          dividendYield: selectedStock.dividendYield,
          stockSymbol
        });
      }
    }
  };

  return (
      <Container size="lg">
        <Title order={2} mb="md">Options Pricer</Title>

        {/* Input Form */}
        <Paper withBorder shadow="md" p="md" mb="xl" radius="md" pos="relative">
          <LoadingOverlay visible={loading} overlayBlur={2} />

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid gutter="lg">
              {/* Stock Selection */}
              <Grid.Col span={12}>
                <Text weight={500} size="lg" mb="xs">Stock Selection (Optional)</Text>
                <Divider mb="sm" />
              </Grid.Col>

              <Grid.Col span={12}>
                <Select
                    label="Select Stock"
                    placeholder="Choose a stock (optional)"
                    data={stockOptions}
                    clearable
                    searchable
                    nothingFound="No stocks found"
                    value={form.values.stockSymbol}
                    onChange={(value) => handleStockSelect(value)}
                    mb="md"
                />
                {form.values.stockSymbol && (
                    <Alert color="blue" radius="md" mb="md">
                      <Text>Selected stock data has been loaded. You can still adjust values manually.</Text>
                    </Alert>
                )}
              </Grid.Col>

              {/* Market Data */}
              <Grid.Col span={12}>
                <Text weight={500} size="lg" mb="xs">Market Data</Text>
                <Divider mb="sm" />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <NumberInput
                    label="Spot Price"
                    placeholder="Enter spot price"
                    precision={2}
                    min={0.01}
                    step={1}
                    required
                    {...form.getInputProps('spot')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <NumberInput
                    label="Risk-Free Rate"
                    placeholder="Enter risk-free rate"
                    precision={4}
                    step={0.001}
                    min={0}
                    max={1}
                    required
                    {...form.getInputProps('riskFreeRate')}
                    rightSection={<Text size="sm">%</Text>}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <NumberInput
                    label="Dividend Yield"
                    placeholder="Enter dividend yield"
                    precision={4}
                    step={0.001}
                    min={0}
                    max={1}
                    {...form.getInputProps('dividendYield')}
                    rightSection={<Text size="sm">%</Text>}
                />
              </Grid.Col>

              {/* Option Parameters */}
              <Grid.Col span={12} mt="md">
                <Text weight={500} size="lg" mb="xs">Option Parameters</Text>
                <Divider mb="sm" />
              </Grid.Col>

              <Grid.Col span={2}>
                <NumberInput
                    label="Strike Price"
                    placeholder="Enter strike price"
                    precision={2}
                    min={0.01}
                    step={1}
                    required
                    {...form.getInputProps('strike')}
                />
              </Grid.Col>

              <Grid.Col span={2}>
                <NumberInput
                    label="Strike Price %"
                    placeholder="Enter strike price"
                    precision={2}
                    min={0.01}
                    step={1}
                    required
                    {...form.getInputProps('strike')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <NumberInput
                    label="Volatility"
                    placeholder="Enter volatility"
                    precision={4}
                    step={0.01}
                    min={0.01}
                    max={5}
                    required
                    {...form.getInputProps('volatility')}
                    rightSection={<Text size="sm">%</Text>}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <NumberInput
                    label="Maturity (Years)"
                    placeholder="Enter maturity in years"
                    precision={3}
                    step={0.1}
                    min={0.01}
                    required
                    {...form.getInputProps('maturity')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Select
                    label="Option Family"
                    placeholder="Select option Family"
                    data={[
                      { value: 'EUROPEAN', label: 'EUROPEAN' },
                      // { value: 'american', label: 'American' },
                      // { value: 'bermudan', label: 'Bermudan' },
                      // { value: 'asian', label: 'Asian' }
                    ]}
                    required
                    {...form.getInputProps('optionFamily')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Select
                    label="Payoff Type"
                    placeholder="Select payoff type"
                    data={[
                      { value: 'vanilla', label: 'Vanilla' },
                      { value: 'digital', label: 'Digital' },
                      // { value: 'barrier', label: 'Barrier' },
                      // { value: 'lookback', label: 'Lookback' }
                    ]}
                    required
                    {...form.getInputProps('payoffType')}
                />
              </Grid.Col>

              {/*TODO: change the type to dynamically adapt to Payoff*/}
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Select
                    label="Type"
                    placeholder="Select option type"
                    data={[
                      { value: 'CALL', label: 'Call' },
                      { value: 'PUT', label: 'Put' }
                    ]}
                    required
                    {...form.getInputProps('optionType')}
                />
              </Grid.Col>

              {/* Pricing Settings */}
              <Grid.Col span={12} mt="md">
                <Text weight={500} size="lg" mb="xs">Pricing Settings</Text>
                <Divider mb="sm" />
              </Grid.Col>

              <Grid.Col span={{ base: 12 }}>
                <Select
                    label="Pricing Model"
                    placeholder="Select pricing model"
                    data={[
                      { value: 'Black Scholes', label: 'Black Scholes' },
                      { value: 'binomial', label: 'Binomial Tree' },
                      { value: 'monte_carlo', label: 'Monte Carlo' },
                      // { value: 'heston', label: 'Heston' }
                    ]}
                    required
                    {...form.getInputProps('modelType')}
                />
              </Grid.Col>

              {/*<Grid.Col span={{ base: 12, sm: 6 }}>*/}
              {/*  <Select*/}
              {/*      label="Pricing Engine"*/}
              {/*      placeholder="Select pricing engine"*/}
              {/*      data={[*/}
              {/*        { value: 'analytical', label: 'Analytical' },*/}
              {/*        { value: 'finite_difference', label: 'Finite Difference' },*/}
              {/*        { value: 'numerical', label: 'Numerical Integration' }*/}
              {/*      ]}*/}
              {/*      required*/}
              {/*      {...form.getInputProps('pricingEngine')}*/}
              {/*  />*/}
              {/*</Grid.Col>*/}

              <Grid.Col span={12} mt="md">
                <Button type="submit" size="md" fullWidth>
                  Price Option
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Paper>

        {/* Results Section */}
        {result && (
            <Paper withBorder shadow="md" p="md" mt="md" radius="md">
              <Group position="apart" mb="md">
                <Title order={3}>Pricing Results {form.values.stockSymbol && `for ${form.values.stockSymbol}`}</Title>
                {/*<Button*/}
                {/*    leftIcon={<IconPlus size={16} />}*/}
                {/*    color={addedToPortfolio ? "green" : "blue"}*/}
                {/*    onClick={handleAddToPortfolio}*/}
                {/*    disabled={addedToPortfolio}*/}
                {/*>*/}
                {/*  {addedToPortfolio ? "Added to Portfolio" : "Add to Portfolio"}*/}
                {/*</Button>*/}
              </Group>

              {error && (
                  <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
                    {error}
                  </Alert>
              )}

              <Grid mb="md">
                <Grid.Col span={12} md={6}>
                  <Paper withBorder p="md">
                    <Text size="lg" weight={500} mb="md">Option Price</Text>
                    <Title order={2}>${result.value.toFixed(2)}</Title>
                    <Text size="sm" color="dimmed">
                      {form.values.optionType.toUpperCase()} option with strike ${form.values.strike}
                      {form.values.stockSymbol && ` on ${form.values.stockSymbol}`}
                    </Text>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={12} md={6}>
                  <Paper withBorder p="md">
                    <Text size="lg" weight={500} mb="xs">Greeks</Text>
                    <Grid>
                      <Grid.Col span={4}>
                        <Text size="sm" color="dimmed">Delta</Text>
                        <Text weight={500}>{result.greeks.delta.toFixed(4)}</Text>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Text size="sm" color="dimmed">Gamma</Text>
                        <Text weight={500}>{result.greeks.gamma.toFixed(4)}</Text>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Text size="sm" color="dimmed">Theta</Text>
                        <Text weight={500}>{result.greeks.theta.toFixed(4)}</Text>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Text size="sm" color="dimmed">Vega</Text>
                        <Text weight={500}>{result.greeks.vega.toFixed(4)}</Text>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Text size="sm" color="dimmed">Rho</Text>
                        <Text weight={500}>{result.greeks.rho.toFixed(4)}</Text>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                </Grid.Col>
              </Grid>

              <Tabs value={activeTab} onTabChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="payoff">Payoff Profile</Tabs.Tab>
                  <Tabs.Tab value="delta">Delta</Tabs.Tab>
                  <Tabs.Tab value="gamma">Gamma</Tabs.Tab>
                  <Tabs.Tab value="theta">Theta</Tabs.Tab>
                  <Tabs.Tab value="vega">Vega</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="payoff" pt="md">
                  <Text size="sm" mb="md">
                    Payoff profile at expiration for {form.values.optionType} option with strike ${form.values.strike}
                    {form.values.stockSymbol && ` on ${form.values.stockSymbol}`}
                  </Text>
                  <Box h={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.payoffData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="spot"
                            name="Spot Price"
                            label={{ value: 'Spot Price', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            name="Payoff"
                            label={{ value: 'Payoff', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Payoff']} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="payoff"
                            name="Payoff"
                            stroke={form.values.optionType === 'CALL' ? '#8884d8' : '#82ca9d'}
                            fill={form.values.optionType === 'CALL' ? '#8884d8' : '#82ca9d'}
                            fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="delta" pt="md">
                  <Text size="sm" mb="md">Delta measures the rate of change of the option value with respect to changes in the underlying price</Text>
                  <Box h={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.greeks.delta}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="x"
                            name="Spot Price"
                            label={{ value: 'Spot Price', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            name="Delta"
                            label={{ value: 'Delta', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip formatter={(value) => [Number(value).toFixed(4), 'Delta']} labelFormatter={(label) => `Spot: $${Number(label).toFixed(2)}`} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Delta" stroke="#8884d8" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="gamma" pt="md">
                  <Text size="sm" mb="md">Gamma measures the rate of change in delta with respect to changes in the underlying price</Text>
                  <Box h={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.greeks.gamma}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="x"
                            name="Spot Price"
                            label={{ value: 'Spot Price', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            name="Gamma"
                            label={{ value: 'Gamma', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip formatter={(value) => [Number(value).toFixed(4), 'Gamma']} labelFormatter={(label) => `Spot: $${Number(label).toFixed(2)}`} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Gamma" stroke="#82ca9d" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="theta" pt="md">
                  <Text size="sm" mb="md">Theta measures the rate of change of the option value with respect to time</Text>
                  <Box h={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.greeks.theta}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="x"
                            name="Spot Price"
                            label={{ value: 'Spot Price', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            name="Theta"
                            label={{ value: 'Theta', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip formatter={(value) => [Number(value).toFixed(4), 'Theta']} labelFormatter={(label) => `Spot: $${Number(label).toFixed(2)}`} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Theta" stroke="#ff7300" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="vega" pt="md">
                  <Text size="sm" mb="md">Vega measures sensitivity to volatility</Text>
                  <Box h={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.greeks.vega}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="x"
                            name="Spot Price"
                            label={{ value: 'Spot Price', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            name="Vega"
                            label={{ value: 'Vega', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip formatter={(value) => [Number(value).toFixed(4), 'Vega']} labelFormatter={(label) => `Spot: $${Number(label).toFixed(2)}`} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Vega" stroke="#0088FE" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Tabs.Panel>
              </Tabs>
            </Paper>
        )}
      </Container>
  );
};

export default Pricer;