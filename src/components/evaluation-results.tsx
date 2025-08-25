
'use client';

import type { EvaluateLoanApplicationOutput } from '@/ai/schemas';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, XCircle, Percent, BarChartBig, User, Home, ThumbsUp, ThumbsDown, FileText, Hash, Lightbulb, Loader2, Info } from 'lucide-react';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { useState } from 'react';
import { CreditScoreBreakdown } from './credit-score-breakdown';
import { LoanRecommendations } from './loan-recommendations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '@/lib/utils';

type EvaluationResultsProps = {
  result: EvaluateLoanApplicationOutput;
  showManualOverride?: boolean;
  advice?: string;
};

export function EvaluationResults({ result, showManualOverride = true, advice }: EvaluationResultsProps) {
  const [manualStatus, setManualStatus] = useState<'approved' | 'rejected' | null>(null);

  const eligibilityVariant = result.isEligible ? 'default' : 'destructive';

  const explanationPoints = result.explanation
    .split('*')
    .map(s => s.trim())
    .filter(s => s);
  
  const advicePoints = advice
    ?.split('*')
    .map(s => s.trim())
    .filter(s => s);

  const shouldShowAdvice = !result.isEligible && advice !== undefined;

  return (
    <Card className="w-full bg-card/50">
      <CardHeader>
        <CardTitle>Evaluation Results</CardTitle>
        <CardDescription>Summary of the loan application assessment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Applicant Profile</h3>
          <div className="space-y-3">
             <div className="flex items-center">
              <Hash className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Reference Number</p>
                <p className="font-medium">{result.referenceNumber}</p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{result.fullName}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Home className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{result.address}</p>
              </div>
            </div>
          </div>
        </div>

        {result.loanRequestSummary && (
            <div className="pt-2">
                <h3 className="text-sm font-semibold mb-2 flex items-center"><Info className="mr-2 h-4 w-4" />Client's Request</h3>
                <p className="text-sm text-muted-foreground italic">"{result.loanRequestSummary}"</p>
            </div>
        )}

        {result.documentTypes && result.documentTypes.length > 0 && (
          <div className="pt-2">
            <h3 className="text-sm font-semibold mb-2 flex items-center"><FileText className="mr-2 h-4 w-4" />Documents Identified</h3>
             <div className="flex flex-wrap gap-2">
                {result.documentTypes.map((doc, index) => (
                  <Badge key={index} variant="secondary">{doc}</Badge>
                ))}
              </div>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChartBig className="mr-2 h-5 w-5 text-muted-foreground" />
              <span className="font-medium">AI Credit Score</span>
            </div>
            <span className="font-headline text-2xl font-bold text-primary">{result.creditScore}</span>
          </div>
          <Progress value={result.creditScore / 10} className="h-3" aria-label={`Credit score is ${result.creditScore} out of 1000`} />
          <p className="text-sm text-muted-foreground">The applicant's score on a scale of 0-1000.</p>
        </div>

        {result.creditScoreBreakdown && result.creditScoreBreakdown.length > 0 && (
            <>
                <Separator />
                <CreditScoreBreakdown breakdown={result.creditScoreBreakdown} />
            </>
        )}

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2 rounded-lg border p-4">
              <div className="flex items-center text-muted-foreground">
                <Percent className="mr-2 h-4 w-4" />
                <span>AI Interest Rate</span>
              </div>
              <p className="font-headline text-2xl font-bold">{result.interestRate.toFixed(2)}%</p>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border p-4">
               <div className="flex items-center text-muted-foreground">
                {result.isEligible ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                ) : (
                    <XCircle className="mr-2 h-4 w-4 text-destructive" />
                )}
                <span>AI Eligibility</span>
              </div>
               <Badge variant={eligibilityVariant} className="w-fit text-base">
                {result.isEligible ? 'Approved' : 'Rejected'}
              </Badge>
            </div>
        </div>

        {result.loanRecommendations && result.loanRecommendations.length > 0 && (
          <>
            <Separator />
            <LoanRecommendations recommendations={result.loanRecommendations} />
          </>
        )}

        {result.violationFlags && result.violationFlags.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lending Violations Flagged</AlertTitle>
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-5">
                {result.violationFlags.map((violation, index) => (
                  <li key={index}>{violation}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <Separator />

        <Tabs defaultValue="explanation" className="w-full">
            <TabsList className={cn("grid w-full", shouldShowAdvice ? "grid-cols-2" : "grid-cols-1")}>
                <TabsTrigger value="explanation">AI Explanation</TabsTrigger>
                {shouldShowAdvice && (
                    <TabsTrigger value="advice">Improvement Advice</TabsTrigger>
                )}
            </TabsList>
            <TabsContent value="explanation">
                <div className="text-sm text-foreground/80 bg-muted/50 p-4 rounded-md border mt-2">
                    <ul className="list-disc space-y-2 pl-5">
                    {explanationPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                    ))}
                    </ul>
                </div>
            </TabsContent>
            {shouldShowAdvice && (
                <TabsContent value="advice">
                     <div className="text-sm text-foreground/80 bg-secondary/50 p-4 rounded-md border min-h-[6rem] flex items-center justify-center mt-2">
                        {advice === '' ? (
                            <div className="flex items-center text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Generating personalized advice...</span>
                            </div>
                        ) : advicePoints && advicePoints.length > 0 ? (
                            <ul className="list-disc space-y-2 pl-5">
                                {advicePoints.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>{advice}</p>
                        )}
                    </div>
                </TabsContent>
            )}
        </Tabs>
      </CardContent>
      {showManualOverride && (
      <CardFooter className="flex-col items-start space-y-4 pt-4 border-t">
        <div className='w-full'>
          <h3 className="font-semibold mb-2">Manual Override</h3>
          <div className="flex gap-4">
            <Button onClick={() => setManualStatus('approved')} variant={manualStatus === 'approved' ? 'default' : 'outline'} className="flex-1">
              <ThumbsUp className="mr-2 h-4 w-4" /> Manually Approve
            </Button>
            <Button onClick={() => setManualStatus('rejected')} variant={manualStatus === 'rejected' ? 'destructive' : 'outline'} className="flex-1">
              <ThumbsDown className="mr-2 h-4 w-4" /> Manually Reject
            </Button>
          </div>
        </div>
        {manualStatus && (
          <div className="w-full text-center p-2 bg-secondary rounded-md">
            <p className={cn("font-semibold text-secondary-foreground",
                manualStatus === 'approved' ? 'text-green-600' : 'text-red-600'
            )}>
              Application manually marked as {manualStatus}.
            </p>
          </div>
        )}
      </CardFooter>
      )}
    </Card>
  );
}
