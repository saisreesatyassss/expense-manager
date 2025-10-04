
import { PageHeader } from '@/components/shell/page-header';
import { ReportsClient } from './reports-client';
import { DEPARTMENTS } from '@/lib/data';
import { getUsersFromCookie } from '@/services/user-service';

export default async function ReportsPage() {
  const departments = DEPARTMENTS;
  const usersResponse = await getUsersFromCookie({});
  const users = usersResponse.data.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }));

  // Mock data for the report table
  const departmentReportData = [
    { department: 'Finance', total: 5, pending: 1, approved: 3, rejected: 1 },
    { department: 'Engineering', total: 8, pending: 2, approved: 6, rejected: 0 },
    { department: 'Marketing', total: 3, pending: 0, approved: 2, rejected: 1 },
    { department: 'HR', total: 2, pending: 1, approved: 1, rejected: 0 },
    { department: 'IT', total: 4, pending: 0, approved: 4, rejected: 0 },
    { department: 'Operations', total: 6, pending: 3, approved: 3, rejected: 0 },
    { department: 'Sales', total: 7, pending: 2, approved: 5, rejected: 0 },
    { department: 'Administration', total: 1, pending: 0, approved: 1, rejected: 0 },
  ].map(item => ({
    ...item,
    completionRate: item.total > 0 ? ((item.approved / item.total) * 100) : 0,
  }));

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="View and export system-wide reports."
      />
      <ReportsClient 
        departments={departments}
        users={users}
        initialReportData={departmentReportData}
      />
    </>
  );
}
