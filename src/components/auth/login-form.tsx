
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BASE_MOCK_USERS } from "@/lib/data";
import type { MockUser } from "@/lib/types";

// A client-side fetcher to get users.
async function getClientSideUsers(): Promise<MockUser[]> {
    const usersCookie = Cookies.get('users_data');
    if (usersCookie) {
        try {
            return JSON.parse(usersCookie);
        } catch (e) {
            console.error("Failed to parse users cookie, falling back to base admin", e);
            return BASE_MOCK_USERS; // Fallback on parsing error
        }
    }
    return BASE_MOCK_USERS; // Fallback to base admin if cookie not set
}

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const allUsers = await getClientSideUsers();

      const user = allUsers.find(
        (u: any) => u.username === values.username && u.password === values.password
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const token = `${user.role}:${user.username}`;
      Cookies.set('auth_token', token, { expires: 1, path: '/' }); 

      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      
      const targetUrl = user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard';
      router.push(targetUrl);
      router.refresh();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="jdoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
