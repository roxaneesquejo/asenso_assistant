
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { handleEvaluation, type FormState, type FormResult } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, FileText, Hash, PlusCircle, FolderOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const initialState: FormState = {
  success: false,
  message: '',
};

type LoanEvaluationFormProps = {
  onResult: (result: FormResult | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onReset: () => void;
};

export function LoanEvaluationForm({ onResult, onLoadingChange, onReset }: LoanEvaluationFormProps) {
  const [state, formAction, isPending] = useActionState(handleEvaluation, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [idFileNames, setIdFileNames] = useState<string[]>([]);
  const [docFileNames, setDocFileNames] = useState<string[]>([]);
  const [loanType, setLoanType] = useState<'new' | 'existing'>('new');

  useEffect(() => {
    onLoadingChange(isPending);
  }, [isPending, onLoadingChange]);
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        onResult(state.data ?? null);
      } else {
        toast({
          variant: 'destructive',
          title: 'Evaluation Error',
          description: state.message,
        });
        onResult(null);
      }
    }
  }, [state, toast, onResult]);

  const handleFormReset = () => {
    formRef.current?.reset();
    setIdFileNames([]);
    setDocFileNames([]);
    onReset();
    setLoanType('new');
  }

  const handleTabChange = (value: string) => {
    handleFormReset();
    setLoanType(value as 'new' | 'existing');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Loan Application</CardTitle>
        <CardDescription>Fill in the details to evaluate loan eligibility.</CardDescription>
      </CardHeader>
       <form ref={formRef} action={formAction}>
        <Tabs value={loanType} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new">
                    <PlusCircle className="mr-2 h-4 w-4" /> New Loan
                </TabsTrigger>
                <TabsTrigger value="existing">
                    <FolderOpen className="mr-2 h-4 w-4" /> Existing Loan
                </TabsTrigger>
            </TabsList>
            <input type="hidden" name="loanType" value={loanType} />
            <TabsContent value="new">
                <CardContent className="space-y-6 pt-6">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="typedText-new">Loaner Information</Label>
                        <Textarea
                        placeholder="Please provide loaner details (e.g 500 peso salary per month)"
                        id="typedText-new"
                        name="typedText"
                        rows={4}
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="idPhotos-new">
                        <FileText className="mr-2 inline-block h-4 w-4" />
                        ID Photo(s) 
                        </Label>
                        <Input id="idPhotos-new" name="idPhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setIdFileNames(Array.from(e.target.files || []).map(f => f.name))} />
                        {idFileNames.length > 0 && <p className="text-xs text-muted-foreground">Selected: {idFileNames.join(', ')}</p>}
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="documents-new">
                        <Upload className="mr-2 inline-block h-4 w-4" />
                        Supporting Document(s) 
                        </Label>
                        <Input id="documents-new" name="documents" type="file" accept=".pdf,.doc,.docx,image/*" multiple onChange={(e) => setDocFileNames(Array.from(e.target.files || []).map(f => f.name))} />
                        {docFileNames.length > 0 && <p className="text-xs text-muted-foreground">Selected: {docFileNames.join(', ')}</p>}
                    </div>
                </CardContent>
            </TabsContent>
            <TabsContent value="existing">
                 <CardContent className="space-y-6 pt-6">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="referenceNumber">
                        <Hash className="mr-2 inline-block h-4 w-4" />
                        Reference Number
                        </Label>
                        <Input
                        id="referenceNumber"
                        name="referenceNumber"
                        placeholder="e.g., ASENSO-12345"
                        />
                    </div>
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="typedText-existing">Additional Information</Label>
                        <Textarea
                        placeholder="Add new notes or updates here."
                        id="typedText-existing"
                        name="typedText"
                        rows={4}
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="idPhotos-existing">
                        <FileText className="mr-2 inline-block h-4 w-4" />
                        Add New ID Photo(s) 
                        </Label>
                        <Input id="idPhotos-existing" name="idPhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setIdFileNames(Array.from(e.target.files || []).map(f => f.name))} />
                         {idFileNames.length > 0 && <p className="text-xs text-muted-foreground">Selected: {idFileNames.join(', ')}</p>}
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="documents-existing">
                        <Upload className="mr-2 inline-block h-4 w-4" />
                        Add New Supporting Document(s) 
                        </Label>
                        <Input id="documents-existing" name="documents" type="file" accept=".pdf,.doc,.docx,image/*" multiple onChange={(e) => setDocFileNames(Array.from(e.target.files || []).map(f => f.name))} />
                        {docFileNames.length > 0 && <p className="text-xs text-muted-foreground">Selected: {docFileNames.join(', ')}</p>}
                    </div>
                </CardContent>
            </TabsContent>
        </Tabs>
        <CardFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleFormReset} className="w-1/3">
            Reset
          </Button>
          <Button type="submit" disabled={isPending} className="w-2/3 bg-accent text-accent-foreground hover:bg-accent/90">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Evaluate with AI
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
