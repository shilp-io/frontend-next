import Nav from "@/components/common/Nav";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<Nav />
			{children}
		</div>
	);
}
