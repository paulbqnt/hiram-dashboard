import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const HomePage = () => {
    const [pricingEngine, setPricingEngine] = useState("");
    const [simulations, setSimulations] = useState(1000);
    return (
        <div>
            <div>Pricer</div>
            <Separator className="my-4" />
            <Input type="string" placeholder="Spot" />
            <br/>
            <Input type="string" placeholder="Strike" />
            <br/>
            <Input type="string" placeholder="Rate" />
            <br/>
            <Input type="string" placeholder="Volatility" />
            <br/>
            <Input type="string" placeholder="Dividend" />
            <br/>
            <Input type="string" placeholder="Expiry (in years)" />

            <Separator className="my-4" />


            <Select>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a Payoff" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Payoffs</SelectLabel>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="put">Put</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <br/>
            <Select
                value={pricingEngine}
                onValueChange={(value) => setPricingEngine(value)}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Set the Pricing Engine" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Pricing Engines</SelectLabel>
                        <SelectItem value="blackScholes">Black Scholes</SelectItem>
                        <SelectItem value="monteCarlo">Monte Carlo</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            {pricingEngine === "monteCarlo" && (
                <Input
                    type="number"
                    placeholder="Number of Simulations"
                    value={simulations}
                    onChange={(e) => setSimulations(Number(e.target.value))}
                />
            )}
            <Separator className="my-4" />

            <Button variant="secondary">Run</Button>


        </div>
    );
};

export default HomePage;
