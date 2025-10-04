
import { PageHeader } from '@/components/shell/page-header';
import { ChangePasswordForm } from '@/components/auth/change-password-form';

export default function ChangePasswordPage() {
  return (
    <>
      <PageHeader
        title="Change Password"
        description="Update your account password below."
      />
      <div className="max-w-xl mx-auto">
        <ChangePasswordForm />
      </div>
    </>
  );
}
