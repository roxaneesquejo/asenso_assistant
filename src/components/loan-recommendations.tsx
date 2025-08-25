
'use client';

import { PiggyBank } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type LoanRecommendation = {
  amount: number;
  term: string;
  monthlyPayment: number;
};

type LoanRecommendationsProps = {
  recommendations: LoanRecommendation[];
};

export function LoanRecommendations({ recommendations }: LoanRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <PiggyBank className="mr-2 h-5 w-5 text-muted-foreground" />
        AI Loan Recommendations
      </h3>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan Amount</TableHead>
              <TableHead>Term</TableHead>
              <TableHead className="text-right">Est. Monthly Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recommendations.map((rec, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{formatCurrency(rec.amount)}</TableCell>
                <TableCell>{rec.term}</TableCell>
                <TableCell className="text-right">{formatCurrency(rec.monthlyPayment)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <p className="text-sm text-muted-foreground mt-2">
        These are suggested loan options based on the applicant's profile.
      </p>
    </div>
  );
}
