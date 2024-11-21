'use client';

import { Home, Plus, Settings, User, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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

// Menu items with app router paths
const items: MenuItem[] = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const { logout, userData } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login"); // Using Next.js router for navigation
    } catch (error) {
      console.error("Failed to sign out:", error);
      // You might want to show an error notification here
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>atoms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <Link 
                  key={item.title} 
                  href={item.url}
                  className="block mb-2" // Added margin-bottom for spacing
                >
                  <SidebarMenuItem className="flex items-center gap-3 py-2.5"> {/* Increased gap and padding */}
                    <item.icon className="h-5 w-5" /> {/* Increased icon size */}
                    <span className="text-[15px]">{item.title}</span> {/* Increased text size */}
                  </SidebarMenuItem>
                </Link>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/dashboard/new")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
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
                  {userData?.displayName || "User"}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">Billing</Link>
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