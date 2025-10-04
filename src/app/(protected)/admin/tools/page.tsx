import { PageHeader } from '@/components/shell/page-header';
import { AdminToolsClient } from './admin-tools-client';

export default function AdminToolsPage() {
  return (
    <>
      <PageHeader
        title="Admin Tools"
        description="Configure system settings and manage administrative tasks."
      />
      <AdminToolsClient />
    </>
  );
}
