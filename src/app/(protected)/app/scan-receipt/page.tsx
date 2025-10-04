import { PageHeader } from '@/components/shell/page-header';
import { ScanReceiptClient } from './scan-receipt-client';

export default function ScanReceiptPage() {
  return (
    <>
      <PageHeader
        title="Scan Receipt"
        description="Upload a receipt image to automatically create an expense entry."
      />
      <ScanReceiptClient />
    </>
  );
}
