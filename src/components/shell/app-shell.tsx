
'use client';

import type { User } from '@/lib/types';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Header } from '@/components/shell/header';
import { AppSidebarNav, AdminSidebarNav } from './sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppShellProps {
  user: User | null;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar side="left" collapsible="icon">
        {isAdminPath ? <AdminSidebarNav /> : <AppSidebarNav user={user} />}
      </Sidebar>
      <SidebarInset>
        <Header user={user} />
        <main className="p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
