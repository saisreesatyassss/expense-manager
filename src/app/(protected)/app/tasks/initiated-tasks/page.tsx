
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Badge } from '@/components/ui/badge';
  import { Progress } from '@/components/ui/progress';
  import { Input } from '@/components/ui/input';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import type { Task } from '@/lib/types';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';


interface InitiatedTasksPageProps {
    tasks?: Task[];
}

export default function InitiatedTasksPage({ tasks = [] }: InitiatedTasksPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const searchMatch = debouncedSearchTerm === '' || task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const statusMatch = statusFilter === 'all' || task.status === statusFilter;
            const typeMatch = typeFilter === 'all' || task.type === typeFilter;
            return searchMatch && statusMatch && typeMatch;
        });
    }, [tasks, debouncedSearchTerm, statusFilter, typeFilter]);

  return (
    <Card>
    <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Submitted Expenses ({tasks.length})</CardTitle>
        <Button asChild>
            <Link href="/app/workflows/new">
                <PlusCircle className="mr-2"/>
                New Expense
            </Link>
        </Button>
    </CardHeader>
    <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search submitted expenses..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Expense Report">Expense Report</SelectItem>
                    <SelectItem value="NISM Approval">NISM Approval</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Expense Report</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Current Stage</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTasks.length > 0 ? filteredTasks.map(task => (
                        <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell>{task.type}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    task.status === 'completed' || task.status === 'approved' ? 'secondary' :
                                    task.status === 'rejected' ? 'destructive' : 'default'
                                }>{task.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Progress value={task.progress} className="h-2 w-20" />
                                    <span className="text-xs text-muted-foreground">{task.progress}%</span>
                                </div>
                            </TableCell>
                            <TableCell>{task.currentStage}</TableCell>
                            <TableCell>{task.createdAt}</TableCell>
                            <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/app/tasks/${task.workflowId}`}>View Details</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Continue Editing</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Withdraw</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No submitted expenses found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    </CardContent>
    </Card>
  );
}
