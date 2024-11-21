import React from 'react';
import Nav from '@/components/common/Nav';

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<Nav />
			{children}
		</div>
	);
}