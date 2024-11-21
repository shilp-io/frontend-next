import { Home, Plus, Settings, User, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

// Menu items.
const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: paths.dashboard,
    icon: Home,
  },
  {
    title: "Profile", 
    url: paths.profile,
    icon: User,
  },
  {
    title: "Settings",
    url: paths.settings,
    icon: Settings,
  },
];

export function AppSidebar() {
	const { logout, user } = useUser();

	const handleSignOut = async () => {
		try {
			await logout();
			navigate("/login"); // Redirect to login page after logout
		} catch (error) {
			console.error("Failed to sign out:", error);
			// You might want to show an error notification here
		}
	};

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<Link key={item.title} href={item.url}>
									<SidebarMenuItem>
										<item.icon className="h-4 w-4" />
										{item.title}
									</SidebarMenuItem>
								</Link>
							))}
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Button
										variant="outline"
										className="w-full"
										onClick={() =>
											navigate("/dashboard/new")
										}
									>
										<Plus />
										<span>New Requirement</span>
									</Button>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									{user?.name || "User"}
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-[--radix-popper-anchor-width]"
							>
								<DropdownMenuItem>
									<span>Account</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Billing</span>
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={handleSignOut}>
									<span>Sign out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
