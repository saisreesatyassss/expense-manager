import { PageHeader } from '@/components/shell/page-header';
import { DEPARTMENTS } from '@/lib/data';
import { MasterOptionsClient } from './master-options-client';

export default function MasterOptionsPage() {
  // In a real app, this data would be fetched from an API
  const departments = DEPARTMENTS.map(name => ({
    name,
    status: 'Active'
  }));

  return (
    <>
      <PageHeader
        title="Master Options"
        description="Manage organizational structure and master data"
      />
      <MasterOptionsClient initialDepartments={departments} />
    </>
  );
}
