import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Login — WildWise',
  description: 'Sign in or register as a licensed Michigan wildlife rehabilitator.',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  return <LoginForm searchParams={searchParams} />
}
