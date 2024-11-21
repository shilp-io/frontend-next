import { RouteConfig } from "@/types/auth";

export const routeConfigs: RouteConfig[] = [
	// Public routes
	{ path: '/', access: 'public' },
	{ path: '/about', access: 'public' },
	{ path: '/services', access: 'public' },
	{ path: '/contact', access: 'public' },
	{ path: '/pricing', access: 'public' },
	{ path: '/login', access: 'public' },
	{ path: '/register', access: 'public' },
	{ path: '/reset-password', access: 'public' },
	{ path: '/verify-email', access: 'public' },
	
	// Private routes
	{ path: '/dashboard', access: 'private' },
	{ path: '/projects', access: 'private'},
	{ path: '/profile', access: 'private' },
	{ path: '/profile/invoices', access: 'private'},
	{ path: '/settings', access: 'private' },
	
	// Admin routes
	{ path: '/admin', access: 'admin', roles: ['admin'] },
	{ path: '/admin/users', access: 'admin', roles: ['admin'] },
	{ path: '/admin/settings', access: 'admin', roles: ['admin'] }
  ];
  