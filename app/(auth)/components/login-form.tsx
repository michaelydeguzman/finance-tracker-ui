"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { login } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFieldError("Email and password are required.");
      return;
    }
    setFieldError(null);
    setSubmitting(true);
    try {
      await login({ email: trimmedEmail, password });
      toast.success("Signed in.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your finances.
        </CardDescription>
      </CardHeader>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <CardContent className="flex flex-col gap-4">
          {fieldError ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldError}
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              disabled={submitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t-0 pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" />
                Sign in
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
