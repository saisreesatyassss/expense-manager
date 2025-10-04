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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';

interface Department {
    name: string;
    status: 'Active' | 'Inactive';
}

interface MasterOptionsClientProps {
    initialDepartments: Department[];
}

export function MasterOptionsClient({ initialDepartments }: MasterOptionsClientProps) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Tabs defaultValue="departments" className="w-full">
      <TabsList>
        <TabsTrigger value="departments">Departments</TabsTrigger>
        <TabsTrigger value="designations">Designations</TabsTrigger>
      </TabsList>
      <TabsContent value="departments">
        <Card>
            <CardHeader>
                <CardTitle>Department Master</CardTitle>
                <CardDescription>Manage all departments in the organization</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search departments..." 
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button className="ml-auto w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Department
                    </Button>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                    <TableRow key={dept.name}>
                                        <TableCell className="font-medium">{dept.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={dept.status === 'Active' ? 'secondary' : 'outline'}>{dept.status}</Badge>
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
                                                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No departments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="designations">
        <Card>
            <CardHeader>
                <CardTitle>Designation Master</CardTitle>
                <CardDescription>Manage all designations in the organization</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Designations management UI will be here.</p>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
