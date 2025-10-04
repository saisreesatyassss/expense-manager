
"use client"

import { useState, useMemo, useEffect } from 'react';
import type { User, PaginatedResponse } from '@/lib/types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreHorizontal, Edit, Trash2, UserCog } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';


interface UserListClientProps {
    users: User[];
    pagination: PaginatedResponse<any>['pagination'];
    departments: string[];
}

export function UserListClient({ users, pagination, departments }: UserListClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('department') || 'all');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const createQueryString = (params: Record<string, string>) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(params)) {
            if (value) {
                newSearchParams.set(key, value);
            } else {
                newSearchParams.delete(key);
            }
        }
        return newSearchParams.toString();
    }

    useEffect(() => {
        router.push(`${pathname}?${createQueryString({ q: debouncedSearchTerm, page: '1' })}`);
    }, [debouncedSearchTerm, router, pathname]);

    const handleFilterChange = (type: 'department' | 'status', value: string) => {
        const newValue = value === 'all' ? '' : value;
        if (type === 'department') setDepartmentFilter(value);
        if (type === 'status') setStatusFilter(value);
        router.push(`${pathname}?${createQueryString({ [type]: newValue, page: '1' })}`);
    }

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            router.push(`${pathname}?${createQueryString({ page: String(newPage) })}`);
        }
    }

    const getInitials = (firstName: string, lastName:string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

  return (
    <Card>
    <CardHeader>
        <CardTitle>All Users</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search users..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <Select value={departmentFilter} onValueChange={(value) => handleFilterChange('department', value)}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
        </Select>
         <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.avatarUrl} alt={user.username} />
                                <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell className="capitalize font-medium">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant={user.status === 'active' ? 'secondary' : 'outline'}>
                            {user.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><Edit className="mr-2"/>Edit User</DropdownMenuItem>
                                <DropdownMenuItem><UserCog className="mr-2"/>Assign Role</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
    <CardFooter>
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious 
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(pagination.currentPage - 1); }}
                        className={pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink 
                            href="#"
                            onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                            isActive={pagination.currentPage === i + 1}
                        >
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(pagination.currentPage + 1); }}
                        className={pagination.currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    </CardFooter>
  </Card>
  );
}
