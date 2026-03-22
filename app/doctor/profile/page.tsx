import ProfileView from '@/views/ProfileView';
import ProtectedRoute from '@/components/ProtectedRoute';
export default function ProfilePage() {
  return <ProtectedRoute><ProfileView /></ProtectedRoute>;
}
