
"use client";

import { PageHeader } from '@/components/shell/page-header';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

const MOCK_POOLED_TASKS = [
    {
        id: 'pt-001',
        title: 'Vendor Onboarding KYC',
        department: 'Finance',
        initiatedBy: 'HR Department',
        initiatedDate: format(subDays(new Date(), 1), 'PP'),
        reason: 'New vendor contract',
    },
    {
        id: 'pt-002',
        title: 'IT Asset Decommission Request',
        department: 'IT',
        initiatedBy: 'Admin Department',
        initiatedDate: format(subDays(new Date(), 3), 'PP'),
        reason: 'Employee offboarding',
    },
    {
        id: 'pt-003',
        title: 'Marketing Collateral Review',
        department: 'Marketing',
        initiatedBy: 'Sales Team',
        initiatedDate: format(subDays(new Date(), 5), 'PP'),
        reason: 'New product launch',
    },
];


export default function PooledTasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredTasks = useMemo(() => {
    return MOCK_POOLED_TASKS.filter(task => {
        return debouncedSearchTerm === '' ||
            task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            task.department.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            task.reason.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    });
  }, [debouncedSearchTerm]);


  return (
    <>
      <PageHeader
        title="Pooled Tasks"
        description="Tasks available for you or your team to claim and complete."
      />
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Available Tasks in Your Pool</span>
                <div className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{MOCK_POOLED_TASKS.length} Tasks</span>
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4 py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search pooled tasks..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task Title</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Initiated By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-xs text-muted-foreground">{task.reason}</div>
                                    </TableCell>
                                    <TableCell>{task.department}</TableCell>
                                    <TableCell>{task.initiatedBy}</TableCell>
                                    <TableCell>{task.initiatedDate}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">Claim Task</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No tasks found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
