import { Suspense } from 'react';
import AdminDoctorDetails from '@/views/admin/AdminDoctorDetails';

export default function AdminDoctorDetailsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <AdminDoctorDetails />
    </Suspense>
  );
}
