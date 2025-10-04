
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CheckCircle, XCircle, FileCheck2, MoreHorizontal } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

const FINISHED_TASKS = [
    {
        id: 'wf-001',
        title: 'Q1 Travel Expenses',
        description: 'Reimbursement for quarterly business travel',
        type: 'reimbursement',
        finalStatus: 'approved',
        completedBy: 'John Smith',
        completedDate: '2024-01-15',
        duration: '5 days',
        acknowledgedBy: 'Finance Dept',
        acknowledgedDate: '2024-01-16'
    },
    {
        id: 'wf-002',
        title: 'New Hardware Purchase',
        description: 'Approval for new development laptops',
        type: 'purchase-order',
        finalStatus: 'rejected',
        completedBy: 'Sarah Wilson',
        completedDate: '2024-01-12',
        duration: '3 days',
        acknowledgedBy: 'Manager',
        acknowledgedDate: '2024-01-13'
    },
    {
        id: 'wf-003',
        title: 'Software Subscription Renewal',
        description: 'Renewal of team-wide software licenses',
        type: 'subscription',
        finalStatus: 'completed',
        completedBy: 'David Lee',
        completedDate: '2024-01-10',
        duration: '7 days',
        acknowledgedBy: 'IT Dept',
        acknowledgedDate: '2024-01-11'
    },
    {
        id: 'wf-004',
        title: 'Client Dinner Expense',
        description: 'Expense report for client entertainment',
        type: 'reimbursement',
        finalStatus: 'approved',
        completedBy: 'Anna Brown',
        completedDate: '2024-01-08',
        duration: '2 days',
        acknowledgedBy: 'Finance Dept',
        acknowledgedDate: '2024-01-09'
    },
];

export default function FinishedTasksPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredTasks = useMemo(() => {
        return FINISHED_TASKS.filter(task => {
            const searchMatch = debouncedSearchTerm === '' ||
                task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const statusMatch = statusFilter === 'all' || task.finalStatus === statusFilter;
            const typeMatch = typeFilter === 'all' || task.type === typeFilter;
            return searchMatch && statusMatch && typeMatch;
        });
    }, [debouncedSearchTerm, statusFilter, typeFilter]);

  return (
      <Card>
        <CardHeader>
            <CardTitle>Completed and Acknowledged Expenses</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search finished expenses..." 
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
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="reimbursement">Reimbursement</SelectItem>
                        <SelectItem value="purchase-order">Purchase Order</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Expense Report</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Final Status</TableHead>
                            <TableHead>Completed By</TableHead>
                            <TableHead>Acknowledged</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length > 0 ? filteredTasks.map(task => (
                            <TableRow key={task.id}>
                                <TableCell>
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-xs text-muted-foreground">{task.description}</div>
                                </TableCell>
                                <TableCell className="capitalize">{task.type}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        task.finalStatus === 'approved' || task.finalStatus === 'completed' ? 'secondary' :
                                        task.finalStatus === 'rejected' ? 'destructive' : 'default'
                                    }>{task.finalStatus}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div>{task.completedBy}</div>
                                    <div className="text-xs text-muted-foreground">{task.completedDate}</div>
                                </TableCell>
                                <TableCell>
                                    <div>{task.acknowledgedBy}</div>
                                    <div className="text-xs text-muted-foreground">{task.acknowledgedDate}</div>
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
                                        <DropdownMenuItem>View Audit Trail</DropdownMenuItem>
                                        <DropdownMenuItem>Download Report</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No expenses found.
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
