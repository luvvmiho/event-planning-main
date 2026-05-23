import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LoginForm } from './_components/login-form'

export const metadata = {
  title: 'Нэвтрэх - Nairly',
}

export default function LoginPage() {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <main className='flex flex-1 items-center justify-center bg-linear-to-br from-secondary/30 via-background to-secondary/20 px-4 py-12'>
        <LoginForm />
      </main>
      <Footer />
    </div>
  )
}
