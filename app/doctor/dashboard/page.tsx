import { redirect } from 'next/navigation';

/** Legacy route — canonical doctor dashboard is `/doctor/profile`. */
export default function DoctorDashboardRedirect() {
  redirect('/doctor/profile');
}
