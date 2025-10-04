
"use client";

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Task } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';

interface MyTasksPageProps {
  tasks: Task[];
}

export default function MyTasksPage({ tasks }: MyTasksPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const searchMatch = debouncedSearchTerm === '' || task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        const statusMatch = status === 'all' || task.status === status;
        return searchMatch && statusMatch;
    });
  }, [tasks, debouncedSearchTerm, status]);


  return (
    <>
      <Card>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search your tasks..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Initiator</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                        <Badge variant={
                            task.status === 'pending' ? 'destructive' :
                            'secondary'
                        }>{task.status}</Badge>
                        </TableCell>
                        <TableCell>{task.initiator.firstName} {task.initiator.lastName}</TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/protected/app/tasks/${task.workflowId}`}>View & Act</Link>
                            </Button>
                        </TableCell>
                        </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
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
