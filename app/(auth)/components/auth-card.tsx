import type { ReactNode } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Shared shell for every signed-out screen, so they read as one flow rather than five pages. */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {children}
        {footer ? (
          <div className="text-muted-foreground flex flex-col gap-1 text-sm">
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** A dashed-border status panel — the shape already used for the sign-in notices. */
export function AuthNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const toneClasses =
    tone === "error"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : tone === "success"
        ? "border-border bg-muted/40 text-foreground"
        : "border-border text-muted-foreground border-dashed";

  return (
    <p
      className={`rounded-md border px-3 py-2 text-sm ${toneClasses}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hover:text-foreground underline underline-offset-4"
    >
      {children}
    </Link>
  );
}
