
"use client";

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Download, BarChart2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ReportData {
    department: string;
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completionRate: number;
}

interface ReportsClientProps {
    departments: string[];
    users: { id: string; name: string; }[];
    initialReportData: ReportData[];
}

export function ReportsClient({ departments, users, initialReportData }: ReportsClientProps) {
  const [reportData, setReportData] = useState<ReportData[]>(initialReportData);
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 1));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');

  const handleApplyFilters = () => {
    // In a real app, this would trigger an API call.
    // Here we just simulate filtering the initial data.
    let filteredData = initialReportData;

    if (selectedDepartment !== 'all') {
      filteredData = filteredData.filter(d => d.department === selectedDepartment);
    }
    
    // User filtering is not applied here as the current data is not user-specific.
    // This is where you would add logic to filter by user if the data supported it.
    
    setReportData(filteredData);
  };

  const handleExport = () => {
    const headers = "Department,Total Workflows,Pending,Approved,Rejected,Completion Rate (%)";
    const csvRows = [headers];

    reportData.forEach(row => {
        const values = [
            `"${row.department}"`,
            row.total,
            row.pending,
            row.approved,
            row.rejected,
            row.completionRate.toFixed(0)
        ];
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `department-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalWorkflows = reportData.reduce((acc, item) => acc + item.total, 0);
  const totalApproved = reportData.reduce((acc, item) => acc + item.approved, 0);
  const overallCompletionRate = totalWorkflows > 0 ? (totalApproved / totalWorkflows) * 100 : 0;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Report Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("justify-start text-left font-normal", !fromDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fromDate ? format(fromDate, "PPP") : <span>From Date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={fromDate} onSelect={setFromDate} /></PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("justify-start text-left font-normal", !toDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {toDate ? format(toDate, "PPP") : <span>To Date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={toDate} onSelect={setToDate} /></PopoverContent>
                </Popover>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger><SelectValue placeholder="All Users" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </CardContent>
             <CardFooter>
                <Button onClick={handleApplyFilters} className="ml-auto">
                    <Filter className="mr-2 h-4 w-4" /> Apply Filters
                </Button>
            </CardFooter>
        </Card>
        
        <Tabs defaultValue="department">
            <TabsList>
                <TabsTrigger value="department">Department Reports</TabsTrigger>
                <TabsTrigger value="user">User Reports</TabsTrigger>
                <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="department" className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Statistics</CardTitle>
                        <BarChart2 className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                                <p className="text-2xl font-bold">{totalWorkflows}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Overall Completion Rate</p>
                                <div className="flex items-center gap-2">
                                    <Progress value={overallCompletionRate} className="h-2" />
                                    <p className="text-xl font-bold">{overallCompletionRate.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Department Wise Workflow Report</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Total Workflows</TableHead>
                                        <TableHead>Pending</TableHead>
                                        <TableHead>Approved</TableHead>
                                        <TableHead>Rejected</TableHead>
                                        <TableHead>Completion Rate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.length > 0 ? (
                                        reportData.map((row) => (
                                            <TableRow key={row.department}>
                                                <TableCell className="font-medium">{row.department}</TableCell>
                                                <TableCell>{row.total}</TableCell>
                                                <TableCell>{row.pending}</TableCell>
                                                <TableCell>{row.approved}</TableCell>
                                                <TableCell>{row.rejected}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={row.completionRate} className="h-2 w-20" />
                                                        <span>{row.completionRate.toFixed(0)}%</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No data found for the selected filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="user">
                <Card>
                    <CardHeader><CardTitle>User Reports</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">User-wise report data will appear here.</p></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="audit">
                 <Card>
                    <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Audit log viewer will appear here.</p></CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

    
