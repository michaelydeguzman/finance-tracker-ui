import DarkModeTrigger from "@/components/dark-mode-trigger";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="absolute top-4 right-4">
        <DarkModeTrigger />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
