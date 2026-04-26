import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/header/header";

export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <main className="w-full flex flex-col min-h-screen justify-center items-center max-w-[1400px] mx-auto">
        <Header />

        <div className="flex flex-col gap-8 flex-grow w-full px-[80px] py-5">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
