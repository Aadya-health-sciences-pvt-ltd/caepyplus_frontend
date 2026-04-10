import ProfileSubmitted from '@/views/ProfileSubmitted';
import ProtectedRoute from '@/components/ProtectedRoute';
export default function SubmittedPage() {
  return <ProtectedRoute><ProfileSubmitted /></ProtectedRoute>;
}
