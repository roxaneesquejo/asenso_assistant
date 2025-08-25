
'use client';

import { useState, useEffect } from 'react';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Home } from 'lucide-react';
import { EvaluationResults } from '@/components/evaluation-results';
import { type EvaluateLoanApplicationOutput } from '@/ai/schemas';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getCreditAdvice } from '../actions';

export default function ClientPage() {
    const [referenceNumber, setReferenceNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<EvaluateLoanApplicationOutput | null>(null);
    const [advice, setAdvice] = useState<string | undefined>(undefined);
    const { toast } = useToast();

    useEffect(() => {
        setResult(null);
        setAdvice(undefined);
    }, [referenceNumber]);

    const handleSearch = async () => {
        if (!referenceNumber) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please enter a reference number.',
            });
            return;
        }
        setIsLoading(true);
        setResult(null);
        setAdvice(undefined);

        try {
            const docRef = doc(db, "loanApplications", referenceNumber);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // The data from Firestore includes a 'lastEvaluatedAt' timestamp, which is not a plain object.
                // We need to create a plain object to pass to the server action.
                const rawData = docSnap.data();
                const { lastEvaluatedAt, ...plainResult } = rawData;
                
                const evaluationResult = plainResult as EvaluateLoanApplicationOutput;
                setResult(evaluationResult);

                if (!evaluationResult.isEligible) {
                    setAdvice(''); // Set to empty string to indicate loading
                    // Pass only the required, serializable properties to the server action.
                    const generatedAdvice = await getCreditAdvice({
                        creditScore: evaluationResult.creditScore,
                        isEligible: evaluationResult.isEligible,
                        explanation: evaluationResult.explanation,
                        violationFlags: evaluationResult.violationFlags,
                    });
                    setAdvice(generatedAdvice);
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Not Found',
                    description: 'No application found with that reference number.',
                });
            }
        } catch (error) {
            console.error("Error fetching document:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to fetch application data.',
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-12">
                        <h1 className="font-headline text-3xl font-bold tracking-tight text-maroon md:text-4xl">
                            Client Portal
                        </h1>
                        <p className="mt-4 text-lg text-gold max-w-3xl mx-auto">
                            Check the status of your loan application.
                        </p>
                    </div>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Check Application Status</CardTitle>
                            <CardDescription>Enter your reference number to view your results.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex w-full items-center space-x-2">
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="referenceNumber">Reference Number</Label>
                                    <Input
                                        id="referenceNumber"
                                        placeholder="e.g., ASENSO-12345"
                                        value={referenceNumber}
                                        onChange={(e) => setReferenceNumber(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                Search
                            </Button>
                        </CardFooter>
                    </Card>

                    {isLoading && !result && (
                        <div className="mt-8 flex justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    )}

                    {result && (
                         <div className="mt-8">
                             <EvaluationResults result={result} advice={advice} showManualOverride={false} />
                         </div>
                    )}
                </div>
            </main>
            <footer className="border-t py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} ASENSO. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
