
import { redirect } from 'next/navigation';

export default function UserManagementPage() {
  redirect('/admin/users/list');
}
