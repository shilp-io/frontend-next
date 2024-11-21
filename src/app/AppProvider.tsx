// src/app/ClientLayout.tsx
"use client";

import { type ReactNode } from "react";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { DataProvider } from "@/context/DataContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});

const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

// Create the query client outside the component
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

interface AppProviderProps {
	children: ReactNode;
}

const cacheConfig = {
	ttl: 60 * 1000,
	maxSize: 100,
	priority: "medium" as const,
};

export default function AppProvider({ children }: AppProviderProps) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable}`}
		>
			<body className="min-h-screen bg-white dark:bg-gray-900">
				<AuthProvider>
					<UserProvider>
						<QueryClientProvider client={queryClient}>
							<DataProvider cacheConfig={cacheConfig}>
								<ThemeProvider>{children}</ThemeProvider>
							</DataProvider>
							<ReactQueryDevtools initialIsOpen={false} />
						</QueryClientProvider>
					</UserProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
