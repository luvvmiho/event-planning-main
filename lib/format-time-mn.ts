export function formatTimeAgoMn(dateString: string) {
	const now = new Date();
	const date = new Date(dateString);
	const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

	if (diffInHours < 1) return 'Саяхан';
	if (diffInHours < 24) return `${diffInHours} цагийн өмнө`;
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays === 1) return 'Өчигдөр';
	if (diffInDays < 7) return `${diffInDays} өдрийн өмнө`;
	if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} долоо хоногийн өмнө`;
	return `${Math.floor(diffInDays / 30)} сарын өмнө`;
}
