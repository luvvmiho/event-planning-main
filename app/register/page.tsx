import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { RegisterForm } from './_components/register-form';

export const metadata = {
	title: 'Бүртгүүлэх - Nairly',
};

export default function RegisterPage() {
	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex flex-1'>
				<div className='relative hidden w-1/2 lg:block'>
					<img
						src='https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
						alt='Elegant event hall'
						className='h-full w-full object-cover'
					/>
					<div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent' />
					<div className='absolute right-12 bottom-12 left-12'>
						<h2 className='text-4xl font-bold text-white'>Nairly</h2>
						<p className='mt-4 text-lg text-white/90'>
							Арга хэмжээ зохион байгуулах, шилдэг үйлчилгээ үзүүлэгчдийг холбох цогц
							платформ.
						</p>
					</div>
				</div>

				<div className='flex w-full items-center justify-center bg-background px-6 py-12 lg:w-1/2'>
					<RegisterForm />
				</div>
			</main>
			<Footer />
		</div>
	);
}
