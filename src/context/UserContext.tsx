// context/UserContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { userService } from "@/services/userService";
import type {
	UserContextState,
	Project,
	Requirement,
	Regulation,
} from "@/types/user";

interface UserContextValue extends UserContextState {
	refreshUserData: () => Promise<void>;
	refreshProjects: () => Promise<void>;
	refreshProjectData: (projectId: string) => Promise<void>;
	addToProject: (projectId: string) => Promise<void>;
	removeFromProject: (projectId: string) => Promise<void>;
	updateSettings: (
		settings: Partial<NonNullable<UserContextState["userData"]>["settings"]>
	) => Promise<void>;
}
import { UserService } from "@/services/userService";

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const { user, userData: authUserData } = useAuth();
	const [state, setState] = useState<UserContextState>({
		userData: null,
		userProjects: [],
		projectRequirements: {},
		projectRegulations: {},
		isLoading: true,
		error: null,
	});

	// Initialize user data when auth state changes
	useEffect(() => {
		const initializeUserData = async () => {
			if (!user || !authUserData) {
				setState((prev) => ({
					...prev,
					userData: null,
					userProjects: [],
					projectRequirements: {},
					projectRegulations: {},
					isLoading: false,
				}));
				return;
			}

			setState((prev) => ({ ...prev, isLoading: true }));

			try {
				// Fetch current user data
				const currentUser = await userService.getUserById(user.uid);
				
				if (!currentUser) {
					throw new Error("Failed to fetch user data");
				}

				// Set initial user data from auth context with required fields
				setState((prev) => ({
					...prev,
					userData: {
						...authUserData,
						projectIds: currentUser.projectIds || [],
						settings: currentUser.settings || {
							notifications: true,
							theme: "light"
						},
						createdAt: authUserData.createdAt || new Date().toISOString(),
						lastLogin: new Date().toISOString(),
						emailVerified: user.emailVerified,
						role: authUserData.role || "user"
					},
					isLoading: false,
				}));
			} catch (error) {
				setState((prev) => ({
					...prev,
					error: error as Error,
					isLoading: false,
				}));
			}
		};

		initializeUserData();
	}, [user, authUserData]);

	// Load projects when userData changes
	useEffect(() => {
		const loadProjects = async () => {
			if (!state.userData?.projectIds?.length) {
				setState((prev) => ({
					...prev,
					userProjects: [],
					isLoading: false,
				}));
				return;
			}

			setState((prev) => ({ ...prev, isLoading: true }));

			try {
				const projects = await userService.getUserProjects(
					state.userData.projectIds
				);
				setState((prev) => ({
					...prev,
					userProjects: projects,
					isLoading: false,
				}));
			} catch (error) {
				setState((prev) => ({
					...prev,
					error: error as Error,
					isLoading: false,
				}));
			}
		};

		if (state.userData) {
			loadProjects();
		}
	}, [state.userData?.projectIds]);

	// Load project requirements and regulations when projects change
	useEffect(() => {
		const loadProjectData = async () => {
			if (!state.userProjects.length) {
				setState((prev) => ({
					...prev,
					projectRequirements: {},
					projectRegulations: {},
					isLoading: false,
				}));
				return;
			}

			setState((prev) => ({ ...prev, isLoading: true }));

			try {
				const requirementsPromises = state.userProjects.map(
					async (project) => {
						const requirements =
							await userService.getProjectRequirements(
								project.id
							);
						return [project.id, requirements] as [
							string,
							Requirement[]
						];
					}
				);

				const regulationsPromises = state.userProjects.map(
					async (project) => {
						const regulations =
							await userService.getProjectRegulations(
								project.id
							);
						return [project.id, regulations] as [
							string,
							Regulation[]
						];
					}
				);

				const [requirementsEntries, regulationsEntries] =
					await Promise.all([
						Promise.all(requirementsPromises),
						Promise.all(regulationsPromises),
					]);

				setState((prev) => ({
					...prev,
					projectRequirements:
						Object.fromEntries(requirementsEntries),
					projectRegulations: Object.fromEntries(regulationsEntries),
					isLoading: false,
				}));
			} catch (error) {
				setState((prev) => ({
					...prev,
					error: error as Error,
					isLoading: false,
				}));
			}
		};

		loadProjectData();
	}, [state.userProjects]);

	const refreshUserData = async () => {
		if (!user?.uid) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			const userData = await userService.getUserById(user.uid);
			setState((prev) => ({
				...prev,
				userData,
				isLoading: false,
			}));
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	};

	// Rest of the methods remain the same...
	const refreshProjects = async () => {
		if (!state.userData?.projectIds?.length) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			const projects = await userService.getUserProjects(
				state.userData.projectIds
			);
			setState((prev) => ({
				...prev,
				userProjects: projects,
				isLoading: false,
			}));
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	};

	const refreshProjectData = async (projectId: string) => {
		if (!projectId) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			const requirements = await userService.getProjectRequirements(
				projectId
			);
			const regulations = await userService.getProjectRegulations(
				projectId
			);

			setState((prev) => ({
				...prev,
				projectRequirements: {
					...prev.projectRequirements,
					[projectId]: requirements,
				},
				projectRegulations: {
					...prev.projectRegulations,
					[projectId]: regulations,
				},
				isLoading: false,
			}));
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	};

	const addToProject = async (projectId: string) => {
		if (!user?.uid || !projectId) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			await userService.addUserToProject(user.uid, projectId);
			await refreshUserData();
			await refreshProjects();
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	};

	const removeFromProject = async (projectId: string) => {
		if (!user?.uid || !projectId) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			await userService.removeUserFromProject(user.uid, projectId);
			await refreshUserData();
			await refreshProjects();
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	};

	const updateSettings = async (
		settings: Partial<NonNullable<UserContextState["userData"]>["settings"]>
	) => {
		if (!user?.uid) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			await userService.updateUserSettings(user.uid, settings);
			await refreshUserData();
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	};

	return (
		<UserContext.Provider
			value={{
				...state,
				refreshUserData,
				refreshProjects,
				refreshProjectData,
				addToProject,
				removeFromProject,
				updateSettings,
			}}
		>
			{!state.isLoading && children}
		</UserContext.Provider>
	);
}

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
