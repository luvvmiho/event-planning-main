import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
	title: 'Nairly - Event Planning Platform',
	description:
		'A comprehensive platform connecting event planners with premium venues and services for weddings, birthdays, anniversaries, and more.',
	generator: 'v0.app',
	icons: {
		icon: [
			{
				url: '/icon-light-32x32.png',
				media: '(prefers-color-scheme: light)',
			},
			{
				url: '/icon-dark-32x32.png',
				media: '(prefers-color-scheme: dark)',
			},
			{
				url: '/icon.svg',
				type: 'image/svg+xml',
			},
		],
		apple: '/apple-icon.png',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' className={`${inter.variable} bg-background`}>
			<body className='font-sans antialiased'>
				<NuqsAdapter defaultOptions={{ shallow: false }}>{children}</NuqsAdapter>
				<Toaster richColors position='top-center' />
				{process.env.NODE_ENV === 'production' && <Analytics />}
			</body>
		</html>
	);
}
