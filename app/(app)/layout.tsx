import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/header/header";
import HouseholdBanner from "@/components/household/household-banner";
import { HouseholdProvider } from "@/components/household/household-provider";

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

      {/* One copy of the household state for the whole shell: the banner names it above
          every page's title, and the households page rewrites it. Two fetches would let
          the banner keep naming a household the user has just left. */}
      <HouseholdProvider>
        <main className="flex w-full flex-grow flex-col px-4 py-5 md:px-[80px]">
          <HouseholdBanner />

          {/* The gap lives here rather than on <main> so the banner can sit close to the
              title while pages keep the spacing they were written against. */}
          <div className="flex w-full flex-grow flex-col gap-8">{children}</div>
        </main>
      </HouseholdProvider>
    </div>
  );
}
