
'use client';

import { useState } from 'react';
import { AppLogo } from '@/components/app-logo';
import { LoanEvaluationForm } from '@/components/loan-evaluation-form';
import { EvaluationResults } from '@/components/evaluation-results';
import { SubmissionPreview } from '@/components/submission-preview';
import { Card } from '@/components/ui/card';
import { Loader2, FileSearch, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FormResult } from '@/app/actions';


export default function LoanOfficerDashboard() {
  const [result, setResult] = useState<FormResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResult = (newResult: FormResult | null) => {
    setResult(newResult);
  };

  const handleReset = () => {
    setResult(null);
    setIsLoading(false);
  }

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
              ASENSO Loan Officer Dashboard
          </h1>
          <p className="mt-4 text-lg text-gold max-w-3xl mx-auto">
            AI-Powered Solution Empowering Nascent Small-scale Opportunities 
          </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 md:gap-8 lg:gap-12">
            <div className="flex flex-col items-start gap-4">
              <LoanEvaluationForm onResult={handleResult} onLoadingChange={setIsLoading} onReset={handleReset} />
              {result && !isLoading && (
                <SubmissionPreview 
                  idPhotoDataUris={result.idPhotoDataUris}
                  documentDataUris={result.documentDataUris}
                />
              )}
            </div>
            <div className="flex flex-col items-start gap-4">
              {isLoading && (
                <Card className="flex w-full min-h-[500px] flex-col items-center justify-center p-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Evaluating application...</p>
                </Card>
              )}
              {result && !isLoading && (
                <div className="w-full space-y-4">
                    <EvaluationResults result={result.evaluation} />
                </div>
              )}
              {!result && !isLoading && (
                 <Card className="flex w-full min-h-[500px] flex-col items-center justify-center p-8 border-2 border-dashed">
                  <div className="text-center text-muted-foreground">
                    <FileSearch className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-sm font-semibold text-foreground">Awaiting Evaluation</h3>
                    <p className="mt-1 text-sm">Results will be displayed here.</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
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
