import { PageHeader } from '@/components/shell/page-header';
import { AddUserForm } from '../add-user-form';
import { DEPARTMENTS, DESIGNATIONS } from '@/lib/data';

export default function AddUserPage() {
  return (
    <>
      <PageHeader
        title="Add New User"
        description="Create a new user account and assign their role and department."
      />
      <AddUserForm
        departments={DEPARTMENTS}
        designations={DESIGNATIONS}
      />
    </>
  );
}
