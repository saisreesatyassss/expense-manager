
'use client';

import {
  LayoutDashboard,
  FilePlus2,
  ListTodo,
  FolderOpen,
  Users,
  BarChart3,
  Mail,
  Leaf,
  Settings,
  ShieldCheck,
  Wrench,
  File,
  FileCheck2,
  Send,
  User,
  ClipboardPenLine,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronRight } from 'lucide-react';
import type { User as UserType } from '@/lib/types';

const commonClasses = "flex items-center justify-center p-3 mb-4 rounded-full";

interface AppSidebarNavProps {
  user: UserType | null;
}

export function AppSidebarNav({ user }: AppSidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isClient, setIsClient] = useState(false);
  const [currentTab, setCurrentTab] = useState('');

  useEffect(() => {
    setIsClient(true);
    setCurrentTab(searchParams.get('tab') || '');
  }, [searchParams]);

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };
  
  const isTasksActive = (tab: string) => {
      return isClient && pathname === '/app/dashboard' && currentTab === tab;
  }

  const isTasksMenuOpen = isClient && !!user && pathname === '/app/dashboard' && searchParams.has('tab');
  const isWorkflowMenuOpen = isActive('/app/workflows');

  return (
    <>
      <SidebarHeader>
        <Link href={user ? "/app/dashboard" : "/login"} className="flex items-center gap-2">
           <div className={cn(commonClasses, "bg-primary")}>
                <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                Expense Manager
            </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {user && (
            <>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/app/dashboard', true) && !isTasksMenuOpen}
                tooltip="Dashboard"
              >
                <Link href="/app/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <Collapsible asChild defaultOpen={isTasksMenuOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        isActive={isTasksMenuOpen}
                        className="justify-between"
                    >
                        <div className="flex items-center gap-2">
                          <ListTodo />
                          <span>Approvals</span>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent asChild>
                    <SidebarMenuSub>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isTasksActive('my-tasks')}>
                                <Link href="/app/dashboard?tab=my-tasks"><CheckCircle />My Approvals</Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isTasksActive('pooled-tasks')}>
                                <Link href="/app/dashboard?tab=pooled-tasks"><Users />Pooled Approvals</Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isTasksActive('finished-tasks')}>
                                <Link href="/app/dashboard?tab=finished-tasks"><FileCheck2 />Finished</Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isTasksActive('initiated-tasks')}>
                                <Link href="/app/dashboard?tab=initiated-tasks"><Send />My Submissions</Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            </>
          )}
          
          <Collapsible asChild defaultOpen={isWorkflowMenuOpen}>
              <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                      isActive={isWorkflowMenuOpen}
                      className="justify-between"
                  >
                      <div className="flex items-center gap-2">
                          <FilePlus2 />
                          <span>New Expense</span>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                  </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                  <SidebarMenuSub>
                      <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={pathname === '/app/workflows/new'}>
                              <Link href="/app/workflows/new"><FilePlus2 />Submit Expense</Link>
                          </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={pathname === '/app/workflows/nism-approval'}>
                              <Link href="/app/workflows/nism-approval"><ClipboardPenLine />NISM Approval Note</Link>
                          </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                  </SidebarMenuSub>
              </CollapsibleContent>
              </SidebarMenuItem>
          </Collapsible>

          {user && (
            <>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/app/files')}
                tooltip="My Files"
              >
                <Link href="/app/files">
                  <FolderOpen />
                  <span>My Files</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/app/profile')}
                tooltip="User Profile"
              >
                <Link href="/app/profile">
                  <User />
                  <span>User Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <Separator className="my-2" />
        <p className="px-2 text-xs text-muted-foreground">Version 1.0.0</p>
      </SidebarFooter>
    </>
  );
}

export function AdminSidebarNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <SidebarHeader>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className={cn(commonClasses, "bg-primary")}>
                <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-lg font-semibold">
                    Expense Manager
                </span>
                <span className="text-xs text-muted-foreground -mt-1">Admin Panel</span>
            </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/admin/dashboard')}
              tooltip="Dashboard"
            >
              <Link href="/admin/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/admin/users')}
              tooltip="User Management"
            >
              <Link href="/admin/users/list">
                <Users />
                <span>User Management</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/admin/master-options')}
              tooltip="Master Options"
            >
              <Link href="/admin/master-options">
                <Settings />
                <span>Master Options</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/admin/role-assignment')}
              tooltip="Role Assignment"
            >
              <Link href="/admin/role-assignment">
                <ShieldCheck />
                <span>Role Assignment</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/admin/tools')}
              tooltip="Admin Tools"
            >
              <Link href="/admin/tools">
                <Wrench />
                <span>Admin Tools</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/admin/reports')}
              tooltip="Reports"
            >
              <Link href="/admin/reports">
                <BarChart3 />
                <span>Reports</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <Separator className="my-2" />
        <p className="px-2 text-xs text-muted-foreground">Admin Console</p>
      </SidebarFooter>
    </>
  );
}
