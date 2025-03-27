// import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

const formSchema = z.object({
    spot: z.string().min(1),
    strike: z.string().min(1),
    rate: z.string().min(1),
    volatility: z.string().min(1),
    dividendYield: z.string().min(1),
    payoff: z.string(),
    maturityDate: z.unknown(),
    numberOfMonths: z.unknown()
});




const HomePage = () => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            "name_1125374416": new Date(),
            "name_8830184885": new Date()
        },
    });

    // const [pricingEngine, setPricingEngine] = useState("");
    // const [simulations, setSimulations] = useState(1000);

    function onSubmit(values) {
        try {
            console.log(values);
            toast(
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(values, null, 2)}</code>
                </pre>
            );

            const optionPricingRequest = {
                underlyingPrice: parseFloat(values.spot),
                volatility: parseFloat(values.volatility),
                riskFreeRate: parseFloat(values.rate),
                dividendYield: parseFloat(values.dividendYield),
                strikePrice: parseFloat(values.strike),
                maturity: 1, //parseFloat(values.maturityDate), // Convert to float if necessary
                optionType: "EUROPEAN",
                modelType: "Black Scholes",
                isCall: true,

                // modelType: values.modelType
            };

            fetch("http://localhost:8000/api/pricer/options/price", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(optionPricingRequest)
            })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));

        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    }

    return (
        <div>
            <div>Pricer</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">

                    <div className="grid grid-cols-12 gap-4">

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="spot"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Spot</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Add spot value"

                                                type=""
                                                {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="strike"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Strike</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Add strike value"

                                                type=""
                                                {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>

                    <div className="grid grid-cols-12 gap-4">

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="rate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rate</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Add Rate"

                                                type=""
                                                {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="volatility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Volatility</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Add volatility"

                                                type=""
                                                {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>

                    <div className="grid grid-cols-12 gap-4">

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="dividendYield"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dividend Yield</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Add Dividend Yield"

                                                type=""
                                                {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="payoff"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payoff</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Payoff" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="call-vanilla">Call Vanilla</SelectItem>
                                                <SelectItem value="put-vanilla">Put Vanilla</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>

                    <div className="grid grid-cols-12 gap-4">

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="maturityDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Maturity Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="numberOfMonths"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of months</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Number of months"

                                                type=""
                                                {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>
                    <Button type="submit" variant="outline">Price</Button>
                </form>
            </Form>
        </div>
    );
};

export default HomePage;
