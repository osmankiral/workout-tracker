import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Workout Tracker',
  description: 'Login to your account',
};

export default function LoginPage() {
  return <LoginForm />;
}
