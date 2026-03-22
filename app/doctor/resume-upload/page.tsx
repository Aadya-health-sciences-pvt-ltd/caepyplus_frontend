import ResumeUpload from '@/views/ResumeUpload';
import ProtectedRoute from '@/components/ProtectedRoute';
export default function ResumeUploadPage() {
  return <ProtectedRoute><ResumeUpload /></ProtectedRoute>;
}
