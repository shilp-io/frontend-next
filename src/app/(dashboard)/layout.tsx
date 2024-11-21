// src/app/(dashboard)/layout.tsx

import React from "react";
import { Metadata } from "next";
import ThemeToggle from "@/components/common/ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/AppSidebar";
import BackgroundPattern from "@/components/common/BackgroundPattern";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "User dashboard page",
};

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<div className="flex h-screen w-full bg-white dark:bg-dark">
        <div className="bg-white dark:bg-dark-bg-start border-r border-gray-200 dark:border-dark-border min-h-screen">
        <AppSidebar />
        </div>
				<header className="flex-none border-b">
					<div className="flex items-center justify-between p-2">
						<SidebarTrigger />
						<ThemeToggle />
					</div>
				</header>
					<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
						{children}
					</main>
			</div>
    <BackgroundPattern />
		</SidebarProvider>
	);
}
