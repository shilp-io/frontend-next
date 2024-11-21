// tpyes/user.ts

export interface Regulation {
	id: string;
	title: string;
	description: string;
	code: string;
	version: string;
	createdAt: string;
	updatedAt: string;
	status: "active" | "archived" | "draft";
}

export interface Requirement {
	id: string;
	title: string;
	description: string;
	status: "open" | "in_progress" | "completed" | "blocked";
	priority: "low" | "medium" | "high";
	assignedTo: string[];
	regulationIds: string[];
	createdAt: string;
	updatedAt: string;
	output?: Array<{
		role: "user" | "assistant";
		content: string;
	}>;
	dueDate?: string;
	completedAt?: string;
}

export interface Project {
	id: string;
	title: string;
	description: string;
	status: "active" | "completed" | "archived";
	requirementIds: string[];
	regulationIds: string[];
	members: string[];
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	startDate: string;
	endDate?: string;
}

export interface UserData {
	uid: string;
	email: string;
	displayName?: string;
	photoURL?: string;
	role: "user" | "admin";
	projectIds: string[];
	createdAt: string;
	lastLogin: string;
	emailVerified: boolean;
	phoneNumber?: string;
	department?: string;
	settings: {
		notifications: boolean;
		theme: "light" | "dark";
	};
}

export interface UserContextState {
	userData: UserData | null;
	userProjects: Project[];
	projectRequirements: Record<string, Requirement[]>;
	projectRegulations: Record<string, Regulation[]>;
	isLoading: boolean;
	error: Error | null;
}
