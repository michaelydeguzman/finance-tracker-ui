"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { signup } from "@/lib/api/auth";
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

const MIN_PASSWORD_LEN = 8;

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || !confirm) {
      setFieldError("All fields are required.");
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      setFieldError(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }
    if (password !== confirm) {
      setFieldError("Passwords do not match.");
      return;
    }
    setFieldError(null);
    setSubmitting(true);
    try {
      await signup({ email: trimmedEmail, password });
      toast.success("Account created.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get started</CardTitle>
        <CardDescription>
          Create an account to track income and expenses.
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
            <label htmlFor="signup-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="signup-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="signup-confirm" className="text-sm font-medium">
              Confirm password
            </label>
            <Input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(ev) => setConfirm(ev.target.value)}
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
                Create account
              </span>
            ) : (
              "Create account"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in instead
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
