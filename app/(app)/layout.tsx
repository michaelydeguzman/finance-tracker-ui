import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/header/header";

export default async function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The middleware already redirects unauthenticated requests; this second
  // check means a middleware misconfiguration cannot expose the app shell.
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col">
      <Header />

      <main className="flex w-full flex-grow flex-col gap-8 px-4 py-5 md:px-[80px]">
        {children}
      </main>
    </div>
  );
}
