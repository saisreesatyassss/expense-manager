
import { PageHeader } from '@/components/shell/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Upload, File as FileIcon, Folder, Download, Trash2, Eye, Search, FileText, FileImage, FileSpreadsheet } from 'lucide-react';
import { format, subDays } from 'date-fns';

const fileIcons: { [key: string]: React.ElementType } = {
    'pdf': FileText,
    'png': FileImage,
    'jpg': FileImage,
    'xlsx': FileSpreadsheet,
    'default': FileIcon,
};

const MOCK_FILES = [
    { id: 'file-1', name: 'budget_proposal_q1.pdf', type: 'pdf', size: '1.2 MB', lastModified: format(subDays(new Date(), 2), 'PP'), inWorkflow: 'WF-123' },
    { id: 'file-2', name: 'revenue_forecast.xlsx', type: 'xlsx', size: '450 KB', lastModified: format(subDays(new Date(), 2), 'PP'), inWorkflow: 'WF-123' },
    { id: 'file-3', name: 'marketing_asset_banner.png', type: 'png', size: '2.1 MB', lastModified: format(subDays(new Date(), 5), 'PP'), inWorkflow: null },
    { id: 'file-4', name: 'compliance_report_2024.pdf', type: 'pdf', size: '800 KB', lastModified: format(subDays(new Date(), 10), 'PP'), inWorkflow: 'WF-98765' },
    { id: 'file-5', name: 'project_notes.txt', type: 'default', size: '5 KB', lastModified: format(subDays(new Date(), 12), 'PP'), inWorkflow: null },
];

export default function MyFilesPage() {
  return (
    <>
      <PageHeader
        title="My Files"
        description="Browse and manage your uploaded documents and attachments."
      >
        <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <FileIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{MOCK_FILES.length}</div>
                <p className="text-xs text-muted-foreground">All your documents</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">4.55 GB</div>
                <p className="text-xs text-muted-foreground">out of 10 GB</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Repository</CardTitle>
          <CardDescription>A list of all your documents in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4 py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search files..." className="pl-9" />
                </div>
            </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Linked To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_FILES.map((file) => {
                  const Icon = fileIcons[file.type] || fileIcons['default'];
                  return (
                    <TableRow key={file.id}>
                      <TableCell>
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell>{file.lastModified}</TableCell>
                      <TableCell>
                        {file.inWorkflow ? (
                            <Badge variant="secondary">{file.inWorkflow}</Badge>
                        ) : (
                            <span className="text-muted-foreground">-</span>
                        )}
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
                            <DropdownMenuItem><Eye className="mr-2"/>Preview</DropdownMenuItem>
                            <DropdownMenuItem><Download className="mr-2"/>Download</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
