import ReviewProfile from '@/views/ReviewProfile';
import ProtectedRoute from '@/components/ProtectedRoute';
export default function ReviewPage() {
  return <ProtectedRoute><ReviewProfile /></ProtectedRoute>;
}
