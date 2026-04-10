import Onboarding from '@/views/Onboarding';
import ProtectedRoute from '@/components/ProtectedRoute';
export default function OnboardingPage() {
  return <ProtectedRoute><Onboarding /></ProtectedRoute>;
}
