
import { PageHeader } from '@/components/shell/page-header';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard & Tasks"
        description="Here's a summary of your workflows and tasks."
      />
      <DashboardClient />
    </>
  );
}
