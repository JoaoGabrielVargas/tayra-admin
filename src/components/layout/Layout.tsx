import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '../../store/uiStore';

export function Layout({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-linho-100 overflow-x-clip">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div
        className={`flex flex-col min-h-screen min-h-[100dvh] min-w-0 transition-all duration-300 ease-organic ${
          sidebarOpen ? 'md:ml-[256px]' : 'md:ml-[68px]'
        }`}
      >
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 min-w-0 w-full p-3 sm:p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
