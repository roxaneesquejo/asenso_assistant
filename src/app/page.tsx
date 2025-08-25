
'use client';

import { useActionState } from 'react';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleLogin, type LoginState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

const initialState: LoginState = {
  success: false,
  message: '',
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(handleLogin, initialState);
  const [username, setUsername] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
                <AppLogo />
            </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <Card className="max-w-md mx-auto">
                 <form action={formAction}>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Welcome to ASENSO</CardTitle>
                        <CardDescription>Please sign in to access your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" placeholder="e.g., officer" required onChange={(e) => setUsername(e.target.value)} value={username}/>
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        Login
                      </Button>
                    </CardFooter>
                </form>
            </Card>
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

