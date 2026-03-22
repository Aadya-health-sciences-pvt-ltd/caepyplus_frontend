import ProfileSummary from '@/views/ProfileSummary';
import ProtectedRoute from '@/components/ProtectedRoute';
export default function ProfileSummaryPage() {
  return <ProtectedRoute><ProfileSummary /></ProtectedRoute>;
}
