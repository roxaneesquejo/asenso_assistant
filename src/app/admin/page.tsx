
'use client';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BarChart, LineChart, Shield, Home } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const analyticsData = {
  loansOverTime: [
    { date: 'Jan', count: 65 },
    { date: 'Feb', count: 59 },
    { date: 'Mar', count: 80 },
    { date: 'Apr', count: 81 },
    { date: 'May', count: 56 },
    { date: 'Jun', count: 55 },
  ],
  approvalRates: [
    { name: 'Approved', value: 400, fill: 'var(--color-approved)' },
    { name: 'Rejected', value: 300, fill: 'var(--color-rejected)' },
    { name: 'Pending', value: 100, fill: 'var(--color-pending)' },
  ],
};

const chartConfig = {
    count: { label: 'Loans', color: 'hsl(var(--primary))' },
    value: { label: 'Count' },
    approved: { label: 'Approved', color: 'hsl(var(--chart-2))' },
    rejected: { label: 'Rejected', color: 'hsl(var(--destructive))' },
    pending: { label: 'Pending', color: 'hsl(var(--chart-5))' },
};

export default function AdminPage() {
    return (
        <div className="flex flex-col min-h-screen w-full bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <AppLogo />
                    </div>
                     <Link href="/" passHref>
                        <Button variant="ghost">
                            <Home className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <h1 className="font-headline text-3xl font-bold tracking-tight text-maroon md:text-4xl">
                            Administrator Dashboard
                        </h1>
                        <p className="mt-4 text-lg text-gold max-w-3xl mx-auto">
                            System Analytics & Policy Management
                        </p>
                    </div>

                    <div className="grid gap-8">
                        {/* Analytics Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart className="h-6 w-6" />
                                    Loan Analytics
                                </CardTitle>
                                <CardDescription>Overview of loan application trends.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-8 md:grid-cols-2">
                                <div>
                                    <h3 className="font-semibold mb-4">Loan Applications Over Time</h3>
                                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RechartsLineChart data={analyticsData.loansOverTime}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip content={<ChartTooltipContent />} />
                                                <Line type="monotone" dataKey="count" stroke="var(--color-count)" />
                                            </RechartsLineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                                 <div>
                                    <h3 className="font-semibold mb-4">Approval Rate</h3>
                                     <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RechartsBarChart data={analyticsData.approvalRates}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent indicator="dot" />} />
                                                <Bar dataKey="value" radius={4} />
                                            </RechartsBarChart>
                                        </ResponsiveContainer>
                                     </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Loan Policies Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-6 w-6" />
                                    Loan Policies
                                </CardTitle>
                                <CardDescription>Define and update the rules for loan evaluation.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid w-full gap-1.5">
                                        <Label htmlFor="policies">Bank Rules</Label>
                                        <Textarea
                                            placeholder="Enter bank rules here, one per line."
                                            id="policies"
                                            name="policies"
                                            rows={8}
                                            defaultValue={`- Minimum credit score: 600\n- Maximum Debt-to-Income ratio: 45%\n- Applicant must have a stable income source.\n- No bankruptcies in the last 7 years.\n- Loan amount cannot exceed 30% of annual income.`}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save Policies</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
            <footer className="border-t py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} SENSO. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
