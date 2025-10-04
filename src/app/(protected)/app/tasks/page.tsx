
import { redirect } from 'next/navigation';

export default function TasksPage() {
  redirect('/app/dashboard?tab=my-tasks');
}
