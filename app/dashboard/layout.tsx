import { ReactNode } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Kommerce.ai</h1>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/dashboard" className="text-sm hover:underline">
                Dashboard
              </a>
              <a href="/dashboard/clients" className="text-sm hover:underline">
                Clients
              </a>
              <a href="/dashboard/reports" className="text-sm hover:underline">
                Reports
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
