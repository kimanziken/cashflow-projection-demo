'use client';

import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { EyeIcon, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { auth } from '../firebase/firebaseConfig';

const SignInSchema = z.object({
  password: z.string().min(1),
  email: z.string().min(1),
});

type SignInSchemaType = z.infer<typeof SignInSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
  });

  function onSubmit({ password, email }: SignInSchemaType) {
    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .catch((e) => {
        toast.error((e as Error).message, {
          duration: 5000,
        });
      })
      .then((val) => {
        if (val) {
          router.push('/');
        } else {
          toast.error('Login failed');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl rounded-lg bg-white px-6 py-8 shadow-lg">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>to continue to flowmaster</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              className="text-h1 flex w-full flex-col items-center gap-6"
              id="sign-in-form"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full space-y-1">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        className="h-12"
                        id="email"
                        placeholder="Enter email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full space-y-1">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="h-12"
                          id="password"
                          placeholder="Enter your password"
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 transform pt-2">
                          <button
                            className="focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            type="button"
                          >
                            {showPassword ? (
                              <EyeOff
                                className="text-muted-foreground"
                                size={22}
                              />
                            ) : (
                              <EyeIcon
                                className="text-muted-foreground"
                                size={22}
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="h-12 w-full"
                disabled={loading}
                type="submit"
                variant="default"
              >
                Sign in
              </Button>
            </form>
          </Form>
        </CardContent>
      </div>
    </div>
  );
}
